"use client";

import { create } from "zustand";
import { ChatAPI } from "@/lib/api/chat";
import type { ChatUser } from "@/lib/chat/types";

interface PresenceState {
  online: Set<string>;
  lastSeen: Record<string, string>;
  setOne: (userId: string, online: boolean, lastSeenAt?: string) => void;
  mergeOnline: (requested: Iterable<string>, online: Iterable<string>) => void;
  isOnline: (userId: string) => boolean;

  // Reset
  reset: () => void;
}

const EMPTY_SET: Set<string> = new Set();

export const usePresenceStore = create<PresenceState>((set, get) => ({
  online: EMPTY_SET,
  lastSeen: {},

  setOne: (userId, online, lastSeenAt) =>
    set((state) => {
      const next = new Set(state.online);
      if (online) next.add(userId);
      else next.delete(userId);

      let nextLastSeen = state.lastSeen;

      if (online) {
        if (state.lastSeen[userId] !== undefined) {
          if (lastSeenAt && state.lastSeen[userId] === lastSeenAt) {
            return state;
          }
          nextLastSeen = { ...state.lastSeen };
          delete nextLastSeen[userId];
        }
      } else if (lastSeenAt) {
        nextLastSeen = { ...state.lastSeen, [userId]: lastSeenAt };
      }

      if (
        next.size === state.online.size &&
        [...next].every((id) => state.online.has(id)) &&
        nextLastSeen === state.lastSeen
      ) {
        return state;
      }
      return { online: next, lastSeen: nextLastSeen };
    }),

  mergeOnline: (requested, online) =>
    set((state) => {
      const requestedSet = new Set(requested);
      const onlineSet = new Set(online);
      if (requestedSet.size === 0) return state;

      const next = new Set(state.online);
      let changed = false;
      requestedSet.forEach((id) => {
        const shouldBeOnline = onlineSet.has(id);
        const currentlyOnline = next.has(id);
        if (shouldBeOnline && !currentlyOnline) {
          next.add(id);
          changed = true;
        } else if (!shouldBeOnline && currentlyOnline) {
          next.delete(id);
          changed = true;
        }
      });
      if (!changed) return state;
      return { online: next };
    }),

  isOnline: (userId) => get().online.has(userId),

  reset: () => set({ online: new Set(), lastSeen: {} }),
}));

export function useIsOnline(userId: string): boolean {
  return usePresenceStore((s) => s.online.has(userId));
}

// ─────────────────────────────────────────────────────────────────
// Cache store — bounded LRU-ish cache of peer profiles
// ─────────────────────────────────────────────────────────────────

const MAX_PEERS = 200;

interface CacheState {
  peers: Record<string, ChatUser>;
  /** Insertion-order list of peer IDs — index 0 = oldest. */
  order: string[];
  setPeer: (peer: ChatUser) => void;
  setPeers: (peers: ChatUser[]) => void;
  lookup: (id: string) => ChatUser | null;
  clear: () => void;
}

export const Cache = create<CacheState>((set, get) => ({
  peers: {},
  order: [],

  setPeer: (peer) => {
    const { peers, order } = get();
    if (peers[peer.id]) {
      // Already exists — update in-place, no order change.
      set({ peers: { ...peers, [peer.id]: { id: peer.id, name: peer.name, avatar: peer.avatar ?? null, alias: peer.alias ?? null } } });
      return;
    }

    // New entry — evict oldest if at cap.
    let newOrder = [...order, peer.id];
    if (newOrder.length > MAX_PEERS) {
      const evictCount = newOrder.length - MAX_PEERS;
      const toEvict = new Set(newOrder.slice(0, evictCount));
      newOrder = newOrder.slice(evictCount);
      const newPeers = { ...peers };
      for (const id of toEvict) delete newPeers[id];
      set({ peers: { ...newPeers, [peer.id]: { id: peer.id, name: peer.name, avatar: peer.avatar ?? null, alias: peer.alias ?? null } }, order: newOrder });
    } else {
      set({ peers: { ...peers, [peer.id]: { id: peer.id, name: peer.name, avatar: peer.avatar ?? null, alias: peer.alias ?? null } }, order: newOrder });
    }
  },

  setPeers: (peers) => {
    // Build a map, then evict oldest if over cap.
    const incoming = peers.reduce<Record<string, ChatUser>>((acc, p) => {
      acc[p.id] = { id: p.id, name: p.name, avatar: p.avatar ?? null, alias: p.alias ?? null };
      return acc;
    }, {});
    const incomingOrder = Object.keys(incoming);
    // Merge with existing, cap at MAX_PEERS.
    const { peers: existing, order: existingOrder } = get();
    const mergedPeers = { ...existing, ...incoming };
    const mergedOrder = [...new Set([...existingOrder, ...incomingOrder])];
    if (mergedOrder.length > MAX_PEERS) {
      const toEvict = new Set(mergedOrder.slice(0, mergedOrder.length - MAX_PEERS));
      for (const id of toEvict) delete mergedPeers[id];
      set({ peers: mergedPeers, order: mergedOrder.slice(mergedOrder.length - MAX_PEERS) });
    } else {
      set({ peers: mergedPeers, order: mergedOrder });
    }
  },

  lookup: (id) => get().peers[id] ?? null,
  clear: () => set({ peers: {}, order: [] }),
}));

// ─────────────────────────────────────────────────────────────────
// Chat store — unread counts per conversation
// ─────────────────────────────────────────────────────────────────

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