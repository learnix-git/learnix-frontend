"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
} : {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error.tsx]", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-96 w-96 rounded-full bg-rose-500/10 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-rose-200/60 bg-rose-50/60 shadow-xl backdrop-blur-2xl dark:border-rose-500/20 dark:bg-rose-500/10">
          <AlertTriangle className="h-9 w-9 text-rose-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Đã xảy ra lỗi
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Hệ thống gặp sự cố khi tải trang này. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>

        {error.digest && (
          <p className="mt-3 max-w-md break-all font-mono text-[11px] text-muted-foreground/70">
            Mã lỗi: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/20"
          >
            <RotateCw className="h-4 w-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/40 px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-xl transition-colors hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
