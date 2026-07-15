"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/chat/socket";
import { CheckMessage, NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/cache";
import { useChatStatus } from "./useChatStatus";
import { useChatStore } from "@/lib/stores/chat";
import { useChatLoader } from "./useChatLoader";
import { useChatSender } from "./useChatSender";
import { useChatTyping } from "./useChatTyping";
import { useChatReceipts } from "./useChatReceipts";
import { useChatAttachments } from "./useChatAttachments";
import type { MessagePayload } from "@/lib/chat/types";

export function useChatRoom(conversationId: string | null, myId: string) {
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
  } = useChatLoader(conversationId);

  const { stopTyping, emitTyping, peerTyping } = useChatTyping(
    conversationId,
    myId
  );

  const { send } = useChatSender(
    conversationId,
    myId,
    messageIdsRef,
    setMessages,
    reloadMessages,
    stopTyping
  );

  const { readByPeer, markRead } = useChatReceipts(conversationId, myId);

  const { uploading, uploadAttachment } = useChatAttachments(
    conversationId,
    setMessages
  );

  useEffect(() => {
    useChatStore.getState().setActiveConversationId(conversationId);
    return () => {
      useChatStore.getState().setActiveConversationId(null);
    };
  }, [conversationId]);

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
      if (!CheckMessage(raw)) return;
      const message = NormalizeMessage(raw, Cache.getState().lookup);
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

  const sendAttachment = async (payload: MessagePayload) => {
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