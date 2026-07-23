"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/stores/auth";
import {
  subscribeInvalidate,
  type InvalidatePayload,
} from "@/lib/notifications/invalidate-bus";

/**
 * Hook cho page subscribe bus `notification:new`.
 *
 *  - Auth gating: chỉ subscribe khi user đã login.
 *  - Debounce 300ms mỗi subscriber (gom burst events từ reconnect socket).
 *  - Skip emit đầu tiên sau mount — tránh refresh lần đầu khi user vừa
 *    navigate xong (page vừa fetch data từ useEffect mount).
 *  - Stale-closure safe: `matchFn` / `refreshFn` wrap trong `useRef`,
 *    gán `.current` mỗi render — không cần liệt kê vào dependency array.
 *  - Visibility refresh: khi tab chuyển từ ẩn → hiện, gọi `refreshFn`
 *    (mặc định) hoặc `options.onVisibility` (nếu override). Debounce 1s
 *    để gom nhiều lần visibilitychange liên tiếp.
 */

const DEBOUNCE_MS = 300;
const VISIBILITY_DEBOUNCE_MS = 1000;

type MatchFn = (n: InvalidatePayload) => boolean;
type RefreshFn = () => void | Promise<void>;

export function useNotificationPageRefresh(
  matchFn: MatchFn,
  refreshFn: RefreshFn,
  options?: { onVisibility?: RefreshFn },
): void {
  const isLoggedIn = useAuth((s) => !!s.user);
  const onVisOverride = options?.onVisibility;

  // Refs để tránh stale closure khi matchFn / refreshFn đổi identity mỗi render.
  const matchRef = useRef(matchFn);
  const refreshRef = useRef(refreshFn);
  const onVisRef = useRef(onVisOverride);
  matchRef.current = matchFn;
  refreshRef.current = refreshFn;
  onVisRef.current = onVisOverride;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstEmitRef = useRef(true);

  // ─── Subscribe bus ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    const handle = (payload: InvalidatePayload) => {
      // Skip emit đầu tiên sau mount để tránh refresh ngay khi page
      // vừa fetch xong từ useEffect mount.
      if (firstEmitRef.current) {
        firstEmitRef.current = false;
        return;
      }
      if (!matchRef.current(payload)) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void refreshRef.current();
      }, DEBOUNCE_MS);
    };

    const unsubscribe = subscribeInvalidate(handle);
    return () => {
      unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [isLoggedIn]);

  // ─── Visibility refresh ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    if (typeof document === "undefined") return;

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (visDebRef.current) clearTimeout(visDebRef.current);
      visDebRef.current = setTimeout(() => {
        visDebRef.current = null;
        const fn = onVisRef.current ?? refreshRef.current;
        void fn();
      }, VISIBILITY_DEBOUNCE_MS);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (visDebRef.current) {
        clearTimeout(visDebRef.current);
        visDebRef.current = null;
      }
    };
  }, [isLoggedIn]);
}