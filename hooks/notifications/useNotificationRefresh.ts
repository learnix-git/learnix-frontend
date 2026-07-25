"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/stores/auth";
import {
  Subscribe,
  type Payload,
} from "@/lib/notifications/invalidate-bus";

const DEBOUNCE_MS = 300;
const VISIBILITY_DEBOUNCE_MS = 1000;

type MatchFn = (n: Payload) => boolean;
type RefreshFn = () => void | Promise<void>;

// Hàm tự động refresh dữ liệu khi có thông báo
export function useNotificationPageRefresh(
  matchFn: MatchFn,
  refreshFn: RefreshFn,
  options?: { onVisibility?: RefreshFn },
): void {
  // Chỉ hoạt động khi người dùng đã đăng nhập
  const auth = useAuth((s) => !!s.user);
  const onVisOverride = options?.onVisibility;

  // Lưu callback vào ref để luôn dùng phiên bản mới nhất, tránh stale closure khi component render lại
  const matchRef = useRef(matchFn);
  const refreshRef = useRef(refreshFn);
  const onVisRef = useRef(onVisOverride);

  matchRef.current = matchFn;
  refreshRef.current = refreshFn;
  onVisRef.current = onVisOverride;

  // Ref lưu timer debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visDebRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đánh dấu lần emit đầu tiên
  const firstEmitRef = useRef(true);

  useEffect(() => {
    // Chỉ subscribe khi đã đăng nhập
    if (!auth) return;

    const handle = (payload: Payload) => {
      // Bỏ qua notification đầu tiên sau khi mount
      if (firstEmitRef.current) {
        firstEmitRef.current = false;
        return;
      }

      // Không đúng loại notification cần xử lý
      if (!matchRef.current(payload)) return;

      // Debounce 300ms trước khi refresh
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void refreshRef.current();
      }, DEBOUNCE_MS);
    };

    // Subscribe vào event bus notification:new
    const unsubscribe = Subscribe(handle);

    return () => {
      unsubscribe();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [auth]);

  useEffect(() => {
    // Chỉ theo dõi khi đã đăng nhập
    if (!auth) return;
    if (typeof document === "undefined") return;

    // Khi người dùng quay lại tab thì refresh dữ liệu
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;

      // Debounce để tránh refresh nhiều lần liên tiếp
      if (visDebRef.current) clearTimeout(visDebRef.current);

      visDebRef.current = setTimeout(() => {
        visDebRef.current = null;

        // Nếu có callback riêng thì dùng, không thì dùng refresh mặc định
        const fn = onVisRef.current ?? refreshRef.current;
        void fn();
      }, VISIBILITY_DEBOUNCE_MS);
    };

    // Lắng nghe sự kiện đổi trạng thái tab
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);

      if (visDebRef.current) {
        clearTimeout(visDebRef.current);
        visDebRef.current = null;
      }
    };
  }, [auth]);
}