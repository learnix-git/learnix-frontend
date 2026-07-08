/**
 * Notification types — mirror schema trong `NOTIFICATION_GUIDE.md` (BE).
 *
 * 11 type đang được BE push (xem §5):
 *  - password_changed                  (non-groupable)
 *  - project_apply                     (groupable — duy nhất hiện tại)
 *  - project_invite                    (non-groupable)
 *  - project_approved                  (non-groupable)
 *  - order_paid                        (non-groupable)
 *  - payment_success                   (non-groupable)
 *  - order_completion_reminder         (non-groupable)
 *  - order_revision_request            (non-groupable)
 *  - order_dispute_created             (non-groupable)
 *  - order_dispute_reply               (non-groupable) — sourceId = dispute.id (backlog §12.1)
 *  - order_dispute_resolved            (non-groupable)
 *
 * Field `type` giữ `string` (không union literal) để tương thích khi BE bổ sung
 * type mới mà FE chưa migrate — `switch (n.type)` nên có `default: return null`
 * hoặc `fallback` icon cho các type lạ. Groupable chỉ có `project_apply`
 * (xem BE §3.1 `GROUPABLE_TYPES`).
 */
export interface NotificationItem {
  /**
   * Key nhóm theo `${type}:${sourceId}`. `null` cho non-groupable — VD
   * `password_changed`, `order_paid`, `payment_success`, ... Khi null thì
   * `count = 1`, `unreadInGroup = 0|1`, `latestTargetId` = id của chính
   * notification target đó.
   */
  groupKey: string | null;
  type: string;
  /**
   * ID đối tượng liên quan (project.id, order.id, dispute.id, user.id,...).
   * Nullable theo DB schema §2.1 — vài type (vd `password_changed`) vẫn
   * có number, nhưng `order_dispute_reply` đang backlog §12.1 có thể
   * trả null nếu dispute bị xóa. Luôn check `?? 0` trước khi dùng làm param.
   */
  sourceId: number | null;
  /**
   * Slug / code SEO-friendly của đối tượng liên quan (project.slug,
   * order.code, ...). BE trả thêm để FE build URL đẹp. `null` khi:
   *  - type không có entity tương ứng (`password_changed`, `order_dispute_reply`)
   *  - entity đã bị xóa khỏi DB
   *  - socket payload (realtime) — FE tự default = null
   * Fallback về `sourceId` nếu null.
   */
  sourceAlias: string | null;
  title: string;
  content: string;
  /**
   * Tóm tắt cho groupable. Với non-groupable, BE đặt = `content` (1:1).
   * Luôn là string (không null) — render thẳng.
   */
  summary: string;
  count: number;
  unreadInGroup: number;
  isRead: boolean;
  /**
   * Tên các actor mới nhất trong group. Với non-groupable, thường là `["Bạn"]`
   * (chính user là người trigger). Luôn là array — có thể rỗng.
   */
  latestCreators: string[];
  /**
   * ID của target row (`app_notification_targets.id`) cho notification hiện
   * tại — dùng cho `POST /notifications/read` (mark read endpoint yêu cầu
   * target.id, KHÔNG phải notification.id).
   */
  latestTargetId: number;
  /**
   * Timestamp của notification mới nhất trong group (groupable) hoặc của
   * chính notification (non-groupable). Format BE: `YYYY-MM-DD HH:mm:ss`
   * (không có timezone — `formatTimeAgo` đã normalize).
   */
  latestAt: string;
  /**
   * Optional deep-link id cho router. Hiện dùng cho `service_offer_received`
   * (V2 §20) — id của offer message để FE scroll/highlight trong conversation.
   * Không có trên notification list response (chỉ socket payload) → null/undefined
   * cho các notification lấy từ API list.
   */
  messageId?: number | null;
}
