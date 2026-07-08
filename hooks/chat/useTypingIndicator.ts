"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/chat/socket";
import type { SocketTyping } from "@/lib/chat/types";

export function useTypingIndicator(conversationId: number | null, myId: number) {
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const stopTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    if (socket?.connected && isTypingRef.current) {
      socket.emit("typing:stop", { conversationId });
    }
    isTypingRef.current = false;
  }, [conversationId]);

  const emitTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket?.connected) return;
    if (!isTypingRef.current) {
      socket.emit("typing:start", { conversationId });
      isTypingRef.current = true;
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
      isTypingRef.current = false;
      typingTimer.current = null;
    }, 2000);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) {
      setPeerTyping(false);
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) return;

    const onTyping = (typing: SocketTyping) => {
      if (typing.conversationId === conversationId && typing.userId !== myId) {
        setPeerTyping(typing.isTyping);
      }
    };

    socket.on("typing:update", onTyping);
    return () => {
      socket.off("typing:update", onTyping);
    };
  }, [conversationId, myId]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  return { peerTyping, stopTyping, emitTyping };
}
