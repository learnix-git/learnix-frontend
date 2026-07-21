"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetSocket } from "@/lib/chat/socket";
import type { SocketType } from "@/lib/chat/types";

export function useChatTyping(
  conversationId: string | null,
  myId: string
) {
  // Trạng thái đối phương đang nhập
  const [peerTyping, setPeerTyping] = useState(false);

  // Lưu timer dừng trạng thái đang nhập
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đánh dấu đã gửi sự kiện đang nhập hay chưa
  const isTypingRef = useRef(false);

  // Dừng trạng thái đang nhập
  const StopTyping = useCallback(() => {
    if (!conversationId) return;

    const socket = GetSocket();

    // Hủy timer hiện tại
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // Gửi trạng thái dừng nhập nếu đang kết nối
    if (socket?.connected && isTypingRef.current) {
      socket.emit("typing:stop", { conversationId });
    }

    isTypingRef.current = false;
  }, [conversationId]);

  // Gửi trạng thái đang nhập
  const EmitTyping = useCallback(() => {
    if (!conversationId) return;

    const socket = GetSocket();
    if (!socket?.connected) return;

    // Chỉ gửi một lần khi bắt đầu nhập
    if (!isTypingRef.current) {
      socket.emit("typing:start", { conversationId });
      isTypingRef.current = true;
    }

    // Reset thời gian tự động dừng nhập
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
      isTypingRef.current = false;
      typingTimerRef.current = null;
    }, 2000);
  }, [conversationId]);

  // Lắng nghe trạng thái đang nhập của đối phương
  useEffect(() => {
    if (!conversationId) {
      setPeerTyping(false);
      return;
    }

    const socket = GetSocket();
    if (!socket?.connected) return;

    const onTyping = (typing: SocketType) => {
      if (
        typing.conversationId === conversationId &&
        typing.userId !== myId
      ) {
        setPeerTyping(typing.typing);
      }
    };

    socket.on("typing:update", onTyping);

    return () => {
      socket.off("typing:update", onTyping);
    };
  }, [conversationId, myId]);

  // Hủy timer khi component unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  return {
    peerTyping,
    stopTyping: StopTyping,
    emitTyping: EmitTyping,
  };
}