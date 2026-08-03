"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  MapPin,
  Briefcase,
  Star,
  CheckCircle2,
  BookOpen,
  Award,
  BookMarked,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Clock,
  User,
  Users,
  Loader2,
  BadgeCheck,
  CalendarDays,
  Pencil,
  Eye,
  FileText
} from "lucide-react";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";

import { getTutorProfile } from "@/lib/api/user";
import { FormatMoney, generateTutorAlias } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Rating } from "@/components/ui/Rating";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { TwoColumn } from "@/components/layout/TwoColumn";

// ─────────────────────────────────────────────────────────────────────────────
// TUTOR PROFILE PAGE — Main UI = freelancer, Header Image = client
// ─────────────────────────────────────────────────────────────────────────────

type TabId = "tongquan" | "danhgia" | "baidang" | "bangcap";

export default function TutorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const slugStr = resolvedParams.slug;

  const [tutorData, setTutorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("tongquan");
  const [isSaved, setIsSaved] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slugStr) return;
    let active = true;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        let idToFetch = slugStr;
        if (typeof window !== "undefined") {
          const savedId = sessionStorage.getItem(`tutor_id_${slugStr}`);
          if (savedId) idToFetch = savedId;
        }
        const response = await getTutorProfile(idToFetch);
        const res: any = response.data || response;
        if (!active) return;

        if (res.code === 200 && res.data) {
          setTutorData(res.data);
          const correctAlias =
            res.data.account?.alias ||
            generateTutorAlias(res.data.account?.name || "", res.data.id);
          if (correctAlias !== slugStr) {
            router.replace(`/tutor/${correctAlias}`);
          }
        } else if (res.code === 404) {
          setNotFound(true);
          toast.error("Không tìm thấy gia sư với đường dẫn này");
        } else if (res.msg) {
          setNotFound(true);
          toast.error(res.msg);
        }
      } catch {
        if (!active) return;
        setNotFound(true);
        toast.error("Không thể tải thông tin gia sư");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [slugStr, router]);

  // ── SKELETON ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[130px] opacity-70 animate-blob animation-delay-4000" />
        </div>

        <TwoColumn
          breadcrumb={[
            { name: "Trang chủ", href: "/" },
            { name: "Đang tải...", href: "#" },
          ]}
          containerClassName="px-4 md:px-8 py-6 md:py-10"
          sidebar={
            <div className="space-y-6">
              <div className="bg-white/70 dark:bg-white/5 border border-primary/20 dark:border-primary/30 rounded-2xl shadow-lg overflow-hidden backdrop-blur-md">
                <div className="px-5 py-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border dark:border-white/10">
                  <Skeleton className="h-3 w-24 mb-2" />
                  <div className="flex items-baseline gap-1">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-4 w-3 ml-0.5" />
                    <Skeleton className="h-3 w-8 ml-0.5" />
                  </div>
                </div>
                <div className="p-5 space-y-2.5">
                  <Skeleton className="h-12 w-full rounded-full" />
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
                <div className="px-5 pb-5 space-y-3 text-sm border-t border-border dark:border-white/10 pt-5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <Card className="relative overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-0 h-[300px]">
               <Skeleton className="w-full h-full" />
            </Card>
            <div className="bg-white/70 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-lg relative overflow-hidden backdrop-blur-md">
              <div className="border-b border-border flex w-full overflow-x-auto scrollbar-hide whitespace-nowrap pb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 min-w-[90px] flex justify-center">
                    <Skeleton className={`h-4 ${i === 0 ? "w-20 bg-primary/20" : "w-16"} rounded-md`} />
                  </div>
                ))}
              </div>
              <div className="mt-6 md:mt-8 space-y-8">
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </TwoColumn>
      </div>
    );
  }

  // ── NOT FOUND ────────────────────────────────────────────────────────────────
  if (notFound || !tutorData) {
    return (
      <div className="min-h-screen bg-transparent pb-20">
        <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
          <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-8">
            <BreadcrumbComponent 
              pathList={[
                { name: "Trang chủ", href: "/" },
                { name: "Không tìm thấy", href: "#" }
              ]} 
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-white/60 dark:border-white/5 rounded-3xl bg-white/40 dark:bg-white/5 max-w-2xl mx-auto">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Users className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Không tìm thấy gia sư</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center mb-6">
              Tài khoản <span className="font-mono font-bold text-primary">{slugStr}</span> không tồn tại hoặc đã bị ẩn. Vui lòng kiểm tra lại đường dẫn.
            </p>
            <Link href="/tim-gia-su">
              <Button className="rounded-2xl px-6 py-5 font-bold shadow-lg">Khám phá danh sách gia sư</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── DATA ─────────────────────────────────────────────────────────────────────
  const { account, bio, major, school, city, district, rating, reviews, exp, rate, skills, degrees, posts, level } = tutorData;
  const name = account?.name || "Gia sư";
  const avatarUrl = (account?.avatar && account.avatar !== "/images/avatar-placeholder.png") ? account.avatar : undefined;

  const levelLabels: Record<string, string> = {
    PRIMARY: "Tiểu học", MIDDLE: "THCS", HIGH: "THPT", UNIVERSITY: "Đại học", ALL: "Mọi cấp độ",
  };
  const levelText = level ? (levelLabels[level] || level) : null;
  const ratingNum = Number(rating || 0);
  const reviewsNum = Number(reviews || 0);
  const hasAbout = bio && bio.trim().length > 0;

  // ── SIDEBAR ──────────────────────────────────────────────────────────────────
  const sidebarContent = (
    <div className="space-y-6">
      <div className="bg-white/70 dark:bg-white/5 border border-primary/20 dark:border-primary/30 rounded-2xl shadow-lg overflow-hidden backdrop-blur-md">
        {/* HỌC PHÍ ĐỀ XUẤT -> TRẠNG THÁI (Đã sửa theo yêu cầu) */}
        <div className="px-5 py-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-border dark:border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Đang nhận học viên
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Gia sư này đang có lịch trống, hãy liên hệ để trao đổi chi tiết về môn học và thời gian.
          </p>
        </div>

        {/* ACTION ZONE */}
        <div className="p-5 space-y-2.5">
          <Button
            disabled={contacting}
            onClick={() => {
              if (!tutorData?.user) {
                toast.error("Không thể mở chat. Thiếu thông tin người dùng.");
                return;
              }
              setContacting(true);
              router.push(`/chat?user=${tutorData.user}`);
            }}
            className="w-full h-12 bg-primary text-white font-extrabold text-sm md:text-base rounded-full shadow-[0_4px_15px_rgba(168,85,247,0.3)] hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {contacting && <Loader2 size={16} className="animate-spin" />}
            {contacting ? "Đang mở..." : "Liên hệ ngay"}
          </Button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-full h-12 flex items-center justify-center gap-2 px-5 border-2 border-border dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-sm transition-all rounded-full group"
          >
            <div className="ui-bookmark flex items-center">
              <input type="checkbox" className="hidden" checked={isSaved} readOnly />
              <div className={`bookmark flex items-center transition-transform group-hover:scale-110 ${isSaved ? "text-primary" : "text-muted-foreground dark:text-zinc-400"}`}>
                {isSaved ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
              </div>
            </div>
            <span className="font-extrabold text-foreground dark:text-white text-sm md:text-base">
              {isSaved ? "Đã lưu" : "Lưu yêu thích"}
            </span>
          </button>
        </div>

        {/* TRUST INFO */}
        <div className="px-5 pb-5 space-y-2 text-sm border-t border-border dark:border-white/10 pt-5">
          {exp && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground dark:text-zinc-400 flex items-center gap-1.5">
                <Briefcase size={14} /> Kinh nghiệm
              </span>
              <span className="font-semibold text-foreground dark:text-white">{exp} năm</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground dark:text-zinc-400 flex items-center gap-1.5">
              <Star size={14} /> Đánh giá
            </span>
            {reviewsNum > 0 ? (
              <Rating rating={ratingNum} reviews={reviewsNum} />
            ) : (
              <span className="font-semibold text-foreground dark:text-white">Chưa cập nhật</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Bảo vệ thanh toán
            </span>
            <span className="font-semibold text-foreground dark:text-white">100% an toàn</span>
          </div>
        </div>

        {/* INLINE TRUST FOOTER */}
        <div className="px-5 py-3 bg-slate-50/40 dark:bg-white/5 border-t border-border dark:border-white/10 flex items-center gap-2">
          <ShieldCheck size={12} className="text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground dark:text-zinc-400 leading-snug">
            Hồ sơ được xác thực bởi <strong className="text-foreground dark:text-white">Learnix</strong> — hỗ trợ 24/7
          </p>
        </div>
      </div>
    </div>
  );

  // ── MAIN RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen">
      {/* GLOW EFFECTS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[130px] opacity-70 animate-blob animation-delay-4000" />
      </div>

      <TwoColumn
        breadcrumb={[
          { name: "Trang chủ", href: "/" },
          { name: name, href: "#" },
        ]}
        containerClassName="px-4 md:px-8 py-6 md:py-10"
        sidebar={sidebarContent}
      >
        <div className="space-y-6">
          {/* MOBILE CTA */}
          <div className="block lg:hidden bg-white/70 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl p-4 shadow-sm mb-6 backdrop-blur-md">
            <div className="flex gap-3">
              <Button
                disabled={contacting}
                onClick={() => {
                  if (!tutorData?.user) {
                    toast.error("Không thể mở chat. Thiếu thông tin người dùng.");
                    return;
                  }
                  setContacting(true);
                  router.push(`/chat?user=${tutorData.user}`);
                }}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-extrabold text-sm rounded-xl shadow-[0_4px_15px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {contacting && <Loader2 size={14} className="animate-spin" />}
                {contacting ? "Đang mở..." : "Liên hệ ngay"}
              </Button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="px-4 h-12 border border-border dark:border-white/10 rounded-xl flex items-center justify-center bg-background dark:bg-white/5 hover:border-primary/30 dark:hover:border-primary/40 transition-all group"
              >
                <div className="ui-bookmark">
                  <input type="checkbox" className="hidden" checked={isSaved} readOnly />
                  <div className={`bookmark ${isSaved ? "text-primary" : "text-muted-foreground dark:text-zinc-400"}`}>
                    <svg viewBox="0 0 32 32" className={`w-6 h-6 transition-transform group-hover:scale-110 ${isSaved ? "fill-primary" : "fill-none stroke-[3px] stroke-current"}`}>
                      <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── Client Detail Cover Banner (Sửa lại nền đẹp hơn) ── */}
          <Card className="relative overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-0 mb-6">
            {/* Background trừu tượng, cao cấp */}
            <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-900 dark:bg-slate-950">
              <div className="absolute inset-0 opacity-50">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[80px] opacity-70 animate-pulse" />
                <div className="absolute top-0 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-60" />
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/90 dark:from-slate-950/80 to-transparent z-10" />
            </div>

            <div className="relative px-6 pb-8 sm:px-10 sm:pb-10">
              <div className="flex flex-col gap-8 -mt-20 md:flex-row md:items-end md:justify-between min-w-0 w-full relative z-20">
                {/* LEFT: avatar + identity */}
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-end min-w-0 flex-1 w-full md:w-auto">
                  <div className="relative h-36 w-36 sm:h-40 sm:w-40 rounded-[2.2rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl shrink-0 bg-white dark:bg-slate-800">
                    <Avatar
                      src={avatarUrl}
                      alt={name}
                      size="xl"
                      className="!h-full !w-full !rounded-none !border-0 bg-slate-100 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-3 text-center md:text-left min-w-0 flex-1 w-full">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                      <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl truncate max-w-full">
                        {name}
                      </h1>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black tracking-widest text-primary border border-primary/20 backdrop-blur-sm shadow-sm shrink-0">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        ĐÃ XÁC MINH
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                      {city && (
                        <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100 dark:shadow-none">
                          <MapPin size={14} className="text-primary" />
                          {district ? `${district}, ` : ""}{city}
                        </div>
                      )}
                      {(major || school) && (
                        <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-white/5 px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100 dark:shadow-none">
                          <GraduationCap size={14} className="text-primary" />
                          {major}{school ? ` · ${school}` : ""}
                        </div>
                      )}
                      <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-white/5 px-4 py-1.5 rounded-full border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100 dark:shadow-none">
                        {reviewsNum > 0 ? (
                          <Rating rating={ratingNum} reviews={reviewsNum} />
                        ) : (
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            Chưa có đánh giá
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* ═══ TAB NAVIGATION VÀ NỘI DUNG ═══ */}
          <div className="bg-white/70 dark:bg-white/5 border border-border dark:border-white/10 rounded-2xl p-4 md:p-6 shadow-lg relative overflow-hidden backdrop-blur-md">

            {/* TAB NAVIGATION */}
            <div className="border-b border-border flex w-full overflow-x-auto scrollbar-hide whitespace-nowrap">
              {([
                { id: "tongquan", label: "Tổng quan" },
                { id: "danhgia", label: "Đánh giá" },
                { id: "baidang", label: "Bài đăng" },
                { id: "bangcap", label: "Bằng cấp" },
              ] as { id: TabId; label: string }[]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[90px] pb-3 text-center text-sm md:text-base font-bold border-b-2 transition-all ${activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground dark:text-zinc-400 hover:text-dark dark:hover:text-white"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT (Nếu là tổng quan thì cuộn dài chứa tất cả, nếu không thì tách riêng) */}
            <div className="mt-6 md:mt-8 space-y-12">

              {/* ── TỔNG QUAN (Bio & Skills & Môn Dạy) ── */}
              {activeTab === "tongquan" && (
                <div className="space-y-8 md:space-y-10 animate-fade-in">
                  
                  {/* Top Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Tóm tắt */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <h2 className="text-lg md:text-xl font-extrabold text-dark dark:text-white leading-tight mb-1">
                          Thông tin gia sư
                        </h2>
                        <p className="text-sm text-muted-foreground">Tổng quan về hồ sơ và kinh nghiệm</p>
                      </div>

                      <div className="flex flex-row items-center flex-nowrap gap-x-1.5 xs:gap-x-2 sm:gap-x-3 text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-muted-foreground dark:text-zinc-400 font-medium overflow-x-auto scrollbar-hide whitespace-nowrap">
                        {exp && (
                          <>
                            <span>Kinh nghiệm <strong className="text-dark dark:text-white font-bold">{exp} năm</strong></span>
                            <span className="text-muted-foreground/30">|</span>
                          </>
                        )}
                        <span>Học viên <strong className="text-dark dark:text-white font-bold">12+</strong></span>
                        <span className="text-muted-foreground/30">|</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                          {reviewsNum > 0 ? (
                            <>
                              <strong className="text-dark dark:text-white font-bold">{ratingNum.toFixed(1)}</strong>
                              <span className="text-muted-foreground dark:text-zinc-400">({reviewsNum} đánh giá)</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground dark:text-zinc-400 font-normal">Chưa đánh giá</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Chuyên môn */}
                    <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                      {(levelText || (skills && skills.length > 0)) && (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-7 w-1 rounded-full bg-primary" />
                            <h3 className="text-base font-extrabold text-dark dark:text-white tracking-tight">
                              Cấp bậc dạy
                            </h3>
                          </div>
                          <div className="flex flex-col gap-3">
                            {levelText && (
                              <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                                <span className="text-[14px] text-dark dark:text-zinc-200 font-medium leading-tight">{levelText}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border w-full pt-2" />

                  {/* Bio */}
                  {bio && (() => {
                    const PLACEHOLDER = "Chưa cập nhật giới thiệu bản thân";
                    const full = bio.trim();
                    if (!full || full === PLACEHOLDER) return null;
                    return (
                      <p className="text-dark dark:text-zinc-300 leading-[1.8] text-[15px] whitespace-pre-line opacity-90 text-justify break-all overflow-hidden">
                        {bio}
                      </p>
                    );
                  })()}

                  {/* Skills Summary (Môn dạy) */}
                  {skills && skills.length > 0 && (
                    <div className="border-t border-border pt-6">
                      <h3 className="text-sm md:text-[15px] font-bold text-dark dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen size={18} className="text-primary" /> Môn có thể dạy
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {skills.map((skill: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-border dark:border-white/10 hover:border-primary/40 transition-all">
                            <div className="font-extrabold text-dark dark:text-white text-base mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              {skill.subject?.name || skill.topic}
                            </div>
                            {skill.grades && skill.grades.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {skill.grades.map((g: any, gi: number) => (
                                  <span key={gi} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-white/10 text-dark dark:text-zinc-300 border border-border dark:border-white/10 shadow-sm">
                                    Lớp {g}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ĐÁNH GIÁ ── */}
              {(activeTab === "tongquan" || activeTab === "danhgia") && (
                <div className={activeTab === "tongquan" ? "border-t border-border pt-8" : "animate-fade-in"}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-1 rounded-full bg-primary" />
                    <h2 className="text-lg md:text-xl font-extrabold text-dark dark:text-white tracking-tight">
                      Đánh giá từ học viên
                    </h2>
                    {reviewsNum > 0 && <span className="text-sm font-semibold text-muted-foreground">· {reviewsNum}</span>}
                  </div>
                  
                  {/* Reviews List */}
                  <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-white/40 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-white/5 backdrop-blur-md">
                    <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center mb-3 text-primary">
                      <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <p className="text-muted-foreground dark:text-zinc-400 text-sm font-medium italic text-center">Gia sư chưa có đánh giá nào.</p>
                  </div>
                </div>
              )}

              {/* ── BÀI ĐĂNG ── */}
              {(activeTab === "tongquan" || activeTab === "baidang") && (
                <div className={activeTab === "tongquan" ? "border-t border-border pt-8" : "animate-fade-in"}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-1 rounded-full bg-primary" />
                    <h2 className="text-lg md:text-xl font-extrabold text-dark dark:text-white tracking-tight">
                      Bài đăng đang hoạt động
                    </h2>
                    {posts && posts.length > 0 && <span className="text-sm font-semibold text-muted-foreground">· {posts.length}</span>}
                  </div>

                  {posts && posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post: any) => (
                        <Link
                          key={post.id}
                          href={`/find-posts/${post.id}`}
                          className="block p-5 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-border dark:border-white/10 hover:border-primary/40 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                {post.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                {post.subject && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {post.subject}</span>}
                                {post.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {post.city}</span>}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="text-primary font-extrabold text-base">
                                {post.from ? Number(post.from).toLocaleString("vi-VN") + "₫" : "Thỏa thuận"}
                              </span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-white/40 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-white/5 backdrop-blur-md">
                      <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center mb-3 text-primary">
                        <BookMarked className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <p className="text-muted-foreground dark:text-zinc-400 text-sm font-medium italic text-center">Gia sư chưa có bài đăng nào.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── BẰNG CẤP ── */}
              {(activeTab === "tongquan" || activeTab === "bangcap") && (
                <div className={activeTab === "tongquan" ? "border-t border-border pt-8" : "animate-fade-in"}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-1 rounded-full bg-primary" />
                    <h2 className="text-lg md:text-xl font-extrabold text-dark dark:text-white tracking-tight">
                      Bằng cấp & Chứng chỉ
                    </h2>
                    {degrees && degrees.length > 0 && <span className="text-sm font-semibold text-muted-foreground">· {degrees.length}</span>}
                  </div>

                  {degrees && degrees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {degrees.map((deg: any, i: number) => (
                        <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-border dark:border-white/10 hover:border-primary/40 transition-all">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-extrabold text-dark dark:text-white">{deg.name}</h4>
                            <p className="text-sm text-muted-foreground dark:text-zinc-400 mt-0.5">{deg.issuer}</p>
                            {deg.year && (
                              <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                {deg.year}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-white/40 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-white/5 backdrop-blur-md">
                      <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center mb-3 text-primary">
                        <Award className="w-6 h-6" strokeWidth={1.5} />
                      </div>
                      <p className="text-muted-foreground dark:text-zinc-400 text-sm font-medium italic text-center">Chưa cập nhật bằng cấp.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </TwoColumn>
    </div>
  );
}