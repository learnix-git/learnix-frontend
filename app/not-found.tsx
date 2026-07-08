"use client";

import Link from "next/link";
import { GraduationCap, ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 overflow-hidden">
      {/* Glow Effect */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/15" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {/* 404 */}
        <div className="relative">
          <span className="bg-gradient-to-b from-primary/60 to-primary/20 bg-clip-text text-[10rem] font-black leading-none tracking-tighter text-transparent sm:text-[14rem]">
            404
          </span>
        </div>

        {/* Divider */}
        <div className="my-4 h-px w-20 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Text giải thích */}
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Oops! Không tìm thấy trang này
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thông tin bạn đang tìm kiếm có thể đã bị xóa, thay đổi hoặc đường dẫn không chính xác.
        </p>

        {/* Điều hướng */}
        <div className="mt-8 flex flex-col w-full sm:w-auto sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}