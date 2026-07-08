"use client";

import Link from "next/link";
import { BookOpen, Check, ShieldCheck, Sparkles, Users } from "lucide-react";

export function Pricing() {
  return (
    <section className="bg-background text-card py-16 sm:py-24 rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-12 items-center rounded-3xl bg-foreground text-on-primary p-8 sm:p-12 shadow-2xl border border-white/10">
          
          {/* LEFT CONTENT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Learnix cho Tổ chức Giáo dục</span>
            </div>

            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl text-card mb-6 leading-tight">
              Số hóa giảng dạy, <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                nâng tầm chất lượng.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-card/80 mb-8 leading-relaxed">
              Giải pháp toàn diện dành riêng cho các Trường THPT và Trung tâm luyện thi. Quản lý đồng bộ hàng trăm lớp học, số hóa kho đề thi chung và theo dõi năng lực học sinh theo thời gian thực.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Quản lý tập trung hàng trăm lớp học và giáo viên bộ môn",
                "Xây dựng ngân hàng đề thi chung, bảo mật tuyệt đối",
                "Hệ thống thi thử THPTQG chịu tải cao lên đến 10.000 CCU",
                "Báo cáo thống kê phổ điểm và tiến độ học tập chuyên sâu",
                "Hỗ trợ kỹ thuật 24/7 và đào tạo sử dụng cho giảng viên",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm sm:text-base text-card/90 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup?role=organization"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                Liên hệ hợp tác / Mua gói
              </Link>
            </div>
          </div>

          {/* RIGHT PREVIEW MOCKUP */}
          <div className="hidden lg:flex relative h-[480px] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-6 flex-col justify-between backdrop-blur-sm">
            {/* Header giả lập của Dashboard Trường học */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-card/60">admin.learnix.vn/portal</span>
              </div>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                SYSTEM ONLINE
              </span>
            </div>

            {/* Thống kê giả lập */}
            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Users className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-card/70">Tổng Học Sinh</span>
                </div>
                <p className="text-3xl font-black text-card">2,450</p>
                <p className="text-[11px] text-emerald-400 mt-1">↑ 18% so với học kỳ trước</p>
              </div>

              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider text-card/70">Lớp Đang Mở</span>
                </div>
                <p className="text-3xl font-black text-card">64</p>
                <p className="text-[11px] text-card/60 mt-1">12 bộ môn giảng dạy</p>
              </div>
            </div>

            {/* Banner nhỏ bên dưới Mockup */}
            <div className="rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 p-4 border border-primary/20 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-card">Đạt chuẩn bảo mật dữ liệu Bộ Giáo Dục</p>
                <p className="text-[11px] text-card/70">Hệ thống mã hóa đề thi & thông tin học sinh SSL/TLS 256-bit.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}