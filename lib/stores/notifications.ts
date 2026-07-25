"use client";

import { create } from "zustand";
import { NotificationAPI } from "@/lib/api/notifications";
import type { NotificationItem } from "@/lib/notifications/types";

// Trạng thái quản lý
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
  fetchList: (options?: {
    reset?: boolean;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

// Giá trị khởi tạo
const INITIAL_STATE: Pick<
  NotificationState,
  | "items"
  | "total"
  | "unreadCount"
  | "page"
  | "limit"
  | "hasMore"
  | "loading"
  | "refreshing"
  | "initialized"
  | "error"
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

// Đánh dấu một notification đã đọc
function applyMarkRead(
  items: NotificationItem[],
  id: string,
): { items: NotificationItem[]; unreadDelta: number } {
  let unreadDelta = 0;

  const next = items.map((n) => {
    if (n.id !== id) return n;
    if (n.read) return n;

    unreadDelta += 1;
    return { ...n, read: true };
  });

  return { items: next, unreadDelta };
}

// Đánh dấu tất cả notification đã đọc
function applyMarkAllRead(
  items: NotificationItem[],
): { items: NotificationItem[]; unreadDelta: number } {
  let unreadDelta = 0;

  const next = items.map((n) => {
    if (n.read) return n;

    unreadDelta += 1;
    return { ...n, read: true };
  });

  return { items: next, unreadDelta };
}

// Hàm quản lý thông báo
export const useNotifications = create<NotificationState>((set, get) => ({
  ...INITIAL_STATE,

  // Lấy danh sách notification
  fetchList: async (options = {}) => {
    const reset = options.reset ?? false;
    const page = options.page ?? (reset ? 1 : get().page + 1 || 1);
    const limit = options.limit ?? get().limit;

    // Không gọi API nếu đang tải dữ liệu
    if (get().loading) return;

    // Cập nhật trạng thái loading
    set({
      loading: true,
      refreshing: reset,
      error: null,
      page,
      limit,
    });

    try {
      // Gọi API lấy danh sách notification
      const res = await NotificationAPI.list({ page, limit });

      if (res.code !== 200) {
        throw new Error(res.message || "Không thể tải thông báo");
      }

      const incoming = Array.isArray(res.items) ? res.items : [];
      const merged = reset ? incoming : [...get().items, ...incoming];
      const total = Number(res.pagination?.items ?? merged.length);

      // Cập nhật dữ liệu vào store
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
      // Lưu thông báo lỗi
      set({
        loading: false,
        refreshing: false,
        initialized: true,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  // Tải lại danh sách từ trang đầu
  refresh: async () => {
    await get().fetchList({ reset: true, page: 1 });
  },

  // Bắt buộc tải lại dữ liệu mới nhất
  forceRefresh: async () => {
    set({
      loading: true,
      refreshing: true,
      error: null,
    });

    try {
      // Gọi API lấy dữ liệu mới nhất
      const res = await NotificationAPI.list({
        page: 1,
        limit: get().limit,
      });

      if (res.code !== 200) {
        throw new Error(res.message || "Không thể tải thông báo");
      }

      const incoming = Array.isArray(res.items) ? res.items : [];
      const total = Number(res.pagination?.items ?? incoming.length);

      // Cập nhật dữ liệu vào store
      set({
        items: incoming,
        total,
        unreadCount: Number(res.unreadCount ?? 0),
        hasMore: incoming.length < total,
        loading: false,
        refreshing: false,
        initialized: true,
      });
    } catch (err) {
      // Lưu thông báo lỗi
      set({
        loading: false,
        refreshing: false,
        initialized: true,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  // Đánh dấu một notification đã đọc
  markRead: async (id) => {
    if (!id) return;

    const before = get();
    const target = before.items.find((n) => n.id === id);

    // Bỏ qua nếu notification đã đọc
    if (target && target.read) return;

    // Cập nhật giao diện trước khi gọi API
    const optimistic = applyMarkRead(before.items, id);

    if (optimistic.unreadDelta > 0) {
      set({
        items: optimistic.items,
        unreadCount: Math.max(
          0,
          before.unreadCount - optimistic.unreadDelta,
        ),
      });
    }

    try {
      // Gọi API cập nhật trạng thái đã đọc
      const res = await NotificationAPI.read(id);

      if (res.code !== 200) {
        throw new Error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      // Khôi phục dữ liệu nếu API lỗi
      set({
        items: before.items,
        unreadCount: before.unreadCount,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  // Đánh dấu tất cả notification đã đọc
  markAllRead: async () => {
    const before = get();

    // Bỏ qua nếu tất cả đã đọc
    if (before.unreadCount === 0 && before.items.every((n) => n.read)) {
      return;
    }

    // Cập nhật giao diện trước khi gọi API
    const optimistic = applyMarkAllRead(before.items);

    set({
      items: optimistic.items,
      unreadCount: 0,
    });

    try {
      // Gọi API đánh dấu tất cả đã đọc
      const res = await NotificationAPI.readAll();

      if (res.code !== 200) {
        throw new Error(res.message || "Cập nhật thất bại");
      }
    } catch (err) {
      // Khôi phục dữ liệu nếu API lỗi
      set({
        items: before.items,
        unreadCount: before.unreadCount,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  // Đưa store về trạng thái ban đầu
  reset: () => {
    set({ ...INITIAL_STATE });
  },
}));