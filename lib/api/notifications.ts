import client from "./client";
import type { ApiResponse } from "./types";
import type { NotificationItem } from "@/lib/notifications/types";

export interface NotificationListResponse extends ApiResponse<NotificationItem[]> {
  unreadCount: number;
}

export interface NotificationActionResponse extends ApiResponse<unknown> {
  updated: number;
}

export interface NotificationListParams {
  page?: number | undefined;
  limit?: number | undefined;
}

export const NotificationAPI = {
  list: async (
    params: NotificationListParams = {},
  ): Promise<NotificationListResponse> => {
    const res = await client.post<NotificationListResponse>("/notifications", {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
    return res.data;
  },

  read: async (id: string): Promise<NotificationActionResponse> => {
    const res = await client.post<NotificationActionResponse>("/notifications/read", {
      id,
    });
    return res.data;
  },

  readGroup: async (groupKey: string): Promise<NotificationActionResponse> => {
    const res = await client.post<NotificationActionResponse>(
      "/notifications/read-group",
      { groupKey },
    );
    return res.data;
  },

  readAll: async (): Promise<NotificationActionResponse> => {
    const res = await client.post<NotificationActionResponse>(
      "/notifications/read-all",
      {},
    );
    return res.data;
  },
};