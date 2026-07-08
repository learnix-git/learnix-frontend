import type { NotificationItem } from "./types";

export interface NotificationRoute {
  href: string;
  external?: boolean;
}

/**
 * Resolve URL đích cho 1 notification.
 * BE §3.1: `sourceId` = id đối tượng liên quan (project / order / dispute / user).
 * BE bổ sung `sourceAlias` = slug (project) / code (order) / … để URL đẹp.
 * `latestTargetId` = id của 1 target row (chỉ dùng cho /read single).
 *
 * URL dùng dạng tiếng Việt SEO-friendly (theo bảng rewrite trong
 * next.config.ts). Ưu tiên `sourceAlias` nếu có, fallback `sourceId`.
 *
 * Type chưa handle → return `null` — caller (Header bell) hiển thị toast
 * không có nút "Mở".
 */
export function resolveNotificationRoute(n: NotificationItem): NotificationRoute | null {
  const sourceId = Number(n.sourceId ?? 0);
  const alias = n.sourceAlias?.trim() || "";
  switch (n.type) {
    case "project_apply": {
      // Groupable: chủ dự án xem danh sách ứng viên.
      if (!alias && !sourceId) return { href: "/du-an-cua-toi" };
      const qs = alias
        ? `projectAlias=${encodeURIComponent(alias)}`
        : `projectId=${sourceId}`;
      return { href: `/du-an-cua-toi?${qs}` };
    }
    case "project_invite": {
      // Creator được mời vào private project → trang lời mời.
      return { href: "/du-an-duoc-moi" };
    }
    case "project_approved": {
      // Chủ dự án: dự án vừa được admin duyệt. Trang chi tiết nhận slug.
      if (alias) return { href: `/du-an-cua-toi/${encodeURIComponent(alias)}` };
      if (sourceId) return { href: `/du-an-cua-toi/${sourceId}` };
      return { href: "/du-an-cua-toi" };
    }
    case "order_paid":
    case "payment_success":
    case "order_completion_reminder":
    case "order_revision_request":
    case "order_dispute_created":
    case "order_dispute_reply":
    case "order_dispute_resolved": {
      // Tất cả order-related → trang chi tiết đơn. Ưu tiên alias (order.code).
      // `order_dispute_reply` có sourceId = dispute.id và sourceAlias = null
      // (backlog §12.1) → fallback sourceId trỏ về order tương ứng khi BE fix.
      if (alias) return { href: `/don-hang/${encodeURIComponent(alias)}` };
      if (sourceId) return { href: `/don-hang/${sourceId}` };
      return { href: "/don-hang" };
    }
    case "service_offer_received": {
      // V2 §20: buyer nhận offer từ seller trong chat type=service. Mở thẳng
      // conversation để buyer xem + accept/decline ngay.
      // - `sourceId` = conversationId (BE §20 emit 2)
      // - `messageId` = id của offer message trong conversation (optional,
      //   để FE highlight / scroll to).
      const conversationId = sourceId;
      const messageId = Number(n.messageId ?? 0);
      if (conversationId > 0) {
        const qs = new URLSearchParams({ c: String(conversationId) });
        if (messageId > 0) qs.set("messageId", String(messageId));
        return { href: `/tin-nhan?${qs.toString()}` };
      }
      return { href: "/tin-nhan" };
    }
    case "password_changed": {
      return { href: "/cai-dat/mat-khau" };
    }
    default:
      return null;
  }
}

/**
 * 12 type đang dùng (xem `types.ts` header). Giữ alphabet cho dễ scan +
 * update khi BE bổ sung type mới.
 */
export const NOTIFICATION_TYPE_LABEL: Record<string, string> = {
  // Order-related
  order_completion_reminder: "Nhắc hoàn thành đơn",
  order_dispute_created: "Mở tranh chấp",
  order_dispute_reply: "Phản hồi tranh chấp",
  order_dispute_resolved: "Tranh chấp đã xử lý",
  order_paid: "Đơn hàng đã thanh toán",
  order_revision_request: "Yêu cầu chỉnh sửa",
  payment_success: "Thanh toán thành công",
  // Project-related
  project_apply: "Ứng tuyển dự án",
  project_approved: "Dự án được duyệt",
  project_invite: "Lời mời dự án",
  // Service chat
  service_offer_received: "Offer dịch vụ mới",
  // Account
  password_changed: "Bảo mật tài khoản",
};

export function getNotificationTypeLabel(type: string): string {
  return NOTIFICATION_TYPE_LABEL[type] ?? "Thông báo";
}
