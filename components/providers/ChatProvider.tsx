"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/stores/auth";
import { usePresenceStore } from "@/lib/stores/presence";
import { GetToken } from "@/lib/auth/session";
import {
  CHAT_AUTH_FAILED_EVENT,
  connectChat,
  disconnectChat,
  getSocket,
  reconnectChat,
  subscribeSocketState,
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
  const userToken = useAuth((state) => state.user?.token ?? null);
  const logout = useAuth((state) => state.logout);
  const setOne = usePresenceStore((state) => state.setOne);
  const router = useRouter();
  const offlineTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  useEffect(() => {
    const onAuthFailed = () => {
      logout();
    };

    window.addEventListener(CHAT_AUTH_FAILED_EVENT, onAuthFailed);
    return () => {
      window.removeEventListener(CHAT_AUTH_FAILED_EVENT, onAuthFailed);
    };
  }, [logout]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let lastAttachedSocket: unknown = null;
    const offlineTimers = offlineTimersRef.current;

    const clearOfflineTimer = (userId: string) => {
      const timer = offlineTimers.get(userId);
      if (!timer) return;
      clearTimeout(timer);
      offlineTimers.delete(userId);
    };

    const attach = () => {
      const socket = getSocket();
      if (!socket || lastAttachedSocket === socket) return;

      cleanup?.();

      if (GetToken()) {
        useChatStore.getState().fetchUnreadCount();
        useNotifications.getState().refresh();
      }

      const onPresence = (payload: SocketPresence) => {
        const userId = payload?.userId ? String(payload.userId) : "";
        if (!userId) {
          console.warn("[chat] ignore invalid presence userId", payload);
          return;
        }
        if (typeof payload?.online !== "boolean") {
          console.warn("[chat] ignore invalid presence online", payload);
          return;
        }

        clearOfflineTimer(userId);
        if (payload.online) {
          setOne(userId as any, true, payload.lastSeenAt);
          return;
        }

        const timer = setTimeout(() => {
          offlineTimers.delete(userId);
          setOne(userId as any, false, payload.lastSeenAt);
        }, OFFLINE_GRACE_MS);
        offlineTimers.set(userId, timer);
      };

      const onNewMessage = (raw: unknown) => {
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

      const onMessageRead = (payload: any) => {
        const myId = useAuth.getState().user?.id;
        if (myId && String(payload?.readerId) === String(myId)) {
          useChatStore.getState().clearUnreadCount(payload.conversationId);
        }
      };

      const onNewNotification = (raw: unknown) => {
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

      socket.on("presence:update", onPresence);
      socket.on("message:new", onNewMessage);
      socket.on("message:read", onMessageRead);
      socket.on("notification:new", onNewNotification);

      lastAttachedSocket = socket;
      cleanup = () => {
        socket.off("presence:update", onPresence);
        socket.off("message:new", onNewMessage);
        socket.off("message:read", onMessageRead);
        socket.off("notification:new", onNewNotification);
      };
    };

    const unsubscribe = subscribeSocketState((state) => {
      if (state === "connected") attach();
    });

    attach();

    return () => {
      cleanup?.();
      unsubscribe();
      offlineTimers.forEach((timer) => clearTimeout(timer));
      offlineTimers.clear();
    };
  }, [setOne, router]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;

      const token = userToken ?? GetToken();
      if (token) {
        useChatStore.getState().fetchUnreadCount();
        useNotifications.getState().refresh();
      }

      const socket = getSocket();
      if (socket?.connected) return;
      if (!socket) {
        reconnectChat();
        return;
      }

      try {
        socket.connect();
      } catch {
        reconnectChat();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userToken]);

  useEffect(() => {
    const token = userToken ?? GetToken();
    if (!token) {
      const existing = getSocket();
      if (existing) disconnectChat();
      useChatStore.getState().reset();
      useNotifications.getState().reset();
      return;
    }

    connectChat(token);
    useChatStore.getState().fetchUnreadCount();
    useNotifications.getState().refresh();

    const presenceTimer = window.setInterval(() => {
      const socket = getSocket();
      if (socket?.connected) socket.emit("presence:ping");
    }, 25_000);

    return () => {
      window.clearInterval(presenceTimer);
    };
  }, [userToken]);

  return <>{children}</>;
}