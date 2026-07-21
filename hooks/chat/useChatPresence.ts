"use client";

import { useEffect, useRef } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { usePresenceStore } from "@/lib/stores/chat";
import { SubscribeSocketStatus } from "@/lib/chat/socket";

export function useChatPresence(userIds: string[]): void {
  // Hàm cập nhật trạng thái online vào store
  const mergeOnline = usePresenceStore((s) => s.mergeOnline);

  // Lưu danh sách id mới nhất
  const idsRef = useRef<string[]>(userIds);
  idsRef.current = userIds;

  // Tạo key để theo dõi khi danh sách id thay đổi
  const idsKey = userIds.slice().sort().join(",");

  useEffect(() => {
    let cancelled = false;

    // Lấy trạng thái online từ server
    const FetchOnline = async () => {
      // Loại bỏ id trống và id trùng lặp
      const raw = idsRef.current ?? [];
      const ids = Array.from(
        new Set(
          raw
            .map((id) => String(id).trim())
            .filter((id) => id.length > 0)
        )
      );

      // Không có người dùng cần kiểm tra
      if (ids.length === 0)
        return;

      try {
        const res = await ChatAPI.CheckOnline(ids);

        // Bỏ kết quả nếu hook đã unmount
        if (cancelled)
          return;

        // Cập nhật trạng thái online vào store
        if (res.code === 200 && Array.isArray(res.data?.online)) {
          mergeOnline(ids, res.data.online);
        }
      } catch (e) {
        console.warn("[chat] usePresenceSync fetch failed", e);
      }
    };

    // Tải trạng thái online lần đầu
    FetchOnline();

    // Khi socket kết nối lại thì đồng bộ trạng thái online
    const unsubState = SubscribeSocketStatus((socketStatus : any) => {
      if (socketStatus === "connected") {
        FetchOnline();
      }
    });

    // Hủy theo dõi khi component unmount
    return () => {
      cancelled = true;
      unsubState();
    };
  }, [mergeOnline, idsKey]);
}