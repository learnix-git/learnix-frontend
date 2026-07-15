"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { getSocket, subscribeSocketState } from "@/lib/chat/socket";
import { CheckMessage, NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/cache";
import type { ChatConversation } from "@/lib/chat/types";

// ! Dùng để sắp xếp danh sách chat theo thứ tự tin nhắn mới nhất ở trên
function SortTime(value: string | null): number {
  if (!value) return 0;
  const parsed = new Date(value.replace(" ", "T")).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

// ! Tạo nội dung preview cho tin nhắn cuối cùng
function ChatPreview(type: string, content: string | null): string {
  if (type === "text") return content || "";
  if (type === "image") return "Hình ảnh";
  return "Tệp đính kèm";
}

export function useChatConversations(
  myId: string,
  conversationId?: string | null,
  type?: "direct" | "course"
) {
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const setPeers = Cache((s) => s.setPeers);
  const conversationIdRef = useRef<string | null | undefined>(
    conversationId
  );

  conversationIdRef.current = conversationId;

  const conversationIds = useMemo(
    () =>
      items
        .map((conversation) => conversation.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    [items]
  );
  const conversationIdsKey = conversationIds.join(",");

  // ! Tải danh sách ban đầu
  const refresh = useCallback(async () => {
    try {
      // Lấy tất cả cuộc trò chuyện
      const res = await ChatAPI.FilterConversation(
        type ? { type: type } : {}
      );

      if (res.code === 200 && Array.isArray(res.data?.items)) {
        setItems(res.data.items);
        setPeers(
          res.data.items
            .filter((conversation) => conversation.peer)
            .map((conversation) => conversation.peer!)
        );
      }
    } catch {
      // Keep the previous list while a transient request fails
    } finally {
      setLoading(false);
    }
  }, [setPeers, type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ! Đánh dấu đã đọc khi mở chat
  useEffect(() => {
    if (!conversationId) return;
    setItems((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  }, [conversationId]);

  // ! Xử lý tin nhắn mới realtime
  useEffect(() => {
    let detached: (() => void) | null = null;
    let attached: unknown = null;

    const attach = () => {
      const socket = getSocket();
      if (!socket || attached === socket) return;
      detached?.();

      const onNew = (raw: unknown) => {
        if (!CheckMessage(raw)) return;
        const message = NormalizeMessage(raw);
        if (!message) return;

        setItems((prev) => {
          const exists = prev.some(
            (conversation) => conversation.id === message.conversationId
          );
          if (!exists) {
            refresh();
            return prev;
          }

          const isMine = message.sender.id === myId;
          const updated = prev.map((conversation) => {
            if (conversation.id !== message.conversationId) {
              return conversation;
            }

            const isActive =
              conversation.id === conversationIdRef.current;
            return {
              ...conversation,
              lastMessageAt: message.createdAt,
              lastMessagePreview: ChatPreview(message.type, message.content),
              unreadCount:
                isMine || isActive ? 0 : conversation.unreadCount + 1,
            };
          });

          return updated.sort(
            (a, b) => SortTime(b.lastMessageAt) - SortTime(a.lastMessageAt)
          );
        });
      };

      socket.on("message:new", onNew);
      attached = socket;
      detached = () => socket.off("message:new", onNew);
    };

    attach();
    const unsubscribe = subscribeSocketState((state) => {
      if (state === "connected") attach();
    });

    return () => {
      detached?.();
      unsubscribe();
    };
  }, [myId, refresh]);

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const JoinConversation = () => {
      const socket = getSocket();
      if (!socket?.connected) return;

      conversationIds.forEach((conversationId) => {
        socket.emit(
          "conversation:join",
          { conversationId },
          (ack?: { ok?: boolean; error?: string }) => {
            if (ack?.ok === false) {
              console.warn(
                "[chat] list join failed conversationId=" + conversationId,
                ack.error
              );
            }
          }
        );
      });
    };

    JoinConversation();
    const unsubscribe = subscribeSocketState((state) => {
      if (state === "connected") JoinConversation();
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, conversationIdsKey]);

  return { items, loading, refresh };
}