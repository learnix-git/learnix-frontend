import { io, Socket } from "socket.io-client";
import { CHAT_CONFIG } from "./config";

export type ChatSocketState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

// Instance Socket hiện tại
let socket: Socket | null = null;

// Trạng thái kết nối của Socket
let socketStatus: ChatSocketState = "idle";

// Lỗi Socket gần nhất
let socketError: string | null = null;

// Token dùng để kết nối lại
let socketToken: string | null = null;

// Danh sách lắng nghe trạng thái Socket
const socketStatusListeners = new Set<(s: ChatSocketState) => void>();

// Danh sách lắng nghe lỗi Socket
const socketErrorListeners = new Set<(e: string | null) => void>();

export const CHAT_AUTH_FAILED_EVENT = "chat:auth-failed";

const AUTH_FAIL_THRESHOLD = 3;
const AUTH_FAIL_WINDOW_MS = 30_000;

let authFailCount = 0;
let authFailWindowStart = 0;
let authFailDispatchTimer: ReturnType<typeof setTimeout> | null = null;

// Hàm lên lịch phát sự kiện đăng xuất khi xác thực thất bại nhiều lần
function ScheduleAuthFailureDispatch() {
  const now = Date.now();

  if (now - authFailWindowStart > AUTH_FAIL_WINDOW_MS) {
    authFailCount = 0;
    authFailWindowStart = now;
  }

  authFailCount += 1;

  if (authFailCount >= AUTH_FAIL_THRESHOLD) {
    if (authFailDispatchTimer) return;

    authFailDispatchTimer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(CHAT_AUTH_FAILED_EVENT));
      }

      authFailCount = 0;
      authFailWindowStart = 0;
      authFailDispatchTimer = null;
    }, 2000);
  }
}

// Hàm đặt lại bộ đếm xác thực thất bại
export function ResetAuthFailureTracking() {
  authFailCount = 0;
  authFailWindowStart = 0;

  if (authFailDispatchTimer) {
    clearTimeout(authFailDispatchTimer);
    authFailDispatchTimer = null;
  }
}

// Hàm cập nhật trạng thái Socket
function SetSocketStatus(next: ChatSocketState) {
  if (socketStatus === next) return;

  socketStatus = next;

  socketStatusListeners.forEach((listener) => {
    try {
      listener(next);
    } catch {
      // Ignore listener error
    }
  });
}

// Hàm cập nhật lỗi Socket
function SetSocketError(next: string | null) {
  if (socketError === next) return;

  socketError = next;

  socketErrorListeners.forEach((listener) => {
    try {
      listener(next);
    } catch {
      // Ignore listener error
    }
  });
}

// Hàm lấy trạng thái Socket hiện tại
export function GetSocketStatus(): ChatSocketState {
  return socketStatus;
}

// Hàm lấy lỗi Socket gần nhất
export function GetSocketError(): string | null {
  return socketError;
}

// Hàm đăng ký theo dõi trạng thái Socket
export function SubscribeSocketStatus(
  listener: (status: ChatSocketState) => void
): () => void {
  socketStatusListeners.add(listener);

  return () => {
    socketStatusListeners.delete(listener);
  };
}

// Hàm đăng ký theo dõi lỗi Socket
export function SubscribeSocketError(
  listener: (error: string | null) => void
): () => void {
  socketErrorListeners.add(listener);

  return () => {
    socketErrorListeners.delete(listener);
  };
}

// Hàm kết nối tới Socket Server
export function ConnectChat(token: string): Socket {
  if (socket?.connected && socketToken === token) {
    SetSocketStatus("connected");
    SetSocketError(null);
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  SetSocketStatus("connecting");
  SetSocketError(null);
  socketToken = token;

  const url = CHAT_CONFIG.SOCKET_URL;

  console.warn(
    "[chat] connecting to",
    url ? `${url}/socket.io` : "(same-origin /socket.io)"
  );

  socket = io(url || "/", {
    auth: { token },
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.warn("[chat] connected, sid=" + socket!.id);

    SetSocketStatus("connected");
    SetSocketError(null);

    ResetAuthFailureTracking();
  });

  socket.on("connect_error", (err) => {
    console.error("[chat] connect_error:", err.message);

    SetSocketStatus("error");
    SetSocketError(err.message);

    if (
      typeof window !== "undefined" &&
      err.message.toLowerCase().includes("invalid token")
    ) {
      ScheduleAuthFailureDispatch();
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("[chat] disconnected:", reason);
    SetSocketStatus("disconnected");
  });

  socket.on("reconnect_attempt", () => {
    SetSocketStatus("connecting");
  });

  return socket;
}

// Hàm kết nối lại Socket
export function ReconnectChat(): Socket | null {
  if (socketToken) {
    return ConnectChat(socketToken);
  }

  return null;
}

// Hàm ngắt kết nối Socket
export function DisconnectChat() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socketToken = null;

  SetSocketStatus("idle");
  SetSocketError(null);
}

// Hàm lấy instance Socket hiện tại
export function GetSocket(): Socket | null {
  return socket;
}