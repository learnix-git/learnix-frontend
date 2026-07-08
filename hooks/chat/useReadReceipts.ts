"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import type { SocketMessageRead } from "@/lib/chat/types";

type ChatAck = {
  ok?: boolean;
  error?: string;
  messageId?: number;
  inserted?: number;
};

function emitWithAck<T extends ChatAck>(
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

export function useReadReceipts(conversationId: number | null, myId: number) {
  const [readByPeer, setReadByPeer] = useState<Record<number, number>>({});
  const lastMarkedReadRef = useRef(0);

  const markRead = useCallback(
    (upToMessageId: number) => {
      if (!conversationId || upToMessageId <= lastMarkedReadRef.current) return;
      lastMarkedReadRef.current = upToMessageId;

      const payload = { conversationId, upToMessageId };
      emitWithAck<ChatAck>("message:read", payload, 3000)
        .then((ack) => {
          if (ack?.ok === false) {
            throw new Error(ack.error || "Socket read failed");
          }
        })
        .catch(() => {
          ChatAPI.markRead(conversationId, upToMessageId).catch(() => {});
        });
    },
    [conversationId]
  );

  useEffect(() => {
    if (!conversationId) {
      setReadByPeer({});
      lastMarkedReadRef.current = 0;
      return;
    }

    const socket = getSocket();
    if (!socket?.connected) return;

    const onRead = (read: SocketMessageRead) => {
      if (read.conversationId === conversationId && read.readerId !== myId) {
        setReadByPeer((prev) => ({
          ...prev,
          [read.readerId]: read.upToMessageId,
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
