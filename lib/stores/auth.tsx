"use client";

import { create } from "zustand";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api/types";
import * as authService from "@/lib/api/auth";
import {  
  GetUser,
  GetToken,  
  SaveSession,
  ClearSession, 
  UpdateSession, 
} from "@/lib/auth/session";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  hydrate: () => void;
  fetch: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    password: string;
    name: string;
    email: string;
    gender: number;
  }) => Promise<void>;
  loginViaGoogle: (code: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  hydrate: () => {
    const token = GetToken();
    const user = GetUser();

    if (token && user) {
      set({ user, isAuthenticated: true, loading: false });
      return;
    }

    if (token) {
      set({ user: user ?? null, isAuthenticated: true, loading: false });
      return;
    }

    if (user) {
      ClearSession();
    }
    set({ user: null, isAuthenticated: false, loading: false });
  },

  login: async (data) => {
    const res = await authService.login(data);
    if (res.success === true && res.data) {
      const userWithToken = { ...res.data.user, accessToken: res.data.token };
      SaveSession(userWithToken);

      set({ user: userWithToken, isAuthenticated: true });
    } else {
      throw new Error(res.message || "Đăng nhập thất bại");
    }
  },

  register: async (data) => {
    const res = await authService.register(data);
    if (res.success === true) {
      throw new Error(res.message || "Đăng ký thất bại");
    }
  },

  loginViaGoogle: async (code) => {
    const res = await authService.loginViaGoogle(code);
    if (res.success === true && res.data) {
      const userWithToken = { ...res.data.user, accessToken: res.data.token };
      SaveSession(userWithToken);

      set({ user: userWithToken, isAuthenticated: true });
    } else {
      throw new Error(res.message || "Đăng nhập Google thất bại");
    }
  },

  logout: () => {
    ClearSession();
    set({ user: null, isAuthenticated: false });
  },

  fetch: async () => {
    try {
      const res = await authService.getInfo();
      if (res.success === true && res.data) {
        UpdateSession(res.data);
        set({ user: res.data, isAuthenticated: true });
      } else if (res.success !== true) {
        throw new Error(res.message || "fetchUser failed");
      }
    } catch (err) {
      throw err;
    }
  },
}));

// ! Hydrates auth state from storage and fetches the current user on app startup.
export function Hydrate({ children }: { children: ReactNode }) {
  const hydrate = useAuth((s) => s.hydrate);
  const fetch = useAuth((s) => s.fetch);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    if (GetToken()) {
      fetch().catch((err) => {
        console.warn("[auth] fetch failed:", err);
      });
    }
    setMounted(true);
  }, [hydrate, fetch]);

  if (!mounted) return null;
  return <>{children}</>;
}