"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, Monitor, Clock, GraduationCap, Banknote, CalendarDays, CheckCircle, BookOpen, CalendarRange, Loader2, Wifi, WifiOff, Users } from "lucide-react";
import { toast } from "sonner";
import { bookmarkRequest, unbookmarkRequest } from "@/lib/api/request";
import type { RequestModel } from "@/lib/api/types";
import { Cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";
import { RequestReview } from "./RequestReview";

// Định dạng học phí
function fmt(n: number | string) {
  const num = Number(n);
  if (isNaN(num)) return "Thỏa thuận";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return `${num}`;
}

// Rút gọn khoảng lớp
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

// Lấy 2 chữ cái đầu của tên
function getInitials(name: string) {
  if (!name) return "H";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// Thời gian trôi qua
function timeSince(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

interface RequestCardProps {
  req: RequestModel;
  onBookmark?: () => void;
  showReviewOnHover?: boolean;
  showApplyOnHover?: boolean;
}

export function RequestCard({ req, onBookmark, showReviewOnHover = false, showApplyOnHover = false }: RequestCardProps) {
  const [saved, setSaved] = useState(req.saved ?? false);
  const [saving, setSaving] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [reviewAnchorRect, setReviewAnchorRect] = useState<{ top: number, left: number, right: number, height: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => { setSaved(req.saved ?? false); }, [req.saved]);

  const topics = req.topics
    .map((t) => t.topic?.name || t.custom)
    .filter(Boolean) as string[];

  const gradeLabel = fmtGrades(req.grades);
  const isOnline = req.mode === "ONLINE";
  const learnerName = req.student?.account.name || "Học viên";
  const avatar = req.student?.account.avatar;

  const visibleTopics = topics.slice(0, 6);
  const hiddenTopics = topics.slice(6);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !saved;
    setSaved(newState);

    // Gọi onBookmark ngay lập tức để màn hình Danh sách Đã lưu có thể phản hồi
    onBookmark?.();

    try {
      if (newState) {
        await bookmarkRequest(req.id);
        toast.success("Đã lưu yêu cầu!");
      } else {
        await unbookmarkRequest(req.id);
        toast.success("Đã bỏ lưu yêu cầu");
      }
    } catch {
      setSaved(!newState);
      toast.error("Có lỗi xảy ra, thử lại sau!");
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setReviewAnchorRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        height: rect.height,
      });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      closeTimerRef.current = null;
    }, 50);
  };

  return (
    <TooltipProvider delay={0}>
      <div
        ref={cardRef}
        className={Cn("relative h-full w-full overflow-visible", isHovered ? "z-[300]" : "z-0")}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={`/requests/${req.id}`}
          className="group block bg-white/60 dark:bg-white/[0.03] border border-white/80 dark:border-white/10 rounded-[28px] p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative w-[48px] h-[48px] rounded-full bg-primary/10 dark:bg-primary/20 ring-4 ring-primary/10 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <Image src={avatar} alt={learnerName} fill className="object-cover" />
                ) : (
                  <span className="text-base font-black text-primary">{getInitials(learnerName)}</span>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {req.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[12px] text-slate-400">
                <span>{learnerName}</span>
                <span>•</span>
                <span>{timeSince(req.created)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {showApplyOnHover && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/requests/${req.id}`);
                  }}
                  className="hidden md:inline-flex px-5 h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] font-bold uppercase tracking-wider rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 items-center justify-center shadow-lg shadow-primary/20"
                >
                  Ứng tuyển ngay
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/requests/${req.id}`);
                }}
                className="min-w-0 flex-1 sm:flex-none px-5 h-10 bg-slate-950 hover:bg-slate-900 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-950 text-[12px] font-bold uppercase tracking-wider rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/10 dark:shadow-none inline-flex items-center justify-center gap-1.5"
              >
                Liên hệ
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                className={Cn(
                  "flex items-center justify-center h-10 w-10 min-w-[40px] rounded-2xl border transition-all shadow-sm",
                  saved
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-500 hover:text-primary hover:border-primary/50"
                )}
              >
                <Bookmark className={Cn("w-4 h-4", saved && "fill-primary")} />
              </button>
            </div>
          </div>

          {/* Mô tả */}
          {req.desc && (
            <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
              {req.desc}
            </p>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Học phí */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 dark:bg-primary/10 text-[12px] font-bold text-primary">
              <Banknote className="w-3.5 h-3.5" />
              {Number(req.from) === 0 && Number(req.to) === 0
                ? "Thỏa thuận"
                : `${fmt(req.from)} – ${fmt(req.to)} ₫/${req.unit === "PER_SESSION" ? "buổi" : "tháng"}`}
            </span>

            {/* Online/Offline */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-primary" /> : <WifiOff className="w-3.5 h-3.5 text-slate-400" />}
              {isOnline ? "Online" : "Offline"}
            </span>

            {/* Địa điểm */}
            {!isOnline && req.city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {req.city}
              </span>
            )}

            {/* Lớp */}
            {gradeLabel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                {gradeLabel}
              </span>
            )}

            {/* Lịch học / Lịch dạy */}
            {req.flexible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Lịch học thỏa thuận
              </span>
            ) : req.days && req.days.length > 0 ? (
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <Tooltip>
                  <TooltipTrigger className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors">
                    <CalendarDays className="w-3.5 h-3.5 text-primary" />
                    Lịch học
                  </TooltipTrigger>
                  <TooltipContent hideArrow={true} side="top" sideOffset={8} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl w-auto min-w-[150px]">
                    <table className="w-full text-[13px] text-left">
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {req.days.map((day, i) => {
                          const dayStr = day === 8 ? "CN" : `Thứ ${day}`;
                          return (
                            <tr key={i}>
                              <td className="py-1.5 pr-4 font-bold text-primary whitespace-nowrap">{dayStr}</td>
                              <td className="py-1.5 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {req.startTime || "--:--"} - {req.endTime || "--:--"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : req.count > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                <CalendarRange className="w-3.5 h-3.5 text-primary" />
                {req.count} buổi / tuần
              </span>
            ) : null}
          </div>

          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {visibleTopics.map((t, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                  {t}
                </span>
              ))}
              {hiddenTopics.length > 0 && (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center justify-center px-2 py-1 min-w-[28px] rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 transition-colors">
                      +{hiddenTopics.length}
                    </TooltipTrigger>
                    <TooltipContent hideArrow={true} side="top" sideOffset={8} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {hiddenTopics.map((t, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        </Link>

        {showReviewOnHover && isHovered && (
          <RequestReview
            req={req}
            placement="right"
            anchorRect={reviewAnchorRect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

export function RequestCardSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-white/[0.03] border border-white/80 dark:border-white/10 rounded-[28px] p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-[48px] h-[48px] rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-4/5" />
          <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-lg w-2/5" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-lg" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-lg w-3/4" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-7 w-28 bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-7 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-7 w-20 bg-slate-200 dark:bg-white/10 rounded-xl" />
        <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}
