"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { getSocket } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import { NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/cache";
import type { ChatMessage, MessagePayload } from "@/lib/chat/types";

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

export function useChatSender(
  conversationId: string | null,
  myId: string,
  messageIdsRef: React.MutableRefObject<Set<string>>,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  reloadMessages: () => Promise<void>,
  stopTyping: () => void
) {
  const peerLookup = Cache((s) => s.lookup);

  const sendViaRest = useCallback(
    async (payload: MessagePayload) => {
      if (!conversationId) return;
      const res = await ChatAPI.SendMessage(conversationId, payload);
      if (res.code !== 200) {
        throw new Error(res.message || "Send message failed");
      }

      const sent = NormalizeMessage(res.data, peerLookup);
      if (sent) {
        setMessages((prev) =>
          prev.some((message) => message.id === sent.id) ? prev : [...prev, sent]
        );
      }
    },
    [conversationId, peerLookup, setMessages]
  );

  const send = useCallback(
    async (payload: MessagePayload) => {
      if (!conversationId) return;
      stopTyping();

      try {
        const ack = await EmitAck<ChatAck>("message:send", {
          conversationId,
          ...payload,
        });
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
        if (payload.type !== "text") {
          const msg = err instanceof Error ? err.message : "Send attachment failed";
          toast.error(msg);
          throw err;
        }
        console.warn("[chat] socket text send failed, fallback REST:", err);
      }

      try {
        await sendViaRest(payload);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Send message failed";
        toast.error(msg);
        throw err;
      }
    },
    [conversationId, messageIdsRef, reloadMessages, sendViaRest, stopTyping]
  );

  return { send };
}