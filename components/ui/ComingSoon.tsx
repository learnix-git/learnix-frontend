import Link from "next/link";

import { Construction } from "lucide-react";

// ! Props của Component ComingSoon
interface ComingSoonProps {
  // ! Tiêu đề chính
  title: string;

  // ! Mô tả ngắn
  description: string;

  // ! Đường dẫn về trang chủ
  homeHref?: string;

  // ! Nhãn nút trang chủ
  homeLabel?: string;

  // ! Đường dẫn nút phụ
  altHref?: string;

  // ! Nhãn nút phụ
  altLabel?: string;
}

// ! Component hiển thị trang đang phát triển
export function ComingSoon({
  title,
  description,
  homeHref = "/",
  homeLabel = "Trang chủ",
  altHref,
  altLabel,
}: ComingSoonProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      {/* Hiệu ứng nền */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-96 w-96 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/60 bg-white/30 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
          <Construction className="h-9 w-9 text-primary" />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {title}
        </h1>

        {/* Mô tả */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Các nút điều hướng */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={homeHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/20"
          >
            {homeLabel}
          </Link>

          {altHref && altLabel && (
            <Link
              href={altHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/40 px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-xl transition-colors hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {altLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}