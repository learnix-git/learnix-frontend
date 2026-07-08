"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDE_FOOTER_PATHS = ["/messages", "/exams"];

const links = {
  "Dành cho Học sinh": [
    { label: "Tìm lớp học", href: "#" },
    { label: "Kho tài liệu", href: "#" },
    { label: "Khóa học của tôi", href: "#" },
    { label: "Hướng dẫn tham gia", href: "#" },
  ],
  "Dành cho Giáo viên": [
    { label: "Quản lý đề thi", href: "#" },
    { label: "Quản lý lớp học", href: "#" },
    { label: "Ngân hàng câu hỏi", href: "#" },
    { label: "Chính sách đối tác", href: "#" },
  ],
  "Tài nguyên": [
    { label: "Tài liệu", href: "#" },
    { label: "Đánh giá", href: "#" },
    { label: "Trợ giúp & Hỗ trợ", href: "#" },
    { label: "Cộng đồng", href: "#" },
  ],
  "Learnix": [
    { label: "Giới thiệu", href: "#" },
    { label: "Tuyển dụng", href: "#" },
    { label: "Tin cậy & An toàn", href: "#" },
    { label: "Liên hệ", href: "#" },
  ],
};

export function Footer() {
  const pathname = usePathname();

  // Giấu Footer trên các trang nhất định
  if (pathname && HIDE_FOOTER_PATHS.some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <footer className="border-t border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">

          {/* Brand/Logo column */}
          <div className="space-y-6 xl:col-span-1">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <img src="/images/logo/logo-header-light.png" alt="Learnix Logo" className="h-[100px] w-auto block dark:hidden" />
              <img src="/images/logo/logo-header-dark.png" alt="Learnix Logo" className="h-[100px] w-auto hidden dark:block" />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Learnix - Nền tảng quản lý lớp học trực tuyến hàng đầu. Nơi kiến tạo tri thức và kết nối giảng dạy hiện đại.
            </p>
          </div>

          {/* Links Grid */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 md:grid-cols-4">
            {Object.entries(links).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/60 dark:border-white/5 pt-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Learnix. Đã đăng ký bản quyền.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dieu-khoan" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link href="/bao-mat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}