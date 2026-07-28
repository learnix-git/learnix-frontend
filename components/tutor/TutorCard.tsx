"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Star, StarHalf, MapPin, Monitor, Clock, GraduationCap, Banknote, CalendarDays, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Cn } from "@/lib/utils";
import type { Post } from "@/lib/api/types";
import { bookmarkPost, unbookmarkPost } from "@/lib/api/post";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";

// Định dạng học phí
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}

// Rút gọn khoảng lớp
function fmtGrades(grades: number[]) {
  if (!grades?.length) return null;
  const s = [...new Set(grades)].sort((a, b) => a - b);
  const groups: number[][] = [];
  let curr = [s[0]];
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1] + 1) {
      curr.push(s[i]);
    } else {
      groups.push(curr);
      curr = [s[i]];
    }
  }
  groups.push(curr);
  const formatted = groups.map(g => g.length >= 3 ? `${g[0]}-${g[g.length - 1]}` : g.join(", ")).join(", ");
  return `Lớp ${formatted}`;
}

// Lấy 2 chữ cái đầu của tên
function getInitials(name: string) {
  if (!name) return "G";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface TutorCardProps {
  post: Post;
}

export function TutorCard({ post }: TutorCardProps) {
  const router = useRouter();
  const tutor = post.tutor;
  const topics = post.topics.map((t) => (t as any).topic?.name || t.custom).filter(Boolean) as string[];
  const visibleTopics = topics.slice(0, 6);
  const hiddenTopics = topics.slice(6);

  const gradeLabel = fmtGrades(post.grades);
  const hasRating = tutor && tutor.rating > 0;
  const isOnline = post.mode === "ONLINE";
  const tutorName = tutor?.account.name || "Gia sư";
  const [bookmarked, setBookmarked] = useState(post.saved ?? false);

  useEffect(() => {
    setBookmarked(post.saved ?? false);
  }, [post.saved]);

  return (
    <TooltipProvider delay={0}>
      <Link
        href={`/posts/${post.id}`}
        className="block relative rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 p-4 sm:p-5 lg:p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

          {/* Avatar bên trái */}
          <div className="shrink-0 flex justify-center">
            <div className="relative w-[64px] h-[64px] rounded-full overflow-hidden bg-primary/10 dark:bg-primary/20 ring-4 ring-primary/10 dark:ring-primary/20 flex items-center justify-center">
              {tutor?.account.avatar ? (
                <Image src={tutor.account.avatar} alt={tutorName} fill className="object-cover" />
              ) : (
                <span className="text-xl font-black text-primary dark:text-primary tracking-wider">
                  {getInitials(tutorName)}
                </span>
              )}
            </div>
          </div>

          {/* Nội dung chính */}
          <div className="flex-1 min-w-0 flex flex-col gap-2.5">

            {/* Hàng 1: Tên + Badge + Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3">

              <div className="flex-1 min-w-0">
                {/* Tên gia sư */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-wide truncate">
                    {tutorName}
                  </h3>

                  {/* Đánh giá */}
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-200 shrink-0">
                    <div className="flex gap-0.5 mr-0.5">
                      {[1, 2, 3, 4, 5].map((i) => {
                        const rating = tutor?.rating || 0;
                        const isFull = i <= Math.floor(rating);
                        const isHalf = !isFull && i === Math.ceil(rating) && rating % 1 > 0;

                        if (isHalf) {
                          return (
                            <StarHalf
                              key={i}
                              className="w-3.5 h-3.5 fill-amber-500 text-amber-500"
                            />
                          );
                        }

                        return (
                          <Star
                            key={i}
                            className={Cn(
                              "w-3.5 h-3.5",
                              isFull ? "fill-amber-500 text-amber-500" :
                                "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                            )}
                          />
                        );
                      })}
                    </div>
                    {hasRating ? (
                      <>
                        {tutor.rating.toFixed(1)} <span className="text-slate-400 font-medium">({tutor.reviews})</span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-medium">(Mới)</span>
                    )}
                  </div>
                </div>

                {/* Tiêu đề / Mô tả ngắn */}
                <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="line-clamp-1">{post.title}</span>

                  {/* Ngày đăng */}
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                    • Đăng {new Date(post.created).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Buttons: Bookmark + Liên hệ */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newState = !bookmarked;
                    setBookmarked(newState);

                    if (newState) {
                      toast.success("Đã lưu gia sư vào danh sách yêu thích!");
                    } else {
                      toast.success("Đã bỏ lưu gia sư");
                    }

                    try {
                      if (newState) {
                        await bookmarkPost(post.id);
                      } else {
                        await unbookmarkPost(post.id);
                      }
                    } catch (err: any) {
                      setBookmarked(!newState);
                      toast.error("Có lỗi xảy ra, vui lòng thử lại sau!");
                    }
                  }}
                  className={Cn(
                    "flex items-center justify-center h-10 w-10 min-w-[40px] rounded-2xl border transition-all shadow-sm",
                    bookmarked
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary/50"
                  )}
                >
                  <Bookmark className={Cn("w-4 h-4", bookmarked && "fill-primary")} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (tutor) {
                      router.push(`/tutors/${tutor.id}`);
                    }
                  }}
                  className="min-w-0 flex-1 sm:flex-none px-4 sm:px-5 h-10 bg-slate-950 hover:bg-slate-900 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-slate-950 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-black/10 dark:shadow-none inline-flex items-center justify-center gap-1.5"
                >
                  Liên hệ
                </button>
              </div>
            </div>

            {/* Mô tả chi tiết nếu có */}
            {post.content && (
              <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {post.content}
              </p>
            )}

            {/* Hàng 2: Meta Chips (Học phí, Hình thức, Địa điểm, Lớp, Lịch) */}
            <div className="flex flex-wrap items-center gap-2 mt-1">

              {/* Học phí */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[12px] font-bold text-slate-700 dark:text-slate-300">
                <Banknote className="w-3 h-3 text-primary" />
                {post.from === 0 && post.to === 0 ? "Thỏa thuận" : (
                  <>
                    {fmt(post.from)} – {fmt(post.to)} ₫ <span className="font-medium opacity-70">/ {post.unit === "PER_SESSION" ? "buổi" : "tháng"}</span>
                  </>
                )}
              </div>

              {/* Online / Offline */}
              {isOnline ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <Monitor className="w-3 h-3 text-primary" />
                  Online
                </div>
              ) : (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-help">
                      <MapPin className="w-3 h-3 text-primary" />
                      Offline
                    </TooltipTrigger>
                    <TooltipContent hideArrow={true} side="top" sideOffset={8} className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white border-none shadow-xl rounded-lg text-[11px] font-semibold">
                      {post.venue === "BOTH" ? "Địa điểm tùy ý" : post.venue === "STUDENT" ? "Tại nhà học viên" : post.venue === "TUTOR" ? "Tại nhà gia sư" : "Offline"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Địa điểm */}
              {(!isOnline && post.city) && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3 h-3 text-primary" />
                  {post.city}
                </div>
              )}

              {/* Khối lớp */}
              {gradeLabel && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <GraduationCap className="w-3 h-3 text-primary" />
                  {gradeLabel}
                </div>
              )}

              {/* Lịch dạy (Popover Trigger) */}
              {post.flexible ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <Clock className="w-3 h-3 text-primary" />
                  Lịch dạy thỏa thuận
                </div>
              ) : (post.times?.length ?? 0) > 0 ? (
                <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors">
                      <CalendarDays className="w-3 h-3 text-primary" />
                      Lịch dạy
                    </TooltipTrigger>
                    <TooltipContent hideArrow={true} side="top" sideOffset={8} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl w-auto min-w-[150px]">
                      <table className="w-full text-[13px] text-left">
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {post.times!.map((t, i) => {
                            const dayStr = t.day === 8 ? "CN" : `Thứ ${t.day}`;
                            return (
                              <tr key={i}>
                                <td className="py-1.5 pr-4 font-bold text-primary whitespace-nowrap">{dayStr}</td>
                                <td className="py-1.5 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  {t.start} - {t.end}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ) : null}
            </div>

          </div>
        </div>

        {/* Hàng 3: Subjects Tags (Dịch sang trái, chiếm trọn hàng dưới cùng) */}
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
    </TooltipProvider>
  );
}

// Skeleton card
export function TutorCardSkeleton() {
  return (
    <div className="block relative rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 p-4 sm:p-5 lg:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        <div className="shrink-0 flex justify-center">
          <div className="w-[64px] h-[64px] rounded-full bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="flex-1 space-y-4 py-1">
          <div className="flex justify-between gap-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
              </div>
              <div className="h-3 w-60 bg-slate-200 dark:bg-white/10 rounded" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-white/10 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="w-20 h-8 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-7 w-28 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-7 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-7 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
          </div>
          <div className="flex gap-2 mt-1">
            <div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
