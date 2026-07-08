"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { normalizeMessage } from "@/lib/chat/normalize";
import { usePeerCache } from "@/lib/stores/peerCache";
import type { ChatMessage } from "@/lib/chat/types";

const MESSAGE_PAGE_SIZE = 30;

export function useMessageLoader(conversationId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadSeqRef = useRef(0);
  const messageIdsRef = useRef<Set<number>>(new Set());
  const peerLookup = usePeerCache((s) => s.lookup);

  const normalizeMessages = useCallback(
    (items: ChatMessage[]) =>
      items
        .map((message) => normalizeMessage(message, peerLookup))
        .filter((message): message is ChatMessage => message !== null),
    [peerLookup]
  );

  const mergeMessages = useCallback((current: ChatMessage[], incoming: ChatMessage[]) => {
    const byId = new Map<number, ChatMessage>();
    for (const message of current) byId.set(message.id, message);
    for (const message of incoming) byId.set(message.id, message);
    return Array.from(byId.values()).sort((a, b) => a.id - b.id);
  }, []);

  const reloadMessages = useCallback(
    async (showLoading = false) => {
      if (!conversationId) return;
      const seq = ++loadSeqRef.current;
      if (showLoading) setLoading(true);

      const res = await ChatAPI.getMessages(conversationId, 1, MESSAGE_PAGE_SIZE);
      if (seq !== loadSeqRef.current) return;
      if (res.code === 200 && Array.isArray(res.data.items)) {
        const normalized = normalizeMessages(res.data.items);
        setMessages((prev) => (prev.length > 0 ? mergeMessages(prev, normalized) : normalized));
        setPage(1);
        setTotal(res.data.total);
        setError(null);
      } else {
        setError(res.msg || "Load messages failed");
      }
    },
    [conversationId, mergeMessages, normalizeMessages]
  );

  const loadOlder = useCallback(async () => {
    if (!conversationId || loadingOlder) return false;
    if (total > 0 && messages.length >= total) return false;

    const nextPage = page + 1;
    setLoadingOlder(true);
    try {
      const res = await ChatAPI.getMessages(conversationId, nextPage, MESSAGE_PAGE_SIZE);
      if (res.code !== 200 || !Array.isArray(res.data.items)) {
        setError(res.msg || "Load older messages failed");
        return false;
      }

      const normalized = normalizeMessages(res.data.items);
      setMessages((prev) => mergeMessages(prev, normalized));
      setPage(nextPage);
      setTotal(res.data.total);
      setError(null);
      return normalized.length > 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load older messages failed");
      return false;
    } finally {
      setLoadingOlder(false);
    }
  }, [
    conversationId,
    loadingOlder,
    mergeMessages,
    messages.length,
    normalizeMessages,
    page,
    total,
  ]);

  useEffect(() => {
    messageIdsRef.current = new Set(messages.map((message) => message.id));
  }, [messages]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadingOlder(false);
    setPage(1);
    setTotal(0);
    setMessages([]);
    setError(null);

    reloadMessages()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Load messages failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      loadSeqRef.current += 1;
    };
  }, [conversationId, reloadMessages]);

  return {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMore: total === 0 ? messages.length >= MESSAGE_PAGE_SIZE : messages.length < total,
    error,
    loadOlder,
    reloadMessages,
    messageIdsRef,
  };
}
