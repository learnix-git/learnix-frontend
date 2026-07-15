"use client";

import { create } from "zustand";

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