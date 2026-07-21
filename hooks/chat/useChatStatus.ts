"use client";

import { useEffect, useState } from "react";
import {
  GetSocketError,
  GetSocketStatus,
  SubscribeSocketError,
  SubscribeSocketStatus,
  type ChatSocketState,
} from "@/lib/chat/socket";

export function useChatStatus(): {
  socketStatus: ChatSocketState;
  socketError: string | null;
} {
  // Trạng thái kết nối và lỗi của socket
  const [socketStatus, setSocketStatus] = useState<ChatSocketState>(
    GetSocketStatus()
  );
  const [socketError, setSocketError] = useState<string | null>(
    GetSocketError()
  );

  // Đăng ký lắng nghe trạng thái và lỗi của socket
  useEffect(() => {
    setSocketStatus(GetSocketStatus());
    setSocketError(GetSocketError());

    const offStatus = SubscribeSocketStatus(setSocketStatus);
    const offError = SubscribeSocketError(setSocketError);

    return () => {
      offStatus();
      offError();
    };
  }, []);

  // Trả về trạng thái và lỗi hiện tại
  return {
    socketStatus,
    socketError,
  };
}