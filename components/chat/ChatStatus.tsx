"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useChatStatus } from "@/hooks/chat/useChatStatus";
import { GetToken, GetUser } from "@/lib/auth/session";
import { ConnectChat } from "@/lib/chat/socket";
import { useAuth } from "@/lib/stores/auth";

export function ChatStatus() {
  // Trạng thái và lỗi kết nối socket
  const { socketStatus, socketError } = useChatStatus();

  // Thông tin người dùng đăng nhập
  const user = useAuth((state) => state.user);

  // Chưa đăng nhập thì không hiển thị
  if (typeof window !== "undefined") {
    if (!GetToken() && !user) return null;
  } else if (!user) {
    return null;
  }

  // Đã kết nối hoặc đang kết nối thì không hiển thị
  if (
    socketStatus === "connected" ||
    socketStatus === "connecting" ||
    socketStatus === "idle"
  ) {
    return null;
  }

  // Kết nối lại socket
  const onConnect = () => {
    const token = GetToken();
    const stored = GetUser();
    const finalToken = token ?? stored?.token ?? null;

    if (finalToken) {
      ConnectChat(finalToken);
    }
  };

  return (
    // Thông báo mất kết nối
    <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-rose-500/15 border border-rose-500/30 backdrop-blur-md text-[11px] font-semibold text-rose-700 dark:text-rose-300 shadow-sm">
      {/* Icon trạng thái */}
      <WifiOff className="w-3.5 h-3.5" />

      {/* Nội dung thông báo */}
      <span
        className="cursor-help"
        title={socketError ? `Lỗi: ${socketError}` : "Mất kết nối trò chuyện"}
      >
        Mất kết nối trò chuyện
      </span>

      {/* Nút kết nối lại */}
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