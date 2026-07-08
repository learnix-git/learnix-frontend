"use client";

import { useEffect, useRef } from "react";
import { ChatAPI } from "@/lib/api/chat";
import { usePresenceStore } from "@/lib/stores/presence";
import { subscribeSocketState } from "@/lib/chat/socket";

/**
 * Spec 7.5: sync dot online/offline theo realtime presence.
 *
 * Caller: ChatList (gom tất cả peerId đang hiển thị) -> usePresenceSync(peerIds).
 *
 * Behavior:
 * - Fetch ngay khi mount + ngay khi danh sách peerIds thay đổi (vd vừa load list)
 * - Cũng fetch ngay khi socket reconnect (vd vừa F5 hoặc tạm mất mạng)
 * - Sau đó realtime `presence:update` trong ChatProvider là nguồn cập nhật chính.
 * - Catch error im lặng: Node down -> trả [] -> tất cả treated offline
 *
 * Dùng `mergeOnline(requested, online)` thay vì `setOnline(online)`:
 * REST sync chỉ biết status của các id mình hỏi -> không được wipe các user khác
 * trong store (vd ChatWindow chỉ hỏi 1 peer, không được làm mất state của các
 * peer khác trong ChatList).
 */

export function usePresenceSync(userIds: number[]): void {
  const mergeOnline = usePresenceStore((s) => s.mergeOnline);

  // Dùng ref để fetchOnce luôn đọc giá trị mới nhất mà không cần re-create effect
  const idsRef = useRef<number[]>(userIds);
  idsRef.current = userIds;

  // Stable key từ userIds để trigger re-fetch khi list đổi (vd conv mới xuất hiện)
  const idsKey = userIds.slice().sort((a, b) => a - b).join(",");

  useEffect(() => {
    let cancelled = false;

    const fetchOnce = async () => {
      const raw = idsRef.current ?? [];
      const ids = Array.from(
        new Set(
          raw
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0)
        )
      );
      if (ids.length === 0) return;

      try {
        const res = await ChatAPI.checkOnline(ids);
        if (cancelled) return;
        if (res.code === 200 && Array.isArray(res.data.online)) {
          mergeOnline(ids, res.data.online);
        }
      } catch (e) {
        console.warn("[chat] usePresenceSync fetch failed", e);
      }
    };

    // Fetch ngay khi mount hoặc khi idsKey đổi. Các thay đổi sau đó đi qua realtime.
    fetchOnce();

    // Re-fetch khi socket reconnect — edge case khi A vừa F5 hoặc đứt mạng,
    // không nhận được realtime presence event của các user đã online từ trước.
    const unsubState = subscribeSocketState((st) => {
      if (st === "connected") {
        fetchOnce();
      }
    });

    return () => {
      cancelled = true;
      unsubState();
    };
    // Re-run khi danh sách peer đổi để fetch ngay với list mới
  }, [mergeOnline, idsKey]);
}
