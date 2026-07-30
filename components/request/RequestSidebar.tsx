"use client";

import React from "react";
import Link from "next/link";
import { FolderHeart, Lightbulb, CheckCircle2 } from "lucide-react";

export function RequestSidebar() {
  return (
    <>
      {/* Banner 1: Hồ sơ Gia sư */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-md text-white overflow-hidden relative border border-white/20 mb-6">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <FolderHeart className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-bold text-lg m-0 leading-none">Cập nhật Hồ sơ Gia sư</h3>
          </div>
          <p className="text-white/90 text-[13px] leading-relaxed mb-5">
            Cập nhật các kinh nghiệm, kỹ năng nổi bật để thu hút học viên tốt hơn và gia tăng cơ hội nhận lớp mới.
          </p>
          <Link href="/tutor/profile" className="w-full block">
            <button className="w-full px-4 py-2.5 rounded-lg font-semibold text-blue-600 hover:bg-white bg-white/95 transition-colors cursor-pointer border-none shadow-sm">
              Cập nhật ngay
            </button>
          </Link>
        </div>
      </div>

      {/* Banner 2: Tips */}
      <div className="rounded-2xl border border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4 text-foreground">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-bold text-[15px]">Mẹo tìm việc</h3>
        </div>
        
        <ul className="space-y-4">
          <li className="flex gap-3 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
              <strong className="text-foreground">Hồ sơ chuyên nghiệp:</strong> Cập nhật hồ sơ thường xuyên với các thành tích giảng dạy mới nhất.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
              <strong className="text-foreground">Chào giá ấn tượng:</strong> Tập trung vào phương pháp và cam kết chất lượng với học viên.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[13px] text-muted-foreground leading-relaxed m-0">
              <strong className="text-foreground">Phản hồi nhanh:</strong> Phụ huynh thường ưu tiên những gia sư phản hồi sớm và nhiệt tình.
            </p>
          </li>
        </ul>
      </div>
    </>
  );
}
