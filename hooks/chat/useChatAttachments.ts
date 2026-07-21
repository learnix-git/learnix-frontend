"use client";

import { useCallback, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/chat";
import type { ChatMessage, MessagePayload } from "@/lib/chat/types";

export function useChatAttachments(
  conversationId: string | null,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void
) {
  // Trạng thái đang gửi tệp
  const [uploading, setUploading] = useState(false);

  // Danh sách thông tin người dùng dùng để chuẩn hóa tin nhắn
  const peerLookup = Cache((state) => state.lookup);

  // Hàm gửi tệp đính kèm
  const SendAttachment = useCallback(
    async (payload: MessagePayload): Promise<ChatMessage | null> => {
      // Không có cuộc trò chuyện thì không gửi
      if (!conversationId) return null;

      setUploading(true);

      try {
        // Gửi tệp lên server
        const response = await ChatAPI.SendMessage(conversationId, payload);

        // Báo lỗi nếu gửi thất bại
        if (response.code !== 200) {
          throw new Error(response.message || "Upload attachment failed");
        }

        // Chuẩn hóa dữ liệu tin nhắn trả về
        const message = NormalizeMessage(response.data, peerLookup);

        // Thêm tin nhắn vào danh sách nếu chưa tồn tại
        if (message) {
          setMessages((prev) =>
            prev.some((item) => item.id === message.id)
              ? prev
              : [...prev, message]
          );
        }

        return message;
      } finally {
        setUploading(false);
      }
    },
    [conversationId, peerLookup, setMessages]
  );

  return {
    uploading,
    sendAttachment: SendAttachment,
  };
}