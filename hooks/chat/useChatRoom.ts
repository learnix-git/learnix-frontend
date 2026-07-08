"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/chat/socket";
import { isSocketMessageNew, normalizeMessage } from "@/lib/chat/normalize";
import { usePeerCache } from "@/lib/stores/peerCache";
import { useChatStatus } from "./useChatStatus";
import { useChatStore } from "@/lib/stores/chat";
import { useMessageLoader } from "./useMessageLoader";
import { useMessageSender } from "./useMessageSender";
import { useTypingIndicator } from "./useTypingIndicator";
import { useReadReceipts } from "./useReadReceipts";
import { useChatAttachments } from "./useChatAttachments";
import type { SendMessagePayload } from "@/lib/chat/types";

export function useChatRoom(conversationId: number | null, myId: number) {
  const { status: socketStatus } = useChatStatus();

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
  } = useMessageLoader(conversationId);

  const { stopTyping, emitTyping, peerTyping } = useTypingIndicator(
    conversationId,
    myId
  );

  const { send } = useMessageSender(
    conversationId,
    myId,
    messageIdsRef,
    setMessages,
    reloadMessages,
    stopTyping
  );

  const { readByPeer, markRead } = useReadReceipts(conversationId, myId);

  const { uploading, uploadAttachment } = useChatAttachments(
    conversationId,
    setMessages
  );

  // Sync active conversation with global store.
  useEffect(() => {
    useChatStore.getState().setActiveConversationId(conversationId);
    return () => {
      useChatStore.getState().setActiveConversationId(null);
    };
  }, [conversationId]);

  // Socket join/leave + incoming message handling.
  useEffect(() => {
    if (!conversationId || socketStatus !== "connected") return;
    const socket = getSocket();
    if (!socket?.connected) return;

    socket.emit(
      "conversation:join",
      { conversationId },
      (ack: { ok?: boolean; error?: string }) => {
        if (ack?.ok === false) {
          console.error("[chat] cannot join conversation:", ack.error);
        }
      }
    );

    const onNew = (raw: unknown) => {
      if (!isSocketMessageNew(raw)) return;
      const message = normalizeMessage(raw, usePeerCache.getState().lookup);
      if (!message || message.conversationId !== conversationId) return;

      if (message.type !== "text" && !message.attachment) {
        void reloadMessages(false).catch((err) => {
          console.warn("[chat] reload attachment message failed:", err);
        });
        return;
      }

      setMessages((prev) =>
        prev.some((item) => item.id === message.id) ? prev : [...prev, message]
      );

      if (message.sender.id !== myId) {
        stopTyping();
      }
    };

    socket.on("message:new", onNew);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", onNew);
    };
  }, [conversationId, myId, reloadMessages, setMessages, socketStatus, stopTyping]);

  // Convenience: send attachment via REST directly.
  const sendAttachment = async (payload: SendMessagePayload) => {
    return uploadAttachment(payload);
  };

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
