"use client";

import { create } from "zustand";

/**
 * Spec 5.3 / 7.5: presence store dùng `Set<number>` cho online + map riêng cho lastSeen.
 *
 * Hai nguồn update:
 * - Realtime: socket event presence:update (spec 5.2, broadcast toàn cục)
 *   -> cập nhật Set ngay lập tức qua ChatProvider
 * - Polling: REST POST /chat/online mỗi 30s (spec 4.8)
 *   -> usePresenceSync gọi mergeOnline(requested, online) để sync state khi:
 *      + vừa connect socket (init state)
 *      + sau khi reload (Node có thể đã restart, mất TTL)
 *      + giữ freshness (TTL Redis 30s)
 *
 * Polling KHÔNG được wipe toàn bộ map: chỉ update status của các id đã hỏi.
 * Lý do: hook khác (vd usePresenceSync trong ChatWindow) chỉ hỏi 1 peer; nếu
 * setOnline replace cả Set thì các peer khác trong ChatList sẽ bị reset về offline.
 *
 * Component đọc qua usePresenceStore(s => s.online.has(id)) — primitive boolean,
 * reference ổn định -> không trigger "getSnapshot should be cached".
 */

interface PresenceState {
  /** Set userId đang online (Realtime + Polling sync) */
  online: Set<number>;
  /** Optional lastSeenAt khi backend gửi — section 5.2 chưa implement, sẵn sàng dùng khi có */
  lastSeen: Record<number, string>;

  // Realtime: update 1 user (từ socket event)
  setOne: (userId: number, online: boolean, lastSeenAt?: string) => void;

  // Polling: merge subset. `requested` = ids đã hỏi, `online` = subset đang online.
  // Chỉ update status của các id trong `requested`; các id khác giữ nguyên.
  mergeOnline: (requested: Iterable<number>, online: Iterable<number>) => void;

  // Query
  isOnline: (userId: number) => boolean;

  // Reset
  reset: () => void;
}

const EMPTY_SET: Set<number> = new Set();

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
        // Khi online-to-online transition: chỉ clear lastSeen nếu timestamp
        // thay đổi so với giá trị hiện tại — tránh re-render không cần thiết
        // khi socket push liên tục cùng 1 timestamp.
        if (state.lastSeen[userId] !== undefined) {
          if (lastSeenAt && state.lastSeen[userId] === lastSeenAt) {
            // Same timestamp as current — prune the update, state unchanged.
            return state;
          }
          nextLastSeen = { ...state.lastSeen };
          delete nextLastSeen[userId];
        }
      } else if (lastSeenAt) {
        // Khi offline: lưu lastSeen nếu có
        nextLastSeen = { ...state.lastSeen, [userId]: lastSeenAt };
      }

      // Early-return nếu không đổi
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

/** Hook: trả boolean online cho 1 user. Reference ổn định. */
export function useIsOnline(userId: number): boolean {
  return usePresenceStore((s) => s.online.has(userId));
}
