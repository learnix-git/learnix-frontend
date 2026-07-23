/**
 * Notification types — Learnix (marketplace giáo dục: khoá học + gia sư 1-1).
 *
 * 17 type đang định nghĩa (xem `router.ts::NOTIFICATION_TYPE_LABEL` để đồng bộ):
 *
 *  Đơn hàng / thanh toán (model `Order`)
 *   - order_paid                  (non-groupable)
 *   - payment_success             (non-groupable)
 *
 *  Đặt lịch học 1-1 (model `Booking`)
 *   - booking_requested           (non-groupable) — học viên gửi yêu cầu tới gia sư
 *   - booking_confirmed           (non-groupable) — gia sư xác nhận
 *   - booking_cancelled           (non-groupable)
 *   - booking_rescheduled         (non-groupable)
 *
 *  Bài đăng tìm gia sư (model `Post` / `Bid`)
 *   - post_bid                    (groupable — nhiều gia sư báo giá cùng 1 bài đăng)
 *   - bid_accepted                (non-groupable)
 *
 *  Khoá học
 *   - enrollment_success          (non-groupable) — ghi danh khoá học thành công
 *   - certificate_issued          (non-groupable)
 *   - review_received             (non-groupable) — gia sư/khoá học nhận đánh giá mới
 *
 *  Bài tập / bài kiểm tra
 *   - assignment_graded           (non-groupable) — model `Task`
 *   - exam_graded                 (non-groupable) — model `Submission`
 *
 *  Báo cáo / khiếu nại (model `Report`)
 *   - report_created              (non-groupable)
 *   - report_resolved             (non-groupable)
 *
 *  Tin nhắn
 *   - message_new                 (non-groupable) — dùng `messageId` để deep-link
 *
 *  Tài khoản
 *   - password_changed            (non-groupable)
 *
 * Field `type` giữ `string` (không union literal) để tương thích khi BE bổ sung
 * type mới mà FE chưa migrate — `switch (n.type)` nên có `default: return null`
 * hoặc `fallback` icon cho các type lạ. Groupable hiện chỉ có `post_bid`.
 */
export interface NotificationItem {
  /**
   * Key nhóm theo `${type}:${sourceId}`. `null` cho non-groupable — VD
   * `password_changed`, `order_paid`, `booking_confirmed`, ... Khi null thì
   * `count = 1`, `unreadInGroup = 0|1`, `latestTargetId` = id của chính
   * notification target đó.
   */
  groupKey: string | null;
  type: string;
  /**
   * ID đối tượng liên quan (order.id, booking.id, post.id, course.id,
   * certificate.id, task.id, submission.id, report.id, chat.id, user.id...).
   * Nullable — luôn check `?? 0` trước khi dùng làm param route.
   */
  sourceId: string | null;
  /**
   * Slug / code SEO-friendly của đối tượng liên quan (order.code,
   * course.slug, certificate.code, ...). BE trả thêm để FE build URL đẹp.
   * `null` khi:
   *  - type không có entity tương ứng (`password_changed`, `report_*`)
   *  - entity đã bị xoá khỏi DB
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
   * Tên các actor mới nhất trong group (vd tên các gia sư đã báo giá cho
   * `post_bid`). Với non-groupable, thường là `["Bạn"]` hoặc tên đối tác
   * (gia sư/học viên) trigger sự kiện. Luôn là array — có thể rỗng.
   */
  latestCreators: string[];
  /**
   * ID của target row (`app_notification_targets.id`) cho notification hiện
   * tại — dùng cho `POST /notifications/read` (mark read endpoint yêu cầu
   * target.id, KHÔNG phải notification.id).
   */
  latestTargetId: string;
  /**
   * Timestamp của notification mới nhất trong group (groupable) hoặc của
   * chính notification (non-groupable). Format BE: `YYYY-MM-DD HH:mm:ss`
   * (không có timezone — `formatTimeAgo` đã normalize).
   */
  latestAt: string;
  /**
   * Optional deep-link id cho router. Dùng cho `message_new` — id của tin
   * nhắn trong hội thoại để FE scroll/highlight. Không có trên notification
   * list response (chỉ socket payload) → null/undefined cho notification
   * lấy từ API list.
   */
  messageId?: string | null;
}