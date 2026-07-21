"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth";
import { usePresenceStore } from "@/lib/stores/chat";
import { GetToken } from "@/lib/auth/session";
import {
  GetSocket,
  ConnectChat,
  DisconnectChat,
  ReconnectChat,
  SubscribeSocketStatus,
  CHAT_AUTH_FAILED_EVENT,
} from "@/lib/chat/socket";
import type { SocketPresence } from "@/lib/chat/types";
import { useChatStore } from "@/lib/stores/chat";
import { CheckMessage, NormalizeMessage } from "@/lib/chat/normalize";
import { useNotifications } from "@/lib/stores/notifications";
import {
  isSocketNotificationNew,
  normalizeSocketNotification,
} from "@/lib/notifications/normalize";
import { emitInvalidate } from "@/lib/notifications/invalidate-bus";
import { toast } from "sonner";

const OFFLINE_GRACE_MS = 10_000;

export function ChatProvider({ children }: { children: ReactNode }) {
  // Token của người dùng
  const userToken = useAuth((state) => state.user?.token ?? null);
  const logout = useAuth((state) => state.logout);
  const setOne = usePresenceStore((state) => state.setOne);
  const router = useRouter();

  // Danh sách hẹn giờ ngoại tuyến
  const offlineTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Theo dõi lỗi xác thực Socket
  useEffect(() => {
    // Hàm xử lý khi xác thực thất bại
    const OnAuthFailed = () => {
      logout();
    };

    window.addEventListener(CHAT_AUTH_FAILED_EVENT, OnAuthFailed);
    return () => {
      window.removeEventListener(CHAT_AUTH_FAILED_EVENT, OnAuthFailed);
    };
  }, [logout]);

  // Theo dõi kết nối và sự kiện Socket
  useEffect(() => {
    let cleanupSocket: (() => void) | null = null;
    let lastAttachedSocket: unknown = null;
    const offlineTimers = offlineTimersRef.current;

    // Hàm xóa hẹn giờ ngoại tuyến
    const ClearOfflineTimer = (userId: string) => {
      const offlineTimer = offlineTimers.get(userId);
      if (!offlineTimer) return;
      clearTimeout(offlineTimer);
      offlineTimers.delete(userId);
    };

    // Hàm kết nối và lắng nghe sự kiện Socket
    const AttachSocket = () => {
      const socket = GetSocket();
      if (!socket || lastAttachedSocket === socket) return;

      cleanupSocket?.();

      if (GetToken()) {
        useChatStore.getState().fetchUnreadCount();
        useNotifications.getState().refresh();
      }

      // Xử lý trạng thái online
      const OnPresence = (payload: SocketPresence) => {
        const userId = payload?.userId ? String(payload.userId) : "";
        if (!userId) {
          console.warn("[chat] ignore invalid presence userId", payload);
          return;
        }
        if (typeof payload?.online !== "boolean") {
          console.warn("[chat] ignore invalid presence online", payload);
          return;
        }

        ClearOfflineTimer(userId);
        if (payload.online) {
          setOne(userId as any, true, payload.lastSeenAt);
          return;
        }

        const offlineTimer = setTimeout(() => {
          offlineTimers.delete(userId);
          setOne(userId as any, false, payload.lastSeenAt);
        }, OFFLINE_GRACE_MS);
        offlineTimers.set(userId, offlineTimer);
      };

      // Xử lý tin nhắn mới
      const OnNewMessage = (raw: unknown) => {
        if (!CheckMessage(raw)) return;
        const message = NormalizeMessage(raw);
        if (!message) return;

        const myId = useAuth.getState().user?.id;
        if (myId && String(message.sender.id) !== String(myId)) {
          useChatStore.getState().incrementUnreadCount(
            message.conversationId,
            message.createdAt
          );
        }
      };

      // Xử lý tin nhắn đã đọc
      const OnMessageRead = (payload: any) => {
        const myId = useAuth.getState().user?.id;
        if (myId && String(payload?.readerId) === String(myId)) {
          useChatStore.getState().clearUnreadCount(payload.conversationId);
        }
      };

      // Xử lý thông báo mới
      const OnNewNotification = (raw: unknown) => {
        if (!isSocketNotificationNew(raw)) {
          console.warn("[chat] invalid notification:new payload", raw);
          return;
        }
        const payload = normalizeSocketNotification(raw);
        if (!payload) return;

        void useNotifications.getState().forceRefresh();

        emitInvalidate(payload);

        if (payload.title) {
          toast.info(payload.title, {
            description: payload.content || undefined,
          });
        }
      };

      // Đăng ký sự kiện Socket
      socket.on("presence:update", OnPresence);
      socket.on("message:new", OnNewMessage);
      socket.on("message:read", OnMessageRead);
      socket.on("notification:new", OnNewNotification);

      lastAttachedSocket = socket;
      // Hủy đăng ký sự kiện Socket
      cleanupSocket = () => {
        socket.off("presence:update", OnPresence);
        socket.off("message:new", OnNewMessage);
        socket.off("message:read", OnMessageRead);
        socket.off("notification:new", OnNewNotification);
      };
    };

    const unsubscribeSocket = SubscribeSocketStatus((state) => {
      if (state === "connected") AttachSocket();
    });

    AttachSocket();

    return () => {
      cleanupSocket?.();
      unsubscribeSocket();
      offlineTimers.forEach((timer) => clearTimeout(timer));
      offlineTimers.clear();
    };
  }, [setOne, router]);

  // Theo dõi trạng thái hiển thị của trang web
  useEffect(() => {
    // Hàm xử lý khi thay đổi hiển thị tab
    const OnVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      const token = userToken ?? GetToken();
      if (token) {
        useChatStore.getState().fetchUnreadCount();
        useNotifications.getState().refresh();
      }

      const socket = GetSocket();
      if (socket?.connected) return;
      if (!socket) {
        ReconnectChat();
        return;
      }

      try {
        socket.connect();
      } catch {
        ReconnectChat();
      }
    };

    document.addEventListener("visibilitychange", OnVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", OnVisibilityChange);
    };
  }, [userToken]);

  // Theo dõi token và kết nối Socket
  useEffect(() => {
    const socketToken = userToken ?? GetToken();
    if (!socketToken) {
      const existingSocket = GetSocket();
      if (existingSocket) DisconnectChat();
      useChatStore.getState().reset();
      useNotifications.getState().reset();
      return;
    }

    ConnectChat(socketToken);
    useChatStore.getState().fetchUnreadCount();
    useNotifications.getState().refresh();

    // Hẹn giờ duy trì trạng thái online
    const presenceTimer = window.setInterval(() => {
      const socket = GetSocket();
      if (socket?.connected) socket.emit("presence:ping");
    }, 25_000);

    return () => {
      window.clearInterval(presenceTimer);
    };
  }, [userToken]);

  return <>{children}</>;
}