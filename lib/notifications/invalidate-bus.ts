"use client";

/**
 * Singleton pub/sub bus cho notification:new từ socket.
 *
 * Mỗi trang đăng ký 1 listener qua `subscribeInvalidate`. ChatProvider (hoặc
 * provider socket tương ứng) gọi `emitInvalidate(payload)` mỗi khi nhận event
 * `notification:new` — listener nào tự quyết định có nên refresh data hay
 * không (dựa trên `matchFn` đăng ký riêng, vd trang /my-bookings chỉ refresh
 * khi `payload.type` bắt đầu bằng `booking_`).
 *
 * In-house Set<listener> — tránh thêm dependency mitt/nanoevents cho 1 use
 * case nhỏ.
 *
 * Module-level singleton → sống xuyên suốt session, không bị ảnh hưởng bởi
 * React strict mode remount.
 */

export interface InvalidatePayload {
  id: string;
  type: string;
  sourceId: string | null;
  /**
   * Slug / code SEO-friendly của đối tượng liên quan. Socket payload từ BE
   * KHÔNG có — FE tự default = null; matcher sẽ fallback `sourceId` nếu
   * `resolveNotificationRoute` cần.
   */
  sourceAlias: string | null;
  title: string;
  content: string;
  createdAt: string;
  targetId: string;
  userId: string;
  /**
   * Optional deep-link id cho routing. Hiện dùng cho `message_new`: id của
   * tin nhắn trong hội thoại để FE scroll/highlight.
   */
  messageId?: string;
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