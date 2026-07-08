"use client";

import { useCallback, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { normalizeMessage } from "@/lib/chat/normalize";
import { usePeerCache } from "@/lib/stores/peerCache";
import type { ChatMessage, SendMessagePayload } from "@/lib/chat/types";

/**
 * Handles attachment uploads (images, files) sent via REST.
 * Socket is preferred for text; attachments always go through REST.
 * Progress tracking is available for large files.
 */
export function useChatAttachments(
  conversationId: number | null,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void
) {
  const [uploading, setUploading] = useState(false);
  const peerLookup = usePeerCache((s) => s.lookup);

  const uploadAttachment = useCallback(
    async (payload: SendMessagePayload): Promise<ChatMessage | null> => {
      if (!conversationId) return null;
      setUploading(true);
      try {
        const res = await ChatAPI.sendMessage(conversationId, payload);
        if (res.code !== 200) {
          throw new Error(res.msg || "Upload attachment failed");
        }
        const sent = normalizeMessage(res.data, peerLookup);
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
