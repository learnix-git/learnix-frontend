"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { GetSocket } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import { NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/chat";
import type { ChatMessage, MessagePayload } from "@/lib/chat/types";

type ChatAck = {
  ok?: boolean;
  error?: string;
  messageId?: string;
  inserted?: number;
};

// Gửi sự kiện socket và chờ phản hồi từ server
function SendSocketAck<T extends ChatAck>(
  event: string,
  payload: Record<string, unknown>,
  timeoutMs = 3000
): Promise<T> {
  const socket = GetSocket();

  // Nếu socket chưa kết nối thì báo lỗi
  if (!socket?.connected) {
    return Promise.reject(new Error("Socket is not connected"));
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Socket ack timeout"));
    }, timeoutMs);

    socket.emit(event, payload, (ack: T) => {
      window.clearTimeout(timer);
      resolve(ack);
    });
  });
}

export function useChatSender(
  conversationId: string | null,
  myId: string,
  messageIdsRef: React.MutableRefObject<Set<string>>,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  reloadMessages: () => Promise<void>,
  stopTyping: () => void
) {
  const peerLookup = Cache((s) => s.lookup);

  // Gửi tin nhắn bằng REST API
  const SendViaRest = useCallback(
    async (payload: MessagePayload) => {
      if (!conversationId) return;

      const res = await ChatAPI.SendMessage(conversationId, payload);

      // Nếu gửi thất bại thì báo lỗi
      if (res.code !== 200) {
        throw new Error(res.message || "Send message failed");
      }

      const sent = NormalizeMessage(res.data, peerLookup);

      // Thêm tin nhắn nếu chưa tồn tại
      if (sent) {
        setMessages((prev) =>
          prev.some((message) => message.id === sent.id)
            ? prev
            : [...prev, sent]
        );
      }
    },
    [conversationId, peerLookup, setMessages]
  );

  // Gửi tin nhắn
  const send = useCallback(
    async (payload: MessagePayload) => {
      if (!conversationId) return;

      // Tắt trạng thái đang nhập trước khi gửi
      stopTyping();

      try {
        // Ưu tiên gửi bằng socket
        const ack = await SendSocketAck<ChatAck>("message:send", {
          conversationId,
          ...payload,
        });

        // Nếu gửi thành công thì kiểm tra echo từ server
        if (ack?.ok !== false && ack?.messageId) {
          const messageId = ack.messageId;

          window.setTimeout(() => {
            if (!messageIdsRef.current.has(messageId)) {
              void reloadMessages().catch((err) => {
                console.warn("[chat] reload after missing echo failed:", err);
              });
            }
          }, 1200);

          return;
        }

        throw new Error(ack?.error || "Socket send failed");
      } catch (err) {
        // File lỗi thì báo ngay, không fallback REST
        if (payload.type !== "text") {
          const msg =
            err instanceof Error
              ? err.message
              : "Send attachment failed";

          toast.error(msg);
          throw err;
        }

        console.warn("[chat] socket text send failed, fallback REST:", err);
      }

      try {
        // Tin nhắn text sẽ fallback sang REST
        await SendViaRest(payload);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Send message failed";

        toast.error(msg);
        throw err;
      }
    },
    [
      conversationId,
      messageIdsRef,
      reloadMessages,
      SendViaRest,
      stopTyping,
    ]
  );

  return { send };
}