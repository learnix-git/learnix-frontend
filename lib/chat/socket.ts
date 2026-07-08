import { io, Socket } from "socket.io-client";
import { CHAT_CONFIG } from "./config";

// Theo spec 6.3: singleton socket với reconnection 1s/5s.
// Auth fail -> dispatch `chat:auth-failed` để ChatProvider logout.

export type ChatSocketState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

let socket: Socket | null = null;
let state: ChatSocketState = "idle";
let lastError: string | null = null;
let currentToken: string | null = null;

const stateListeners = new Set<(s: ChatSocketState) => void>();
const errorListeners = new Set<(e: string | null) => void>();

export const CHAT_AUTH_FAILED_EVENT = "chat:auth-failed";

// Debounce: chỉ dispatch CHAT_AUTH_FAILED_EVENT khi gặp N lần lỗi
// "invalid token" liên tiếp trong cửa sổ WINDOW_MS. Nếu socket reconnect
// thành công giữa chừng thì reset bộ đếm — tránh đá user oan vì một
// lỗi thoáng qua.
const AUTH_FAIL_THRESHOLD = 3;
const AUTH_FAIL_WINDOW_MS = 30_000;
let authFailCount = 0;
let authFailWindowStart = 0;
let authFailDispatchTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleAuthFailureDispatch() {
  const now = Date.now();
  if (now - authFailWindowStart > AUTH_FAIL_WINDOW_MS) {
    authFailCount = 0;
    authFailWindowStart = now;
  }
  authFailCount += 1;

  if (authFailCount >= AUTH_FAIL_THRESHOLD) {
    if (authFailDispatchTimer) return; // đã lên lịch rồi
    // Đợi thêm 1 nhịp để chắc chắn lỗi vẫn còn (socket vẫn chưa
    // reconnect thành công) rồi mới phát event.
    authFailDispatchTimer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(CHAT_AUTH_FAILED_EVENT));
      }
      authFailCount = 0;
      authFailWindowStart = 0;
      authFailDispatchTimer = null;
    }, 2_000);
  }
}

export function resetAuthFailureTracking() {
  authFailCount = 0;
  authFailWindowStart = 0;
  if (authFailDispatchTimer) {
    clearTimeout(authFailDispatchTimer);
    authFailDispatchTimer = null;
  }
}

function setState(next: ChatSocketState) {
  if (state === next) return;
  state = next;
  stateListeners.forEach((fn) => {
    try {
      fn(next);
    } catch {
      /* noop */
    }
  });
}

function setError(next: string | null) {
  if (lastError === next) return;
  lastError = next;
  errorListeners.forEach((fn) => {
    try {
      fn(next);
    } catch {
      /* noop */
    }
  });
}

export function getSocketState(): ChatSocketState {
  return state;
}
export function getLastSocketError(): string | null {
  return lastError;
}
export function subscribeSocketState(fn: (s: ChatSocketState) => void): () => void {
  stateListeners.add(fn);
  return () => {
    stateListeners.delete(fn);
  };
}
export function subscribeSocketError(fn: (e: string | null) => void): () => void {
  errorListeners.add(fn);
  return () => {
    errorListeners.delete(fn);
  };
}

export function connectChat(token: string): Socket {
  if (socket?.connected && currentToken === token) {
    setState("connected");
    setError(null);
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  setState("connecting");
  setError(null);
  currentToken = token;

  // CHAT_CONFIG.SOCKET_URL lấy từ NEXT_PUBLIC_CHAT_URL (vd https://freelancer.minasoft.vn).
  // socket.io-client sẽ tự nối `${SOCKET_URL}/socket.io/` (path mặc định).
  const url = CHAT_CONFIG.SOCKET_URL;

  console.warn("[chat] connecting to", url ? `${url}/socket.io` : "(same-origin /socket.io)");

  socket = io(url || "/", {
    // Không set path → socket.io-client dùng mặc định "/socket.io", khớp với BE.
    auth: { token },
    // BE bật Access-Control-Allow-Credentials: true, cần bật cùng phía client.
    withCredentials: true,
    // Chỉ sử dụng websocket để tối ưu hiệu năng và tránh HTTP long-polling liên tục.
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    console.warn("[chat] connected, sid=" + socket!.id);
    setState("connected");
    setError(null);
    // Reset bộ đếm auth-fail khi reconnect thành công — nếu trước đó
    // có vài lần "invalid token" thoáng qua mà socket đã tự hồi phục
    // thì không cần dispatch CHAT_AUTH_FAILED_EVENT nữa.
    resetAuthFailureTracking();
  });

  socket.on("connect_error", (err) => {
    console.error("[chat] connect_error:", err.message);
    setState("error");
    setError(err.message);

    // Chỉ dispatch `chat:auth-failed` khi lỗi auth thực sự dai dẳng
    // — socket.io reconnect liên tục nên một lần "invalid token"
    // thoáng qua (server restart, network blip, race với refresh)
    // không đủ cơ sở để đá user ra. Đợi 3 lần liên tiếp trong 30s
    // rồi mới phát event. Khi đó ChatProvider gọi logout() là an toàn.
    if (
      typeof window !== "undefined" &&
      err.message.toLowerCase().includes("invalid token")
    ) {
      scheduleAuthFailureDispatch();
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("[chat] disconnected:", reason);
    setState("disconnected");
  });

  socket.on("reconnect_attempt", () => {
    setState("connecting");
  });

  return socket;
}

export function reconnectChat(): Socket | null {
  if (currentToken) return connectChat(currentToken);
  return null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectChat() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
  setState("idle");
  setError(null);
}
