"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetSocket } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import type { SocketRead } from "@/lib/chat/types";

type ChatAck = {
  ok?: boolean;
  error?: string;
  messageId?: string;
  inserted?: number;
};

function EmitAck<T extends ChatAck>(
  event: string,
  payload: Record<string, unknown>,
  timeoutMs = 3000
): Promise<T> {
  const socket = GetSocket();

  // Socket chưa kết nối
  if (!socket?.connected) {
    return Promise.reject(new Error("Socket is not connected"));
  }

  return new Promise((resolve, reject) => {
    // Tự hủy nếu server không phản hồi
    const timer = window.setTimeout(() => {
      reject(new Error("Socket ack timeout"));
    }, timeoutMs);

    socket.emit(event, payload, (ack: T) => {
      window.clearTimeout(timer);
      resolve(ack);
    });
  });
}

export function useChatReceipts(conversationId: string | null, myId: string) {
  // Lưu tin nhắn cuối cùng mà từng người đã đọc
  const [readByPeer, setReadByPeer] = useState<Record<string, string>>({});

  // Lưu id tin nhắn đã đánh dấu đọc gần nhất
  const lastMarkedReadRef = useRef("");

  // Đánh dấu một tin nhắn là đã đọc
  const MarkRead = useCallback(
    (messageId: string) => {
      // Không gửi lại nếu đã đánh dấu trước đó
      if (!conversationId || messageId === lastMarkedReadRef.current)
        return;

      lastMarkedReadRef.current = messageId;

      const payload = {
        conversationId,
        messageId,
      };

      // Ưu tiên gửi qua socket
      EmitAck<ChatAck>("message:read", payload)
        .then((ack) => {
          if (ack?.ok === false) {
            throw new Error(ack.error || "Socket read failed");
          }
        })
        // Nếu socket lỗi thì gọi API
        .catch(() => {
          ChatAPI.MarkAsRead(conversationId, messageId).catch(() => {});
        });
    },
    [conversationId]
  );

  useEffect(() => {
    // Reset khi không còn cuộc trò chuyện
    if (!conversationId) {
      setReadByPeer({});
      lastMarkedReadRef.current = "";
      return;
    }

    const socket = GetSocket();

    // Socket chưa kết nối
    if (!socket?.connected)
      return;

    // Nhận sự kiện người còn lại đã đọc tin nhắn
    const OnRead = (read: SocketRead) => {
      if (
        read.conversationId === conversationId &&
        read.readerId !== myId
      ) {
        setReadByPeer((prev) => ({
          ...prev,
          [read.readerId]: read.messageId,
        }));
      }
    };

    socket.on("message:read", OnRead);

    // Hủy lắng nghe khi unmount hoặc đổi cuộc trò chuyện
    return () => {
      socket.off("message:read", OnRead);
    };
  }, [conversationId, myId]);

  return {
    readByPeer,
    markRead: MarkRead,
  };
}