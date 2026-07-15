"use client";

import { useCallback, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/cache";
import type { ChatMessage, MessagePayload } from "@/lib/chat/types";

export function useChatAttachments(
  conversationId: string | null,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void
) {
  const [uploading, setUploading] = useState(false);
  const peerLookup = Cache((s) => s.lookup);

  const uploadAttachment = useCallback(
    async (payload: MessagePayload): Promise<ChatMessage | null> => {
      if (!conversationId) return null;
      setUploading(true);
      try {
        const res = await ChatAPI.SendMessage(conversationId, payload);
        if (res.code !== 200) {
          throw new Error(res.message || "Upload attachment failed");
        }
        const sent = NormalizeMessage(res.data, peerLookup);
        if (sent) {
          setMessages((prev) =>
            prev.some((message) => message.id === sent.id) ? prev : [...prev, sent]
          );
        }
        return sent;
      } finally {
        setUploading(false);
      }
    },
    [conversationId, peerLookup, setMessages]
  );

  return { uploading, uploadAttachment };
}