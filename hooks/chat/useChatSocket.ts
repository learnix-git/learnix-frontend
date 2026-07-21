"use client";

import { useEffect } from "react";
import { GetSocket } from "@/lib/chat/socket";

export function useChatSocket<T = unknown>(
  event: string,
  handler: (data: T) => void,
  deps: ReadonlyArray<unknown> = []
) {
  useEffect(() => {
    const socket = GetSocket();

    // Nếu socket chưa khởi tạo thì không đăng ký sự kiện
    if (!socket) return;

    // Đăng ký lắng nghe sự kiện
    socket.on(event, handler);

    return () => {
      // Hủy lắng nghe khi component unmount hoặc dependencies thay đổi
      socket.off(event, handler);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}