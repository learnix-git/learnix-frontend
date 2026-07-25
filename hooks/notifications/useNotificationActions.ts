"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/stores/notifications";
import { ResolveNotificationRoute } from "@/lib/notifications/router";
import type { NotificationItem } from "@/lib/notifications/types";

// Hàm xử lý khi người dùng bấm vào thông báo
export function useNotificationActions() {
  const router = useRouter();

  // Đánh dấu đã đọc
  const markRead = useNotifications((s) => s.markRead);

  // Định tuyến trang
  const open = async (notice: NotificationItem): Promise<string | null> => {
    if (!notice.read) {
      void markRead(notice.id);
    }
    const route = ResolveNotificationRoute(notice);
    if (!route) 
      return null;
    
    router.push(route);
    return route;
  };

  return { open };
}