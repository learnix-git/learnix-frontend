"use client";

import { create } from "zustand";
import type { ChatUser } from "@/lib/chat/types";

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