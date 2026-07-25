import { ApiResponse } from "../api/types";

export interface NotificationItem {
  id: string;
  owner: string;
  title: string;
  content: string;
  link: string | null;
  type: string;
  read: boolean;
  created: string;
}

export interface NotificationListResponse extends ApiResponse<NotificationItem[]> {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface NotificationActionResponse extends ApiResponse<unknown> {
  updated: number;
}

export interface NotificationListParams {
  page?: number | undefined;
  limit?: number | undefined;
}