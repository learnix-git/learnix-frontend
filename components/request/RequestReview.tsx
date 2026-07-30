"use client";

import Link from "next/link";
import { RequestModel } from "@/lib/api/types";
import { Cn } from "@/lib/utils";
import { MapPin, Monitor, GraduationCap, Banknote, BookOpen } from "lucide-react";

type ReviewAnchorRect = {
  top: number;
  left: number;
  right: number;
  height: number;
};

type RequestReviewProps = {
  req: RequestModel;
  placement?: "left" | "right";
  anchorRect?: ReviewAnchorRect | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

function fmt(n: number | string) {
  const num = Number(n);
  if (isNaN(num)) return "Thỏa thuận";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return `${num}`;
}

function fmtGrades(grades: number[]) {
  if (!grades?.length) return null;
  const s = [...new Set(grades)].sort((a, b) => a - b);
  const groups: number[][] = [];
  let curr = [s[0]];
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1] + 1) curr.push(s[i]);
    else { groups.push(curr); curr = [s[i]]; }
  }
  groups.push(curr);
  return `Lớp ${groups.map(g => g.length >= 3 ? `${g[0]}-${g[g.length - 1]}` : g.join(", ")).join(", ")}`;
}

export function RequestReview({
  req,
  placement = "right",
  anchorRect,
  onMouseEnter,
  onMouseLeave,
}: RequestReviewProps) {
  const isFixed = Boolean(anchorRect);
  const isOnline = req.mode === "ONLINE";
  const gradeLabel = fmtGrades(req.grades);
  const topics = req.topics.map(t => t.topic?.name || t.custom).filter(Boolean) as string[];

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={
        anchorRect
          ? {
              left:
                placement === "left"
                  ? anchorRect.left - 14
                  : anchorRect.right + 14,
              top: anchorRect.top + anchorRect.height / 2,
            }
          : undefined
      }
      className={Cn(
        "z-[999] hidden h-[420px] w-[420px] overflow-visible rounded-3xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 xl:flex xl:flex-col",
        isFixed
          ? "fixed"
          : "absolute top-1/2 -translate-y-1/2",
        placement === "left" && isFixed && "-translate-x-full -translate-y-1/2",
        placement === "right" && isFixed && "-translate-y-1/2",
        placement === "left" && !isFixed && "right-[calc(100%+14px)]",
        placement === "right" && !isFixed && "left-[calc(100%+14px)]",
      )}
    >
      <div className="flex h-full w-full flex-col">
        {/* Header Section */}
        <div className="shrink-0 border-b border-black/5 dark:border-white/10 px-6 py-5">
          <h3 className="line-clamp-2 text-base font-black tracking-tight leading-tight text-foreground">
            {req.title}
          </h3>
          <p className="mt-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
            {req.student?.account?.name || "Học viên"}
          </p>
          <p className="mt-3 text-[17px] font-black text-primary tracking-tight flex items-center gap-1.5">
            {Number(req.from) === 0 && Number(req.to) === 0
              ? "Thỏa thuận"
              : `${fmt(req.from)} đ - ${fmt(req.to)} đ`}
          </p>
        </div>

        {/* Content Section */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scrollbar-hide">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Tag 1: Địa điểm / Hình thức */}
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary">
              {isOnline ? (
                <Monitor className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              {isOnline ? "Online" : (req.city || "Tận nơi")}
            </span>
            
            {/* Tag 2: Lớp học */}
            {gradeLabel && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <GraduationCap className="w-3.5 h-3.5" />
                {gradeLabel}
              </span>
            )}

            {/* Tag 3: Trạng thái */}
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              Đang tuyển
            </span>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                <h4 className="text-[14px] font-bold tracking-wide text-foreground m-0">
                  Nội dung mô tả
                </h4>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-5 pl-3.5">
                {req.desc || "Chưa có mô tả chi tiết."}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                <h4 className="text-[14px] font-bold tracking-wide text-foreground m-0">
                  Môn học
                </h4>
              </div>
              <div className="flex flex-wrap gap-2 pl-3.5">
                {topics.map((t, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-medium border border-black/5 dark:border-white/5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="shrink-0 border-t border-black/5 dark:border-white/10 p-5">
          <Link href={`/requests/${req.id}`} className="block w-full">
            <button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              ỨNG TUYỂN NGAY
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
