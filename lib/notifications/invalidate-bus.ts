"use client";

/**
 * Singleton pub/sub bus cho notification:new từ socket.
 *
 * Mỗi trang đăng ký 1 listener qua `subscribeInvalidate`. ChatProvider gọi
 * `emitInvalidate(payload)` mỗi khi nhận event `notification:new` từ socket —
 * listener nào tự quyết định có nên refresh data hay không (dựa trên
 * `matchFn` đăng ký riêng).
 *
 * Pattern copy từ `lib/chat/socket.ts:19-20,54-65` (Set<listener> in-house) —
 * tránh thêm dependency mitt/nanoevents cho 1 use case nhỏ.
 *
 * Module-level singleton → sống xuyên suốt session, không bị ảnh hưởng bởi
 * React strict mode remount.
 */

export interface InvalidatePayload {
  id: number;
  type: string;
  sourceId: number | null;
  /**
   * Slug / code SEO-friendly của đối tượng liên quan. Socket payload từ BE
   * KHÔNG có — FE tự default = null; matcher sẽ fallback `sourceId` nếu
   * `resolveNotificationRoute` cần.
   */
  sourceAlias: string | null;
  title: string;
  content: string;
  createdAt: string;
  targetId: number;
  userId: number;
  /**
   * Optional deep-link id cho routing. Hiện dùng cho `service_offer_received`
   * (V2 §20): id của offer message trong conversation để FE scroll/highlight.
   */
  messageId?: number;
}

export type InvalidateListener = (payload: InvalidatePayload) => void;

const listeners = new Set<InvalidateListener>();

/**
 * Subscribe 1 listener. Return 1 hàm unsubscribe — gọi trong useEffect cleanup
 * để tránh leak khi component unmount.
 */
export function subscribeInvalidate(fn: InvalidateListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Phát payload tới tất cả listener hiện tại. Mỗi listener được wrap try/catch
 * để 1 listener throw không phá vỡ các listener khác.
 */
export function emitInvalidate(payload: InvalidatePayload): void {
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (err) {
      console.error("[invalidate-bus] listener threw", err);
    }
  });
}

/**
 * Test helper — clear toàn bộ listeners. Không dùng trong production code.
 */
export function _resetInvalidateBus(): void {
  listeners.clear();
}
