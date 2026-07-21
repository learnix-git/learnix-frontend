"use client";

import { useEffect } from "react";
import { GetSocket } from "@/lib/chat/socket";
import {
  CheckMessage,
  NormalizeMessage,
} from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/chat";
import { useChatStatus } from "./useChatStatus";
import { useChatStore } from "@/lib/stores/chat";
import { useChatLoader } from "./useChatLoader";
import { useChatSender } from "./useChatSender";
import { useChatTyping } from "./useChatTyping";
import { useChatReceipts } from "./useChatReceipts";
import { useChatAttachments } from "./useChatAttachments";

export function useChatRoom(conversationId: string | null, myId: string) {
  // Trạng thái kết nối socket
  const { socketStatus } = useChatStatus();

  // Quản lý danh sách tin nhắn
  const {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMore,
    error,
    loadOlder,
    reloadMessages,
    messageIdsRef,
  } = useChatLoader(conversationId);

  // Quản lý trạng thái đang nhập
  const { stopTyping, emitTyping, peerTyping } = useChatTyping(
    conversationId,
    myId
  );

  // Quản lý gửi tin nhắn
  const { send } = useChatSender(
    conversationId,
    myId,
    messageIdsRef,
    setMessages,
    reloadMessages,
    stopTyping
  );

  // Quản lý trạng thái đã đọc
  const { readByPeer, markRead } = useChatReceipts(
    conversationId,
    myId
  );

  // Quản lý gửi tệp đính kèm
  const { uploading, sendAttachment } = useChatAttachments(
    conversationId,
    setMessages
  );

  // Cập nhật phòng chat đang mở
  useEffect(() => {
    useChatStore.getState().setActiveConversationId(conversationId);

    return () => {
      useChatStore.getState().setActiveConversationId(null);
    };
  }, [conversationId]);

  // Lắng nghe tin nhắn realtime
  useEffect(() => {
    if (!conversationId || socketStatus !== "connected") return;

    const socket = GetSocket();
    if (!socket?.connected) return;

    // Tham gia phòng chat
    socket.emit(
      "conversation:join",
      { conversationId },
      (ack: { ok?: boolean; error?: string }) => {
        if (ack?.ok === false) {
          console.error("[chat] cannot join conversation:", ack.error);
        }
      }
    );

    // Nhận tin nhắn mới
    const onNew = (raw: unknown) => {
      // Bỏ qua nếu dữ liệu không hợp lệ
      if (!CheckMessage(raw)) return;

      const message = NormalizeMessage(raw, Cache.getState().lookup);

      // Chỉ xử lý tin nhắn của phòng hiện tại
      if (!message || message.conversationId !== conversationId) return;

      // Nếu tệp chưa đồng bộ thì tải lại danh sách
      if (message.type !== "text" && !message.attachment) {
        void reloadMessages(false).catch((err) => {
          console.warn("[chat] reload attachment message failed:", err);
        });
        return;
      }

      // Thêm tin nhắn mới nếu chưa tồn tại
      setMessages((prev) =>
        prev.some((item) => item.id === message.id)
          ? prev
          : [...prev, message]
      );

      // Nếu là tin nhắn của đối phương thì tắt trạng thái đang nhập
      if (message.sender.id !== myId) {
        stopTyping();
      }
    };

    socket.on("message:new", onNew);

    return () => {
      // Rời phòng chat và hủy lắng nghe
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNew);
    };
  }, [
    conversationId,
    myId,
    reloadMessages,
    setMessages,
    socketStatus,
    stopTyping,
  ]);

  // Trả về dữ liệu và các hàm của phòng chat
  return {
    messages,
    loading,
    loadingOlder,
    hasMore,
    error,
    readByPeer,
    loadOlder,
    send,
    sendAttachment,
    markRead,
    emitTyping,
    peerTyping,
    uploading,
  };
}