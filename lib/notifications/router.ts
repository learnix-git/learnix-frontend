import type { NotificationItem } from "./types";

export interface NotificationRoute {
  href: string;
  external?: boolean;
}

/**
 * Resolve URL đích cho 1 notification, dựa trên cấu trúc `app/` hiện có của
 * Learnix (booking, my-bookings, my-orders, post-teacher, certificates,
 * teacher-profile, student-profile, assignment/[id], submission/[id], chat,
 * settings, ...).
 *
 * `sourceId` = id đối tượng liên quan (order / booking / post / certificate /
 * task / submission / report / chat). `sourceAlias` = slug/code khi có, để
 * URL đẹp hơn. Ưu tiên `sourceAlias`, fallback `sourceId`.
 *
 * Vài type (`enrollment_success`, `report_created`, `report_resolved`) tạm
 * trỏ về trang gần nhất vì chưa có route riêng trong danh sách hiện tại —
 * đánh dấu TODO, cập nhật khi có route thật.
 *
 * Type chưa handle → return `null` — caller (Header bell / trang chi tiết)
 * hiển thị toast không có nút "Mở".
 */
export function resolveNotificationRoute(n: NotificationItem): NotificationRoute | null {
  const sourceId = n.sourceId ?? "";
  const alias = n.sourceAlias?.trim() || "";

  switch (n.type) {
    case "order_paid":
    case "payment_success": {
      if (alias) return { href: `/my-orders?code=${encodeURIComponent(alias)}` };
      if (sourceId) return { href: `/my-orders?orderId=${sourceId}` };
      return { href: "/my-orders" };
    }

    case "booking_requested":
    case "booking_confirmed":
    case "booking_cancelled":
    case "booking_rescheduled": {
      // Cả học viên lẫn gia sư đều xem chi tiết lịch qua /my-bookings.
      if (sourceId) return { href: `/my-bookings?bookingId=${sourceId}` };
      return { href: "/my-bookings" };
    }

    case "post_bid": {
      // Groupable: chủ bài đăng (học viên) xem danh sách báo giá.
      if (!alias && !sourceId) return { href: "/post-teacher" };
      const qs = alias
        ? `postAlias=${encodeURIComponent(alias)}`
        : `postId=${sourceId}`;
      return { href: `/post-teacher?${qs}` };
    }
    case "bid_accepted": {
      // Gia sư: báo giá của mình vừa được chọn.
      if (alias) return { href: `/post-teacher?postAlias=${encodeURIComponent(alias)}` };
      if (sourceId) return { href: `/post-teacher?postId=${sourceId}` };
      return { href: "/post-teacher" };
    }

    case "enrollment_success": {
      // TODO: chưa có trang "khoá học của tôi" riêng trong route list hiện tại
      // — tạm trỏ về student-profile, đổi lại khi có route thật.
      return { href: "/student-profile" };
    }

    case "certificate_issued": {
      if (alias) return { href: `/certificates?code=${encodeURIComponent(alias)}` };
      if (sourceId) return { href: `/certificates?certId=${sourceId}` };
      return { href: "/certificates" };
    }

    case "review_received": {
      // TODO: tạm trỏ về teacher-profile (tab đánh giá); xác nhận lại route.
      return { href: "/teacher-profile" };
    }

    case "assignment_graded": {
      if (sourceId) return { href: `/assignment/${sourceId}` };
      return null;
    }
    case "exam_graded": {
      if (sourceId) return { href: `/submission/${sourceId}` };
      return null;
    }

    case "report_created":
    case "report_resolved": {
      // TODO: chưa có trang quản lý report trong route list — tạm trỏ settings.
      return { href: "/settings" };
    }

    case "message_new": {
      // sourceId = conversationId; messageId (optional) để FE scroll/highlight.
      const conversationId = sourceId;
      const messageId = n.messageId ?? "";
      if (conversationId) {
        const qs = new URLSearchParams({ c: conversationId });
        if (messageId) qs.set("messageId", messageId);
        return { href: `/chat?${qs.toString()}` };
      }
      return { href: "/chat" };
    }

    case "password_changed": {
      return { href: "/settings" };
    }

    default:
      return null;
  }
}

/**
 * 17 type đang dùng (xem `types.ts` header). Giữ alphabet theo nhóm cho dễ
 * scan + update khi BE bổ sung type mới.
 */
export const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  // Đơn hàng / thanh toán
  order_paid: "Đơn hàng đã thanh toán",
  payment_success: "Thanh toán thành công",
  // Đặt lịch học 1-1
  booking_requested: "Yêu cầu đặt lịch mới",
  booking_confirmed: "Lịch học đã xác nhận",
  booking_cancelled: "Lịch học đã huỷ",
  booking_rescheduled: "Lịch học đã đổi giờ",
  // Bài đăng tìm gia sư
  post_bid: "Báo giá mới cho bài đăng",
  bid_accepted: "Báo giá được chọn",
  // Khoá học
  enrollment_success: "Ghi danh khoá học thành công",
  certificate_issued: "Chứng chỉ mới",
  review_received: "Đánh giá mới",
  // Bài tập / bài kiểm tra
  assignment_graded: "Bài tập đã được chấm",
  exam_graded: "Bài kiểm tra đã được chấm",
  // Báo cáo
  report_created: "Báo cáo mới",
  report_resolved: "Báo cáo đã xử lý",
  // Tin nhắn
  message_new: "Tin nhắn mới",
  // Tài khoản
  password_changed: "Bảo mật tài khoản",
};

export function getNotificationTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_LABEL[type] ?? "Thông báo";
}