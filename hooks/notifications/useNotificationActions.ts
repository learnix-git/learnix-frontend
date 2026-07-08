"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/stores/notifications";
import { resolveNotificationRoute } from "@/lib/notifications/router";
import type { NotificationItem } from "@/lib/notifications/types";

/**
 * Click 1 notification:
 *   - mark as read (groupable → read-group, non-groupable → read) — fire-and-forget
 *   - navigate ngay, không chờ server (UX tốt hơn)
 *   - nếu resolveRoute trả null → caller hiển thị toast "Chưa có trang đích"
 */
export function useNotificationActions() {
  const router = useRouter();
  const markRead = useNotifications((s) => s.markRead);
  const markReadGroup = useNotifications((s) => s.markReadGroup);

  const open = async (n: NotificationItem): Promise<string | null> => {
    if (!n.isRead) {
      // Fire-and-forget: navigate trước, mark read chạy nền.
      if (n.groupKey) {
        void markReadGroup(n.groupKey);
      } else if (n.latestTargetId) {
        void markRead(n.latestTargetId);
      }
    }
    const route = resolveNotificationRoute(n);
    if (!route) return null;
    router.push(route.href);
    return route.href;
  };

  return { open };
}
