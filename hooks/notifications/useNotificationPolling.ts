"use client";

import { useEffect } from "react";
import { useNotifications } from "@/lib/stores/notifications";
import { useAuth } from "@/lib/stores/auth";

// Hàm tự động cập nhật danh sách thông báo
export function useNotificationPolling(intervalMs: number = 30_000) {
  // Kiểm tra quyền truy cập
  const auth = useAuth((s) => s.isAuthenticated);
  
  // Lấy danh sách thông báo
  const fetchList = useNotifications((s) => s.fetchList);

  useEffect(() => {
    // Chỉ chạy khi người dùng đăng nhập
    if (!auth) return;

    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) return;
      fetchList({ 
        reset: true, 
        page: 1, 
        limit: 20 
      });
    };

    // Đợi 500ms gọi fetch lần đầu
    const initial = setTimeout(() => {
      if (!cancelled) tick();
    }, 500);

    // Vòng lặp 30s gọi fetch một lần
    const interval = setInterval(tick, intervalMs);

    // Tab đang ẩn thì không polling
    const onVisibility = () => {
      if (!document.hidden) tick();
    };

    // Tab mở lại thì gọi fetch ngay
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [auth, fetchList, intervalMs]);
}