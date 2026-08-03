import client from "./client";
import type { 
  NotificationActionResponse, 
  NotificationListParams, 
  NotificationListResponse 
} from "@/lib/notifications/types";

export const NotificationAPI = {
  // POST /notifications
  list: async (
    params: NotificationListParams = {},
  ): Promise<NotificationListResponse> => {
    const res = await client.post<NotificationListResponse>("/notifications", {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
    return res.data;
  },

  // POST /notifications/read
  read: async (id: string): Promise<NotificationActionResponse> => {
    const res = await client.post<NotificationActionResponse>("/notifications/read", {
      id,
    });
    return res.data;
  },

  // POST /notifications/read-all
  readAll: async (): Promise<NotificationActionResponse> => {
    const res = await client.post<NotificationActionResponse>(
      "/notifications/read-all",
      {},
    );
    return res.data;
  },
};