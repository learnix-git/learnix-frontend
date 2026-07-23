"use client";

import { create } from "zustand";
import { NotificationAPI } from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/notifications/types";

interface NotificationState {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  initialized: boolean;
  error: string | null;
  fetchList: (options?: { reset?: boolean | undefined; page?: number | undefined; limit?: number | undefined }) => Promise<void>;
  refresh: () => Promise<void>;
  /**
   * Force refresh từ socket realtime — bypass `loading` guard trong `fetchList`
   * để notification mới về có thể ghi đè state ngay cả khi user đang paginated load.
   * Dùng cho provider socket khi nhận `notification:new`.
   */
  forceRefresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markReadGroup: (groupKey: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE: Pick<
  NotificationState,
  "items" | "total" | "unreadCount" | "page" | "limit" | "hasMore" | "loading" | "refreshing" | "initialized" | "error"
> = {
  items: [],
  total: 0,
  unreadCount: 0,
  page: 0,
  limit: 20,
  hasMore: true,
  loading: false,
  refreshing: false,
  initialized: false,
  error: null,
};

function applyMarkReadGroup(
  items: NotificationItem[],
  groupKey: string,
): { items: NotificationItem[]; unreadDelta: number } {
  let unreadDelta = 0;
  const next = items.map((n) => {
    if (n.groupKey !== groupKey) return n;
    if (n.isRead) return n;
    unreadDelta += n.unreadInGroup;
    return { ...n, isRead: true, unreadInGroup: 0 };
  });
  return { items: next, unreadDelta };
}

/**
 * Optimistic update cho non-groupable notification: flip `isRead` thành true
 * trên item khớp `latestTargetId` (id mà `read` API sẽ được gọi). Đồng bộ
 * pattern với `applyMarkReadGroup` / `applyMarkAllRead` để tránh bug badge
 * giảm nhưng list vẫn hiển thị unread (dot, bold title, primary bg).
 */
function applyMarkRead(
  items: NotificationItem[],
  id: string,
): { items: NotificationItem[]; unreadDelta: number } {
  let unreadDelta = 0;
  const next = items.map((n) => {
    if (n.latestTargetId !== id) return n;
    if (n.isRead) return n;
    unreadDelta += Math.max(1, n.unreadInGroup);
    return { ...n, isRead: true, unreadInGroup: 0 };
  });
  return { items: next, unreadDelta };
}

function applyMarkAllRead(items: NotificationItem[]): {
  items: NotificationItem[];
  unreadDelta: number;
} {
  let unreadDelta = 0;
  const next = items.map((n) => {
    if (n.isRead) return n;
    unreadDelta += n.unreadInGroup;
    return { ...n, isRead: true, unreadInGroup: 0 };
  });
  return { items: next, unreadDelta };
}

export const useNotifications = create<NotificationState>((set, get) => ({
  ...INITIAL_STATE,

  fetchList: async (options = {}) => {
    const reset = options.reset ?? false;
    const page = options.page ?? (reset ? 1 : get().page + 1 || 1);
    const limit = options.limit ?? get().limit;

    if (get().loading) return;

    set({
      loading: true,
      refreshing: reset,
      error: null,
      page,
      limit,
    });

    try {
      const res = await NotificationAPI.list({ page, limit });
      if (res.code !== 200) {
        throw new Error(res.message || "Không thể tải thông báo");
      }

      const incoming = Array.isArray(res.data) ? res.data : [];
      const merged = reset ? incoming : [...get().items, ...incoming];
      const total = Number(res.pagination?.items ?? merged.length);

      set({
        items: merged,
        total,
        unreadCount: Number(res.unreadCount ?? 0),
        hasMore: merged.length < total,
        loading: false,
        refreshing: false,
        initialized: true,
      });
    } catch (err) {
      set({
        loading: false,
        refreshing: false,
        initialized: true,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  refresh: async () => {
    await get().fetchList({ reset: true, page: 1 });
  },

  forceRefresh: async () => {
    // Bypass `loading` guard trong `fetchList` — dùng cho socket-driven realtime
    // khi notification mới về cần ghi đè state ngay cả khi user đang load trang
    // khác. Tự set loading=true để UI có feedback.
    set({ loading: true, refreshing: true, error: null });
    try {
      const res = await NotificationAPI.list({ page: 1, limit: get().limit });
      if (res.code !== 200) {
        throw new Error(res.message || "Không thể tải thông báo");
      }

      const incoming = Array.isArray(res.data) ? res.data : [];
      set({
        items: incoming,
        total: Number(res.pagination ?? incoming.length),
        unreadCount: Number(res.unreadCount ?? 0),
        hasMore: incoming.length < Number(res.pagination ?? incoming.length),
        loading: false,
        refreshing: false,
        initialized: true,
      });
    } catch (err) {
      set({
        loading: false,
        refreshing: false,
        initialized: true,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  markRead: async (id) => {
    if (!id) return;
    const before = get();
    const target = before.items.find((n) => n.latestTargetId === id);
    if (target && target.isRead) return;

    const optimistic = applyMarkRead(before.items, id);
    if (optimistic.unreadDelta > 0) {
      set({
        items: optimistic.items,
        unreadCount: Math.max(0, before.unreadCount - optimistic.unreadDelta),
      });
    }

    try {
      const res = await NotificationAPI.read(id);
      if (res.code !== 200) {
        throw new Error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      // Rollback về state trước nếu lỗi.
      set({
        items: before.items,
        unreadCount: before.unreadCount,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  markReadGroup: async (groupKey) => {
    if (!groupKey) return;
    const before = get();
    const target = before.items.find((n) => n.groupKey === groupKey);
    if (target && target.isRead) return;

    const optimistic = applyMarkReadGroup(before.items, groupKey);
    set({
      items: optimistic.items,
      unreadCount: Math.max(0, before.unreadCount - optimistic.unreadDelta),
    });

    try {
      const res = await NotificationAPI.readGroup(groupKey);
      if (res.code !== 200) {
        throw new Error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      set({
        items: before.items,
        unreadCount: before.unreadCount,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  markAllRead: async () => {
    const before = get();
    if (before.unreadCount === 0 && before.items.every((n) => n.isRead)) return;

    const optimistic = applyMarkAllRead(before.items);
    set({ items: optimistic.items, unreadCount: 0 });

    try {
      const res = await NotificationAPI.readAll();
      if (res.code !== 200) {
        throw new Error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      set({
        items: before.items,
        unreadCount: before.unreadCount,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  reset: () => {
    set({ ...INITIAL_STATE });
  },
}));