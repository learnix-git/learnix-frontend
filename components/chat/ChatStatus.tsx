"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useChatStatus } from "@/hooks/chat/useChatStatus";
import { GetToken, GetUser } from "@/lib/auth/session";
import { connectChat } from "@/lib/chat/socket";
import { useAuth } from "@/lib/stores/auth";

export function ChatStatus() {
  const { status, lastError } = useChatStatus();
  const user = useAuth((state) => state.user);

  if (typeof window !== "undefined") {
    if (!GetToken() && !user) return null;
  } else if (!user) {
    return null;
  }

  if (status === "connected" || status === "connecting" || status === "idle") {
    return null;
  }

  const onConnect = () => {
    const token = GetToken();
    const stored = GetUser();
    const finalToken = token ?? stored?.token ?? null;
    if (finalToken) {
      connectChat(finalToken);
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-rose-500/15 border border-rose-500/30 backdrop-blur-md text-[11px] font-semibold text-rose-700 dark:text-rose-300 shadow-sm">
      <WifiOff className="w-3.5 h-3.5" />
      <span
        className="cursor-help"
        title={lastError ? `Lỗi: ${lastError}` : "Mất kết nối trò chuyện"}
      >
        Mất kết nối trò chuyện
      </span>
      <button
        onClick={onConnect}
        className="ml-1 flex items-center gap-1 rounded-full px-2 py-1 hover:bg-rose-500/10 cursor-pointer"
        title="Thử lại"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Thử lại</span>
      </button>
    </div>
  );
}