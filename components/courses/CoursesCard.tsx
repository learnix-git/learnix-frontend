"use client";

import { Star, Wallet, GraduationCap, ArrowRight, Ban, ImageOff } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Course } from "@/lib/api/types";
import { FormatMoney, Cn } from "@/lib/utils";
import TooltipHover from "@/components/ui/Tooltip";

interface CoursesCardProps {
  course: Partial<Course> & {
    count?: number;
    chaptersCount?: number;
    lessonsCount?: number;
    status?: "active" | "draft" | boolean;
  };
  isPreview?: boolean;
  isJoining?: boolean;
  onAction?: (id: string) => void;
  // "auto" = ngang trên md+ (mặc định, dùng cho danh sách full-width)
  // "vertical" = luôn xếp dọc, dùng khi card nằm trong cột/sidebar hẹp
  layout?: "auto" | "vertical";
}

export default function CoursesCard({
  course,
  isPreview = false,
  isJoining = false,
  onAction,
  layout = "auto",
}: CoursesCardProps) {
  const {
    id,
    name,
    grade,
    description,
    code,
    fee,
    thumbnail,
    rating,
    count = 0,
    chaptersCount = 0,
    lessonsCount = 0,
    teacherRef,
    active = true,
    status = false,
  } = course;

  const isVertical = layout === "vertical";
  const row = !isVertical;

  const display = typeof grade === "number" ? `Khối ${grade}` : (grade || "Chưa chọn");
  const teacherName = teacherRef?.name || "Giảng viên";
  const teacherAvatar = teacherRef?.avatar || undefined;
  const teacherDegree = teacherRef?.degree?.trim();
  const teacherBio = teacherRef?.bio?.trim();

  return (
    <Card
      className={Cn(
        "group !p-0 !rounded-[2rem] flex flex-col overflow-hidden bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 hover:border-primary dark:hover:border-primary/50 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/80 transition-all duration-300 w-full",
        row && "md:flex-row md:items-stretch"
      )}
    >
      <div
        className={Cn(
          "relative w-full shrink-0 aspect-video overflow-hidden bg-slate-100 dark:bg-white/5",
          row && "md:w-[260px] md:aspect-auto"
        )}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name || "Ảnh khóa học"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-300 dark:text-white/10 min-h-[160px]">
            <ImageOff className="h-8 w-8" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chưa có ảnh</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-3.5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <TooltipHover content={teacherBio || `Giảng viên ${teacherName}`}>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar alt={teacherName} src={teacherAvatar} size="sm" className="!h-9 !w-9 shadow-sm" />
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[150px]">
                {teacherName}
              </span>
            </div>
          </TooltipHover>

          {teacherDegree && (
            <>
              <span className="text-slate-300 dark:text-slate-700 font-black">•</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate max-w-[120px]">
                🎓 {teacherDegree}
              </span>
            </>
          )}

          <span className="text-slate-300 dark:text-slate-700 font-black">•</span>

          <Badge variant="secondary" className="gap-1 text-[11px] px-2.5 py-0.5 font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 shrink-0">
            <GraduationCap className="h-3.5 w-3.5 text-primary" /> {display}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <h3
            onClick={() => id && onAction && onAction(id)}
            className="m-0 mb-2 line-clamp-1 cursor-pointer text-xl font-black leading-snug tracking-tight text-foreground transition-colors break-all"
          >
            {name?.trim() || "Tên khóa học của bạn sẽ hiện ở đây"}
          </h3>
          <p className="m-0 mb-2 text-xs font-black tracking-wider uppercase text-primary truncate">
            MÃ LỚP: {code || (isPreview ? "TỰ ĐỘNG SINH" : "CHƯA CÓ")}
          </p>
          <p className="m-0 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal pr-4">
            {description?.trim()
              ? description
              : "Khóa học này hiện chưa có thông tin mô tả chi tiết từ giảng viên."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[180px] sm:max-w-[220px]">
            <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              {!fee || Number(fee) === 0 ? "Miễn phí" : FormatMoney(Number(fee))}
            </span>
          </span>

          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>{rating !== 0 && rating !== undefined ? rating : "Mới"}</span>
          </span>
        </div>
      </div>

      <div
        className={Cn(
          "flex flex-col justify-between items-stretch gap-4 shrink-0 p-5 sm:p-6 border-t border-slate-100 dark:border-white/5",
          row && "md:border-t-0 md:border-l md:border-slate-200/60 md:dark:border-white/10 md:w-[260px]"
        )}
      >
        {status ? (
          <Button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50"
            onClick={() => id && onAction?.(id)}
          >
            <span>Vào học ngay</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : active ? (
          <Button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50"
            disabled={isPreview || isJoining}
            onClick={() => id && onAction?.(id)}
            loading={isJoining}
          >
            <span>{isPreview ? "Tham gia" : "Đăng ký ngay"}</span>
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <div className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-sm font-black text-rose-600 dark:text-rose-400">
            <Ban className="h-4 w-4" />
            <span>Khóa học không khả dụng</span>
          </div>
        )}
      </div>
    </Card>
  );
}