"use client";

import { create } from "zustand";
import { ChatAPI } from "@/lib/api/chat";

export interface UnreadCountItem {
  conversationId: string;
  count: number;
  latestAt: string;
}

interface ChatState {
  unreadCount: number;
  items: UnreadCountItem[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  activeConversationId: string | null;

  setActiveConversationId: (id: string | null) => void;
  fetchUnreadCount: () => Promise<void>;
  incrementUnreadCount: (conversationId: string, latestAt: string) => void;
  clearUnreadCount: (conversationId: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  unreadCount: 0,
  items: [],
  loading: false,
  initialized: false,
  error: null,
  activeConversationId: null,

  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
    if (id !== null) {
      get().clearUnreadCount(id);
    }
  },

  fetchUnreadCount: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });
    try {
      const res = await ChatAPI.CountUnread();
      if (res.code === 200 && res.data) {
        set({
          unreadCount: res.data.total,
          items: res.data.items,
          initialized: true,
          loading: false,
        });
      } else {
        throw new Error(res.message || "Không thể lấy số tin nhắn chưa đọc");
      }
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Có lỗi xảy ra",
      });
    }
  },

  incrementUnreadCount: (conversationId, latestAt) => {
    set((state) => {
      if (state.activeConversationId === conversationId) {
        return state;
      }

      const existingIndex = state.items.findIndex(
        (item) => item.conversationId === conversationId
      );

      const baseItems = [...state.items];
      const nextItems =
        existingIndex >= 0
          ? baseItems.map((item, idx) =>
              idx === existingIndex
                ? { ...item, count: item.count + 1, latestAt }
                : item
            )
          : [...baseItems, { conversationId, count: 1, latestAt }];

      nextItems.sort(
        (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
      );

      const nextUnreadCount = nextItems.reduce((acc, item) => acc + item.count, 0);

      return {
        items: nextItems,
        unreadCount: nextUnreadCount,
      };
    });
  },

  clearUnreadCount: (conversationId) => {
    set((state) => {
      const existing = state.items.find(
        (item) => item.conversationId === conversationId
      );
      if (!existing || existing.count === 0) return state;

      const nextItems = state.items.map((item) =>
        item.conversationId === conversationId ? { ...item, count: 0 } : item
      );

      const nextUnreadCount = nextItems.reduce((acc, item) => acc + item.count, 0);

      return {
        items: nextItems,
        unreadCount: nextUnreadCount,
      };
    });
  },

  reset: () => {
    set({
      unreadCount: 0,
      items: [],
      loading: false,
      initialized: false,
      error: null,
      activeConversationId: null,
    });
  },
}));