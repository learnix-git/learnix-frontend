import type { NotificationItem } from "./types";
import type { InvalidatePayload } from "./invalidate-bus";

/**
 * Type guard cho socket payload `notification:new`.
 *
 * Pattern copy từ `lib/chat/normalize.ts:71-79` (`isSocketMessageNew`).
 *
 * `sourceId` là optional (`number | null`) — không bắt buộc trong guard.
 */
export function isSocketNotificationNew(
  x: unknown,
): x is InvalidatePayload {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.id === "number" &&
    typeof r.type === "string" &&
    typeof r.title === "string" &&
    typeof r.content === "string" &&
    typeof r.createdAt === "string" &&
    typeof r.targetId === "number" &&
    typeof r.userId === "number"
  );
}

/**
 * Chuẩn hoá socket payload → InvalidatePayload.
 *  - Trả null nếu guard fail.
 *  - `sourceAlias` luôn = null vì socket không có; matcher / resolveNotificationRoute
 *    sẽ tự fallback `sourceId`.
 *  - `messageId` chỉ có trên một số type (vd `service_offer_received` — V2 §20).
 */
export function normalizeSocketNotification(
  raw: unknown,
): InvalidatePayload | null {
  if (!isSocketNotificationNew(raw)) return null;
  const r = raw as unknown as Record<string, unknown>;
  const messageId =
    typeof r.messageId === "number" && Number.isFinite(r.messageId)
      ? r.messageId
      : undefined;
  return {
    ...raw,
    sourceId: raw.sourceId ?? null,
    sourceAlias: null,
    ...(messageId !== undefined ? { messageId } : {}),
  };
}

/**
 * Adapter: InvalidatePayload → NotificationItem-shape tối thiểu đủ cho
 * `resolveNotificationRoute` hoạt động. Các field mà router KHÔNG đọc
 * (groupKey, latestCreators, unreadInGroup, count, isRead, summary,
 * latestTargetId, latestAt) được default an toàn.
 *
 * Dùng cho toast CTA trong ChatProvider — không nên dùng để hiển thị UI
 * danh sách notification (vì thiếu nhiều metadata).
 *
 * Lưu ý: `groupKey` set = null (không phải String(n.id)) — socket payload
 * chỉ là 1 event non-groupable, không có khái niệm groupKey. Trước đây
 * gán String(n.id) sai semantically; router không đọc groupKey nên không
 * ảnh hưởng, nhưng type giờ là `string | null` nên phải sửa cho khớp.
 */
export function toRouterShape(n: InvalidatePayload): NotificationItem {
  return {
    groupKey: null,
    type: n.type,
    sourceId: n.sourceId,
    sourceAlias: n.sourceAlias,
    title: n.title,
    content: n.content,
    summary: n.content,
    count: 1,
    unreadInGroup: 1,
    isRead: false,
    latestCreators: [],
    latestTargetId: n.targetId,
    latestAt: n.createdAt,
    ...(n.messageId !== undefined ? { messageId: n.messageId } : {}),
  };
}
