"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/chat/socket";
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
  const socket = getSocket();
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

export function useChatReceipts(conversationId: string | null, myId: string) {
  const [readByPeer, setReadByPeer] = useState<Record<string, string>>({});
  const lastMarkedReadRef = useRef("");

  const markRead = useCallback(
    (messageId: string) => {
      if (!conversationId || messageId === lastMarkedReadRef.current) return;
      lastMarkedReadRef.current = messageId;

      const payload = { conversationId, messageId };
      EmitAck<ChatAck>("message:read", payload, 3000)
        .then((ack) => {
          if (ack?.ok === false) {
            throw new Error(ack.error || "Socket read failed");
          }
        })
        .catch(() => {
          ChatAPI.MarkAsRead(conversationId, messageId).catch(() => {});
        });
    },
    [conversationId]
  );

  useEffect(() => {
    if (!conversationId) {
      setReadByPeer({});
      lastMarkedReadRef.current = "";
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) return;

    const onRead = (read: SocketRead) => {
      if (read.conversationId === conversationId && read.readerId !== myId) {
        setReadByPeer((prev) => ({
          ...prev,
          [read.readerId]: read.messageId,
        }));
      }
    };

    socket.on("message:read", onRead);
    return () => {
      socket.off("message:read", onRead);
    };
  }, [conversationId, myId]);

  return { readByPeer, markRead };
}