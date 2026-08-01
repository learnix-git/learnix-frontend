"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { LOGIN_PATH } from "@/lib/auth/session";
import { useAuth } from "@/lib/stores/auth";

// Thời gian chờ trước khi chuyển về trang đăng nhập
const REDIRECT_DELAY_MS = 2000;

// Hiển thị trạng thái đang xử lý OAuth
function LoadingView() {
  return (
    <>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      <p className="mt-4 text-sm text-muted-foreground">
        Đang xử lý đăng nhập Google...
      </p>
    </>
  );
}

// Hiển thị lỗi và thông báo sẽ chuyển hướng
function ErrorView({ message }: { message: string }) {
  return (
    <>
      <p className="text-sm text-destructive">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Đang chuyển về trang đăng nhập...
      </p>
    </>
  );
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const loginViaGoogle = useAuth((s) => s.loginViaGoogle);

  // Lỗi xử lý OAuth
  const [error, setError] = useState<string | null>(null);

  // Tránh gọi API trùng lặp khi Strict Mode re-render
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = search.get("code");
    const oauthError = search.get("error");

    // Nếu người dùng từ chối cấp quyền Google
    if (oauthError) {
      setError("Đăng nhập Google bị từ chối");
      window.setTimeout(() => router.replace(LOGIN_PATH), REDIRECT_DELAY_MS);
      return;
    }

    // Nếu không nhận được mã xác thực
    if (!code) {
      setError("Không nhận được mã xác thực từ Google");
      window.setTimeout(() => router.replace(LOGIN_PATH), REDIRECT_DELAY_MS);
      return;
    }

    // Gọi API đăng nhập bằng mã Google
    loginViaGoogle(code)
      .then(() => {
        toast.success("Đăng nhập Google thành công!");
        router.replace("/");
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Đăng nhập Google thất bại";

        toast.error(msg);
        setError(msg);
        window.setTimeout(() => router.replace(LOGIN_PATH), REDIRECT_DELAY_MS);
      });
  }, [search, loginViaGoogle, router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        {error ? <ErrorView message={error} /> : <LoadingView />}
      </div>
    </div>
  );
}
