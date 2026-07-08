"use client";

import { useEffect, useState } from "react";
import {
  getLastSocketError,
  getSocketState,
  subscribeSocketError,
  subscribeSocketState,
  type ChatSocketState,
} from "@/lib/chat/socket";

export function useChatStatus(): {
  status: ChatSocketState;
  lastError: string | null;
} {
  const [status, setStatus] = useState<ChatSocketState>(getSocketState());
  const [lastError, setLastError] = useState<string | null>(getLastSocketError());

  useEffect(() => {
    setStatus(getSocketState());
    setLastError(getLastSocketError());
    const off1 = subscribeSocketState(setStatus);
    const off2 = subscribeSocketError(setLastError);
    return () => {
      off1();
      off2();
    };
  }, []);

  return { status, lastError };
}
