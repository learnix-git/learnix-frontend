"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { NormalizeMessage } from "@/lib/chat/normalize";
import { Cache } from "@/lib/stores/chat";
import type { ChatMessage } from "@/lib/chat/types";

// Số lượng tin nhắn tải trong mỗi lần gọi API
const SIZE = 30;

export function useChatLoader(conversationId: string | null) {
  // Danh sách tin nhắn
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Trạng thái tải lần đầu
  const [loading, setLoading] = useState(true);

  // Trạng thái tải thêm tin nhắn cũ
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Trang hiện tại
  const [page, setPage] = useState(1);

  // Tổng số tin nhắn
  const [total, setTotal] = useState(0);

  // Lỗi khi tải tin nhắn
  const [error, setError] = useState<string | null>(null);

  // Đánh dấu lần tải mới nhất để tránh ghi đè dữ liệu cũ
  const loadSeqRef = useRef(0);

  // Lưu id các tin nhắn đã có
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Cache thông tin người dùng
  const peerLookup = Cache((s) => s.lookup);

  // Chuẩn hóa danh sách tin nhắn từ API
  const NormalizeMessages = useCallback(
    (items: ChatMessage[]) =>
      items
        .map((message) => NormalizeMessage(message, peerLookup))
        .filter((message): message is ChatMessage => message !== null),
    [peerLookup]
  );

  // Gộp danh sách tin nhắn mới với danh sách hiện có
  const MergeMessages = useCallback(
    (current: ChatMessage[], incoming: ChatMessage[]) => {
      const byId = new Map<string, ChatMessage>();

      for (const message of current)
        byId.set(message.id, message);

      for (const message of incoming)
        byId.set(message.id, message);

      return Array.from(byId.values()).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
    },
    []
  );

  // Tải lại toàn bộ tin nhắn
  const ReloadMessages = useCallback(
    async (showLoading = false) => {
      if (!conversationId) return;

      // Đánh dấu đây là lần tải mới nhất
      const seq = ++loadSeqRef.current;

      if (showLoading)
        setLoading(true);

      const res = await ChatAPI.RecvMessage(1, SIZE, conversationId);

      // Nếu đã có lần tải mới hơn thì bỏ kết quả cũ
      if (seq !== loadSeqRef.current)
        return;

      if (res.code === 200 && res.data && Array.isArray(res.data.items)) {
        const normalized = NormalizeMessages(res.data.items);

        setMessages((prev) =>
          prev.length > 0
            ? MergeMessages(prev, normalized)
            : normalized
        );

        setPage(1);
        setTotal(res.data.total);
        setError(null);
      } else {
        setError(res.message || "Load messages failed");
      }
    },
    [conversationId, MergeMessages, NormalizeMessages]
  );

  // Tải thêm các tin nhắn cũ
  const LoadOlder = useCallback(async () => {
    if (!conversationId || loadingOlder)
      return false;

    if (total > 0 && messages.length >= total)
      return false;

    const nextPage = page + 1;

    setLoadingOlder(true);

    try {
      const res = await ChatAPI.RecvMessage(
        nextPage,
        SIZE,
        conversationId
      );

      if (
        res.code !== 200 ||
        !res.data ||
        !Array.isArray(res.data.items)
      ) {
        setError(res.message || "Load older messages failed");
        return false;
      }

      const normalized = NormalizeMessages(res.data.items);

      setMessages((prev) =>
        MergeMessages(prev, normalized)
      );

      setPage(nextPage);
      setTotal(res.data.total);
      setError(null);

      return normalized.length > 0;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Load older messages failed"
      );

      return false;
    } finally {
      setLoadingOlder(false);
    }
  }, [
    conversationId,
    loadingOlder,
    MergeMessages,
    messages.length,
    NormalizeMessages,
    page,
    total,
  ]);

  // Cập nhật danh sách id tin nhắn
  useEffect(() => {
    messageIdsRef.current = new Set(
      messages.map((message) => message.id)
    );
  }, [messages]);

  // Tải lại dữ liệu khi đổi cuộc trò chuyện
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

    ReloadMessages()
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Load messages failed"
          );
        }
      })
      .finally(() => {
        if (!cancelled)
          setLoading(false);
      });

    return () => {
      cancelled = true;

      // Hủy hiệu lực các lần tải cũ
      loadSeqRef.current += 1;
    };
  }, [conversationId, ReloadMessages]);

  return {
    messages,
    setMessages,
    loading,
    loadingOlder,
    hasMore:
      total === 0
        ? messages.length >= SIZE
        : messages.length < total,
    error,
    loadOlder: LoadOlder,
    reloadMessages: ReloadMessages,
    messageIdsRef,
  };
}