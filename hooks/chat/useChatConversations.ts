"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { GetSocket, SubscribeSocketStatus } from "@/lib/chat/socket";
import { CheckMessage, NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/chat";
import type { ChatConversation } from "@/lib/chat/types";

// Hàm chuyển thời gian sang timestamp để sắp xếp
function SortTime(value: string | null): number {
  // Không có thời gian
  if (!value)
    return 0;

  const parsed = new Date(value.replace(" ", "T")).getTime();

  // Trả về timestamp hợp lệ
  return Number.isFinite(parsed) ? parsed : 0;
}

// Hàm tạo nội dung xem trước của tin nhắn
function ChatPreview(type: string, content: string | null): string {
  // Tin nhắn văn bản
  if (type === "text")
    return content || "";

  // Tin nhắn hình ảnh
  if (type === "image")
    return "Hình ảnh";

  // Tin nhắn tệp
  return "Tệp đính kèm";
}

export function useChatConversations(
  myId: string,
  conversationId?: string | null,
  type?: "direct" | "course"
) {
  // Danh sách cuộc trò chuyện
  const [items, setItems] = useState<ChatConversation[]>([]);

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Lưu thông tin người dùng vào cache
  const setPeers = Cache((s) => s.setPeers);

  // Lưu cuộc trò chuyện đang mở
  const conversationIdRef = useRef<string | null | undefined>(
    conversationId
  );

  conversationIdRef.current = conversationId;

  // Danh sách id cuộc trò chuyện
  const conversationIds = useMemo(
    () =>
      items
        .map((conversation) => conversation.id)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.length > 0
        ),
    [items]
  );

  // Tạo key theo dõi khi danh sách cuộc trò chuyện thay đổi
  const conversationIdsKey = conversationIds.join(",");

  // Tải danh sách cuộc trò chuyện
  const Refresh = useCallback(async () => {
    try {
      const res = await ChatAPI.FilterConversation(
        type ? { type } : {}
      );

      if (res.code === 200 && Array.isArray(res.data?.items)) {
        setItems(res.data.items);

        // Lưu thông tin peer vào cache
        setPeers(
          res.data.items
            .filter((conversation) => conversation.peer)
            .map((conversation) => conversation.peer!)
        );
      }
    } catch {
      // Giữ nguyên dữ liệu cũ nếu tải thất bại
    } finally {
      setLoading(false);
    }
  }, [setPeers, type]);

  // Tải danh sách khi hook khởi tạo
  useEffect(() => {
    Refresh();
  }, [Refresh]);

  // Đánh dấu đã đọc khi mở cuộc trò chuyện
  useEffect(() => {
    if (!conversationId)
      return;

    setItems((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation
      )
    );
  }, [conversationId]);

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    let detached: (() => void) | null = null;
    let attached: unknown = null;

    // Gắn sự kiện nhận tin nhắn mới
    const AttachSocket = () => {
      const socket = GetSocket();

      if (!socket || attached === socket)
        return;

      detached?.();

      const OnNew = (raw: unknown) => {
        // Kiểm tra dữ liệu hợp lệ
        if (!CheckMessage(raw))
          return;

        const message = NormalizeMessage(raw);

        if (!message)
          return;

        setItems((prev) => {
          // Nếu chưa có cuộc trò chuyện thì tải lại
          const exists = prev.some(
            (conversation) =>
              conversation.id === message.conversationId
          );

          if (!exists) {
            Refresh();
            return prev;
          }

          const isMine = message.sender.id === myId;

          const updated = prev.map((conversation) => {
            if (conversation.id !== message.conversationId)
              return conversation;

            const isActive =
              conversation.id === conversationIdRef.current;

            return {
              ...conversation,
              lastMessageAt: message.createdAt,
              lastMessagePreview: ChatPreview(
                message.type,
                message.content
              ),
              unreadCount:
                isMine || isActive
                  ? 0
                  : conversation.unreadCount + 1,
            };
          });

          // Đưa cuộc trò chuyện mới nhất lên đầu
          return updated.sort(
            (a, b) =>
              SortTime(b.lastMessageAt) -
              SortTime(a.lastMessageAt)
          );
        });
      };

      socket.on("message:new", OnNew);

      attached = socket;

      detached = () => {
        socket.off("message:new", OnNew);
      };
    };

    AttachSocket();

    // Kết nối lại socket thì đăng ký lại sự kiện
    const unsubscribe = SubscribeSocketStatus((socketStatus) => {
      if (socketStatus === "connected") {
        AttachSocket();
      }
    });

    // Hủy sự kiện khi unmount
    return () => {
      detached?.();
      unsubscribe();
    };
  }, [myId, Refresh]);

  // Tham gia tất cả cuộc trò chuyện để nhận realtime
  useEffect(() => {
    if (conversationIds.length === 0)
      return;

    const JoinConversation = () => {
      const socket = GetSocket();

      if (!socket?.connected)
        return;

      conversationIds.forEach((conversationId) => {
        socket.emit(
          "conversation:join",
          { conversationId },
          (ack?: { ok?: boolean; error?: string }) => {
            if (ack?.ok === false) {
              console.warn(
                "[chat] list join failed conversationId=" +
                  conversationId,
                ack.error
              );
            }
          }
        );
      });
    };

    // Tham gia các cuộc trò chuyện hiện tại
    JoinConversation();

    // Kết nối lại socket thì tham gia lại
    const unsubscribe = SubscribeSocketStatus((socketStatus : any) => {
      if (socketStatus === "connected") {
        JoinConversation();
      }
    });

    // Hủy theo dõi khi unmount
    return () => {
      unsubscribe();
    };
  }, [conversationId, conversationIdsKey]);

  return {
    items,
    loading,
    refresh: Refresh,
  };
}