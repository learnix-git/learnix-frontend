"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, MapPin, Monitor, Clock, GraduationCap, Banknote, CalendarDays, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Cn, generateTutorAlias } from "@/lib/utils";
import type { Post } from "@/lib/api/types";
import { bookmarkPost, unbookmarkPost } from "@/lib/api/post";

import { Rating } from "@/components/ui/Rating";

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
    <Link
      href={`/tutor/${tutor?.account?.alias || generateTutorAlias(tutorName, tutor?.id || "")}`}
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
                  <div className="shrink-0 mt-0.5">
                    <Rating rating={Number(tutor?.rating || 0)} reviews={Number(tutor?.reviews || 0)} showCount={hasRating} />
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
                      router.push(`/tutor/${tutor.account?.alias || generateTutorAlias(tutorName, tutor.id)}`);
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3 h-3 text-primary" />
                  {post.venue === "BOTH" ? "Tùy ý" : post.venue === "STUDENT" ? "Tại nhà học viên" : post.venue === "TUTOR" ? "Tại nhà gia sư" : "Offline"}
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <CalendarDays className="w-3 h-3 text-primary" />
                  Lịch dạy: {post.times?.length} buổi/tuần
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
              <span className="inline-flex items-center justify-center px-2 py-1 min-w-[28px] rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                +{hiddenTopics.length} môn khác
              </span>
            )}
          </div>
        )}

      </Link>
  );
}

// Skeleton card
export function TutorCardSkeleton() {
  return (
    <div className="block relative rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 p-4 sm:p-5 lg:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        
        {/* Avatar bên trái */}
        <div className="shrink-0 flex justify-center">
          <div className="w-[64px] h-[64px] rounded-full bg-slate-200 dark:bg-white/10 ring-4 ring-slate-100 dark:ring-white/5" />
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          
          {/* Hàng 1: Tên + Badge + Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded-md mt-0.5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-48 bg-slate-200 dark:bg-white/10 rounded-md" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
              </div>
            </div>

            {/* Buttons: Bookmark + Liên hệ */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-white/10" />
              <div className="h-10 w-[84px] rounded-2xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-1.5 mt-1">
            <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded" />
            <div className="h-3 w-4/5 bg-slate-200 dark:bg-white/10 rounded" />
          </div>

          {/* Hàng 2: Meta Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="h-[26px] w-[110px] bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-[26px] w-[70px] bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-[26px] w-[90px] bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-[26px] w-[130px] bg-slate-200 dark:bg-white/10 rounded-full" />
          </div>

        </div>
      </div>

      {/* Hàng 3: Subjects Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-3 sm:ml-[84px]">
        <div className="h-[26px] w-[60px] bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-[26px] w-[80px] bg-slate-200 dark:bg-white/10 rounded-full" />
        <div className="h-[26px] w-[70px] bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>
    </div>
  );
}
