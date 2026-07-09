// * Accept * //

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth/session";
import { useAuth } from "@/lib/stores/auth";
import { toast } from "sonner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const search = useSearchParams();
  const loginViaGoogle = useAuth((s: any) => s.loginViaGoogle);
  const [error, setError] = useState<string | null>(null);
  const call = useRef(false);

  useEffect(() => {
    if (call.current) return;
    call.current = true;

    const code = search.get("code");
    const error = search.get("error");

    if (error) {
      setError("Đăng nhập Google bị từ chối");
      setTimeout(() => router.replace(LOGIN_PATH), 2000);
      return;
    }

    if (!code) {
      setError("Không nhận được mã xác thực từ Google");
      setTimeout(() => router.replace(LOGIN_PATH), 2000);
      return;
    }

    loginViaGoogle(code)
      .then(() => {
        toast.success("Đăng nhập Google thành công!");
        router.replace("/");
      })
      .catch((err: any) => {
        const msg = err instanceof Error ? err.message : "Đăng nhập Google thất bại";
        toast.error(msg);
        setError(msg);
        setTimeout(() => router.replace(LOGIN_PATH), 2000);
      });
  }, [search, loginViaGoogle, router]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">Đang chuyển về trang đăng nhập...</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">
              Đang xử lý đăng nhập Google...
            </p>
          </>
        )}
      </div>
    </div>
  );
}