import type { NotificationItem } from "./types";

export function ResolveNotificationRoute(notice: NotificationItem): string | null {
  return notice.link;
}

export const NOTIFICATION_TYPE: Record<string, string> = {
  message: "Thông báo tin nhắn",
};

export function GetNotificationType(type: string): string {
  return NOTIFICATION_TYPE[type] ?? "Thông báo";
}