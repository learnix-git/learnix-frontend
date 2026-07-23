"use client";

import { useEffect } from "react";
import { useNotifications } from "@/lib/stores/notifications";
import { useAuth } from "@/lib/stores/auth";

/**
 * Polling thông báo định kỳ + khi tab focus lại.
 * Nếu BE không có push realtime (hoặc chỉ có OneSignal cho mobile), FE cần
 * gọi list định kỳ để badge unread cập nhật khi user ở yên 1 trang.
 *
 * Tần suất: 30s. Khi tab ẩn → pause (document.hidden) để tránh lãng phí
 * request. Khi focus lại → poll ngay 1 lần.
 */
export function useNotificationPolling(intervalMs: number = 30_000) {
  const isAuthed = useAuth((s) => s.isAuthenticated);
  const fetchList = useNotifications((s) => s.fetchList);

  useEffect(() => {
    if (!isAuthed) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) return;
      fetchList({ reset: true, page: 1, limit: 20 });
    };

    // Initial fetch after mount — the 500ms delay gives other components
    // (Bell icon, notification page) a chance to fetch first so we don't
    // duplicate work. If they already fetched, the store's fetch is
    // idempotent with `reset: true`.
    const initialTimer = setTimeout(() => {
      if (!cancelled) tick();
    }, 500);

    const interval = setInterval(tick, intervalMs);

    const onVisibility = () => {
      if (!document.hidden) tick();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelled = true;
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [isAuthed, fetchList, intervalMs]);
}