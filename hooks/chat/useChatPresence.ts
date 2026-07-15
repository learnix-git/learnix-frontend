"use client";

import { useEffect, useRef } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { usePresenceStore } from "@/lib/stores/presence";
import { subscribeSocketState } from "@/lib/chat/socket";

export function useChatPresence(userIds: string[]): void {
  const mergeOnline = usePresenceStore((s) => s.mergeOnline);

  const idsRef = useRef<string[]>(userIds);
  idsRef.current = userIds;

  const idsKey = userIds.slice().sort().join(",");

  useEffect(() => {
    let cancelled = false;

    const fetchOnce = async () => {
      const raw = idsRef.current ?? [];
      const ids = Array.from(
        new Set(
          raw
            .map((id) => String(id).trim())
            .filter((id) => id.length > 0)
        )
      );
      if (ids.length === 0) return;

      try {
        const res = await ChatAPI.CheckOnline(ids);
        if (cancelled) return;
        if (res.code === 200 && Array.isArray(res.data?.online)) {
          mergeOnline(ids, res.data.online);
        }
      } catch (e) {
        console.warn("[chat] usePresenceSync fetch failed", e);
      }
    };

    fetchOnce();

    const unsubState = subscribeSocketState((st) => {
      if (st === "connected") {
        fetchOnce();
      }
    });

    return () => {
      cancelled = true;
      unsubState();
    };
  }, [mergeOnline, idsKey]);
}