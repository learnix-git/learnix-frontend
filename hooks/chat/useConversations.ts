"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { getSocket, subscribeSocketState } from "@/lib/chat/socket";
import { isSocketMessageNew, normalizeMessage } from "@/lib/chat/normalize";
import { usePeerCache } from "@/lib/stores/peerCache";
import type { ChatConversation } from "@/lib/chat/types";

function chatTime(value: string | null): number {
  if (!value) return 0;
  const parsed = new Date(value.replace(" ", "T")).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function previewFor(type: string, content: string | null): string {
  if (type === "text") return content || "";
  if (type === "image") return "Hình ảnh";
  return "Tệp đính kèm";
}

export function useConversations(
  myId: number,
  activeConversationId?: number | null,
  typeFilter?: "direct" | "project" | "service"
) {
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const setPeers = usePeerCache((s) => s.setPeers);
  const activeConversationIdRef = useRef<number | null | undefined>(
    activeConversationId
  );

  activeConversationIdRef.current = activeConversationId;

  const conversationIds = useMemo(
    () =>
      items
        .map((conversation) => conversation.id)
        .filter((id) => Number.isFinite(id) && id > 0),
    [items]
  );
  const conversationIdsKey = conversationIds.join(",");

  const refresh = useCallback(async () => {
    try {
      const res = await ChatAPI.listConversations(
        typeFilter ? { type: typeFilter } : {}
      );
      if (res.code === 200 && Array.isArray(res.data.items)) {
        setItems(res.data.items);
        setPeers(
          res.data.items
            .filter((conversation) => conversation.peer)
            .map((conversation) => conversation.peer!)
        );
      }
    } catch {
      // Keep the previous list while a transient request fails.
    } finally {
      setLoading(false);
    }
  }, [setPeers, typeFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!activeConversationId) return;
    setItems((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  }, [activeConversationId]);

  useEffect(() => {
    let detach: (() => void) | null = null;
    let attachedSocket: unknown = null;

    const attach = () => {
      const socket = getSocket();
      if (!socket || attachedSocket === socket) return;
      detach?.();

      const onNew = (raw: unknown) => {
        if (!isSocketMessageNew(raw)) return;
        const message = normalizeMessage(raw);
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
              conversation.id === activeConversationIdRef.current;
            return {
              ...conversation,
              lastMessageAt: message.createdAt,
              lastMessagePreview: previewFor(message.type, message.content),
              unreadCount:
                isMine || isActive ? 0 : conversation.unreadCount + 1,
            };
          });

          return updated.sort(
            (a, b) => chatTime(b.lastMessageAt) - chatTime(a.lastMessageAt)
          );
        });
      };

      socket.on("message:new", onNew);
      attachedSocket = socket;
      detach = () => socket.off("message:new", onNew);
    };

    attach();
    const unsubscribe = subscribeSocketState((state) => {
      if (state === "connected") attach();
    });

    return () => {
      detach?.();
      unsubscribe();
    };
  }, [myId, refresh]);

  useEffect(() => {
    if (conversationIds.length === 0) return;

    const joinVisibleConversations = () => {
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

    joinVisibleConversations();
    const unsubscribe = subscribeSocketState((state) => {
      if (state === "connected") joinVisibleConversations();
    });

    return () => {
      unsubscribe();
    };
    // Re-run when list membership or selected conversation changes. ChatWindow cleanup can
    // leave a room that the list still needs, so the list re-joins its visible rooms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, conversationIdsKey]);

  return { items, loading, refresh };
}
