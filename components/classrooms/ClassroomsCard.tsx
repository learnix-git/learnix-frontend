"use client";

import { Star, Wallet, GraduationCap, MapPin, Monitor, ArrowRight, Ban } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Classroom } from "@/lib/api/types";
import { FormatMoney } from "@/lib/utils";
import TooltipHover from "@/components/ui/Tooltip"

import ClassroomsProgress from "./ClassroomsProgress";

interface ClassroomsCardProps {
  classroom: Partial<Classroom> & {
    count?: number;
    status?: "active" | "draft";            
  };
  isPreview?: boolean;             
  isJoining?: boolean;             
  onAction?: (id: string) => void; 
}

export default function ClassroomsCard({
  classroom,
  isPreview = false,
  isJoining = false,
  onAction,
}: ClassroomsCardProps) {
  const {
    id,
    name,
    grade,
    description,
    code,
    fee,
    address,
    capacity,
    rating,
    count = 0,
    teacher,
    active = true,
    status = false,
  } = classroom;

  const display = typeof grade === "number" ? `Khối ${grade}` : (grade || "Chưa chọn");
  const maxCap = Number(capacity) || 50;

  return (
    <Card className="group !p-5 sm:!p-6 !rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 hover:border-primary dark:hover:border-primary/50 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/80 transition-all duration-300 w-full">

      {/* ═══ THÔNG TIN LỚP & GIẢNG VIÊN ═══ */}
      <div className="flex-1 min-w-0 space-y-3.5">
        
        {/* Avatar + Tên Giảng viên + Status + Khối lớp */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar alt={teacher || "GV"} size="sm" className="!h-9 !w-9 shadow-sm" />
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
              {teacher || "Giảng viên"}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 font-black">•</span>

          {active ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Đang mở
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-0.5 text-xs font-black text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Tạm đóng
            </span>
          )}

          <Badge variant="secondary" className="gap-1 text-[11px] px-2.5 py-0.5 font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
            <GraduationCap className="h-3.5 w-3.5 text-primary" /> {display}
          </Badge>
        </div>

        {/* Tiêu đề lớp học + Mã lớp */}
        <div className="space-y-2.5">
          <h3
            onClick={() => id && onAction && onAction(id)}
            className="m-0 mb-2 line-clamp-1 cursor-pointer text-xl font-black leading-snug tracking-tight text-foreground transition-colors"
          >
            {name?.trim() || "Tên lớp học của bạn sẽ hiện ở đây"}
          </h3>
          <p className="m-0 mb-2 text-xs font-black tracking-wider uppercase text-primary">
            MÃ LỚP: {code || (isPreview ? "TỰ ĐỘNG SINH" : "CHƯA CÓ")}
          </p>
          <p className="m-0 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal pr-4">
            {description?.trim()
              ? description
              : "Lớp học này hiện chưa có thông tin mô tả chi tiết từ giảng viên."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Tag Học phí */}
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Wallet className="h-3.5 w-3.5 text-primary shrink-0" />
            {!fee || Number(fee) === 0 ? "Miễn phí" : FormatMoney(Number(fee))}
          </span>

          {/* Tag Hình thức & Khu vực */}
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {address?.trim() ? (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />

                <TooltipHover content={address}>
                  <span className="max-w-[160px] cursor-help truncate">
                    {address}
                  </span>
                </TooltipHover>
              </>
            ) : (
              <>
                <Monitor className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Học Online</span>
              </>
            )}
          </span>

          {/* Tag Đánh giá */}
          <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span>{rating !== 0 ? rating : "Mới"}</span>
          </span>
        </div>
      </div>

      {/* ═══ SĨ SỐ ═══ */}
      <div className="flex flex-col justify-between items-stretch sm:items-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 md:pl-6 md:border-l md:border-slate-200/60 md:dark:border-white/10 md:w-[240px]">
        
        <div className="w-full">
          <ClassroomsProgress current={count} capacity={maxCap} />
        </div>

        {status ? (
          <Button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/50"
            onClick={() => id && onAction?.(id)}
          >
            <span>Vào lớp ngay</span>
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
            <span>Lớp học không khả dụng</span>
          </div>
        )}
      </div>
    </Card>
  );
}