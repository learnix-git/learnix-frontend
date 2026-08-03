"use client";

import React from "react";
import Link from "next/link";
import { FolderHeart, Lightbulb, CheckCircle2 } from "lucide-react";

export function TutorsSidebar() {
  return (
    <>
      {/* Banner 1: Đăng yêu cầu */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-md text-white overflow-hidden relative border border-white/20 mb-6">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <FolderHeart className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-lg m-0 leading-none">Chủ động tìm kiếm</h3>
          </div>
          <p className="text-white/90 text-[13px] leading-relaxed mb-5">
            Thay vì chờ đợi, hãy đăng yêu cầu tìm gia sư để các gia sư phù hợp chủ động liên hệ với bạn.
          </p>
          <Link href="/dang-tin-tim-gia-su" className="w-full block">
            <button className="w-full px-4 py-2.5 rounded-lg font-semibold text-blue-600 hover:bg-white bg-white/95 transition-colors cursor-pointer border-none shadow-sm">
              Tạo bài đăng ngay
            </button>
          </Link>
        </div>
      </div>

      {/* Banner 2: Tips */}
      <div className="rounded-2xl border border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4 text-foreground">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-bold text-[15px]">Mẹo chọn gia sư</h3>
        </div>
        
        <ul className="space-y-4">
          <li className="flex gap-3 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
              <strong className="text-foreground">Xem kỹ hồ sơ:</strong> Chú ý đến kinh nghiệm và thành tích của gia sư.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
              <strong className="text-foreground">Đọc đánh giá:</strong> Đánh giá từ học viên cũ là minh chứng rõ nhất cho chất lượng.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
              <strong className="text-foreground">Trao đổi rõ ràng:</strong> Luôn thống nhất học phí, lịch học trước khi bắt đầu.
            </p>
          </li>
        </ul>
      </div>
    </>
  );
}
