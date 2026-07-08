"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/chat/socket";

/**
 * Subscribe 1 socket event. Handler sẽ re-attach khi deps đổi.
 * Spec 7.4: KHÔNG subscribe ở app level (vd presence) — những cái đó nên đi qua
 * store. Hook này dành cho local component-level event (vd typing, message:new).
 */
export function useChatSocket<T = unknown>(
  event: string,
  handler: (data: T) => void,
  deps: ReadonlyArray<unknown> = []
) {
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
