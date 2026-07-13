"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search, X, Bookmark, Filter,
  GraduationCap, LogIn,
  SlidersHorizontal, BookX, Plus,
  Wallet
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/Pagination";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import type { Course } from "@/lib/api/types";
import { CoursesAPI } from "@/lib/api/courses";
import { GetToken } from "@/lib/auth/session";
import { jwtDecode } from "jwt-decode";
import CoursesSkeleton from "@/components/courses/CoursesSkeleton";
import { useRouter } from "next/navigation";
import { FormatMoney } from "@/lib/utils";
import CoursesCard from "@/components/courses/CoursesCard";

const SORT = [
  { label: "Mặc định", value: "relevant" },
  { label: "Học phí thấp nhất", value: "price-low" },
  { label: "Học phí cao nhất", value: "price-high" },
];

const GRADE = [
  { key: "all", label: "Tất cả" },
  { key: "6", label: "Khối 6" },
  { key: "7", label: "Khối 7" },
  { key: "8", label: "Khối 8" },
  { key: "9", label: "Khối 9" },
  { key: "10", label: "Khối 10" },
  { key: "11", label: "Khối 11" },
  { key: "12", label: "Khối 12" },
  { key: "other", label: "Đại học" },
] as const;

const STATUS = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang mở" },
  { key: "inactive", label: "Tạm đóng" },
] as const;

const QUICK_FEE = [
  { label: "Tất cả", max: 5000000 },
  { label: "Miễn phí", max: 0 },
  { label: "< 1 Triệu", max: 1000000 },
  { label: "< 2 Triệu", max: 2000000 },
  { label: "< 3 Triệu", max: 3000000 },
  { label: "< 4 Triệu", max: 4000000 },
];

const LIMIT = 6;
const FEE_LIMIT = 5000000;

type GradeMap = (typeof GRADE)[number]["key"];
type StatusMap = (typeof STATUS)[number]["key"];

function FilterGrade(grade: string | number, map: GradeMap) {
  if (map === "all") return true;
  const str = String(grade || "");
  if (map === "other")
    return !["6", "7", "8", "9", "10", "11", "12"].some((g) => str.includes(g));
  return str.includes(map);
}

function FilterPage(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function FindCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [courses, setCourses] = useState<(Course & Record<string, any>)[]>([]);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeMap>("all");
  const [statusFilter, setStatusFilter] = useState<StatusMap>("all");
  const [maxFee, setMaxFee] = useState<number>(FEE_LIMIT);
  const [sortBy, setSortBy] = useState("relevant");

  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(1);
  const [showFilters, setShowFilters] = useState(false);
  const isFirst = useRef(true);

  // Hàm gọi API
  const fetchData = useCallback(async (targetPage: number, keyword: string) => {
    setLoading(true);
    try {
      const res = await CoursesAPI.getAll({ search: keyword.trim(), page: targetPage, limit: LIMIT });
      // ! Đúng theo ApiResponse<Course[]>: res.data luôn là mảng, res.pagination luôn nằm ở top-level (không lồng trong data)
      if (res && res.success === true && res.data) {
        setCourses(Array.isArray(res.data) ? res.data : []);
        setTotal(res.pagination?.pages || 1);
      } else {
        toast.error("Không thể tải danh sách khóa học, vui lòng thử lại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm tìm kiếm
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      fetchData(page, search);
      return;
    }
    const timeout = setTimeout(() => {
      fetchData(page, search);
    }, 350);
    return () => clearTimeout(timeout);
  }, [page, search]);

  const hasFilter =
    search.trim() !== "" ||
    gradeFilter !== "all" ||
    statusFilter !== "all" ||
    maxFee < FEE_LIMIT;

  const reset = () => {
    setSearch("");
    setGradeFilter("all");
    setStatusFilter("all");
    setMaxFee(FEE_LIMIT);
    setSortBy("relevant");
    setPage(1);
  };

  // Hàm lưu kết quả tìm kiếm
  const results = useMemo(() => {
    const filtered = courses.filter((cls) => {
      const matches_grade = FilterGrade(cls.grade, gradeFilter);
      const matches_status =
        statusFilter === "all" ||
        (statusFilter === "active" && cls.active) ||
        (statusFilter === "inactive" && !cls.active);
      const matches_fee = (Number(cls.fee) || 0) <= maxFee;

      return matches_grade && matches_status && matches_fee;
    });

    if (sortBy === "price-low") {
      return [...filtered].sort((a, b) => (Number(a.fee) || 0) - (Number(b.fee) || 0));
    }
    if (sortBy === "price-high") {
      return [...filtered].sort((a, b) => (Number(b.fee) || 0) - (Number(a.fee) || 0));
    }
    return filtered;
  }, [courses, gradeFilter, statusFilter, maxFee, sortBy]);

  const chips = useMemo(() => {
    return [
      gradeFilter !== "all" && {
        label: `${GRADE.find((g) => g.key === gradeFilter)?.label}`,
        onRemove: () => setGradeFilter("all"),
      },
      statusFilter !== "all" && {
        label: `Trạng thái: ${STATUS.find((s) => s.key === statusFilter)?.label}`,
        onRemove: () => setStatusFilter("all"),
      },
      maxFee < FEE_LIMIT && {
        label: `Học phí ≤ ${FormatMoney(maxFee)}`,
        onRemove: () => setMaxFee(FEE_LIMIT),
      },
    ].filter((item): item is { label: string; onRemove: () => void } => !!item);
  }, [gradeFilter, statusFilter, maxFee]);

  const activeBadge = chips.length;
  const hasActive = activeBadge > 0;

  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    const token = GetToken();
    if (!token) return null;
    try {
      return jwtDecode<{ role: string; name?: string; id?: string }>(token);
    } catch {
      return null;
    }
  }, []);

  const [modal, setModal] = useState(false);
  const [code, setCode] = useState("");

  // Hàm đăng ký khóa học bằng mã
  const EnrollCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã khóa học!");
      return;
    }
    setLoading(true);
    try {
      const res = await CoursesAPI.enroll(code.trim());
      if (res && res.success === true) {
        toast.success("Đăng ký khóa học thành công!");
        setModal(false);
        setCode("");
        fetchData(page, search);
      } else {
        toast.error(res?.message || "Mã khóa học không chính xác hoặc khóa học đã đóng!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể đăng ký khóa học lúc này.");
    } finally {
      setLoading(false);
    }
  };

  const pageNumbers = useMemo(() => FilterPage(page, total), [page, total]);

  // ═══ BỘ LỌC ═══
  const FilterContent = () => (
    <div className="space-y-6 pr-1">
      {/* Khối lớp */}
      <div className="pb-5 border-b border-slate-100 dark:border-white/5">
        <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-black text-slate-500 dark:text-slate-400 mb-2.5 select-none">
          <GraduationCap size={16} className="text-primary" /> Khối lớp
        </h3>

        <Select
          value={gradeFilter}
          onValueChange={(val) => setGradeFilter((val as GradeMap) ?? "all")}
        >
          <SelectTrigger className="w-full h-11 px-3.5 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm outline-none cursor-pointer">
            <SelectValue placeholder="Tất cả khối lớp">
              {GRADE.find((g) => g.key === gradeFilter)?.label || "Tất cả khối lớp"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 z-[100]">
            {GRADE.map((g) => (
              <SelectItem key={g.key} value={g.key} className="rounded-xl cursor-pointer text-xs font-bold py-2 px-3 my-0.5 focus:bg-primary/10 focus:text-primary outline-none transition-colors">
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mức học phí */}
      <div className="pb-5 border-b border-slate-100 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-black text-slate-500 dark:text-slate-400 select-none m-0">
            <Wallet size={16} className="text-primary" /> Mức học phí
          </h3>
          <span className="text-xs font-black text-primary">
            {maxFee >= FEE_LIMIT ? "Tất cả mức giá" : `≤ ${FormatMoney(maxFee)}`}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={FEE_LIMIT}
          step="any"
          value={maxFee}
          onChange={(e) => setMaxFee(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg"
        />

        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="col-span-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tối đa (VNĐ)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={maxFee.toLocaleString("vi-VN")}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setMaxFee(raw ? Math.min(Number(raw), FEE_LIMIT) : 0);
            }}
            className="col-span-2 h-10 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 text-xs font-bold text-foreground outline-none transition-all focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {QUICK_FEE.map((q, idx) => {
            const isActive = maxFee === q.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setMaxFee(Number(q.max))}
                className={`rounded-xl px-2.5 py-1 text-xs transition-all cursor-pointer border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-transparent shadow-md shadow-primary/20 font-black scale-102"
                    : "bg-white/60 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary font-bold"
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trạng thái */}
      <div>
        <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-black text-slate-500 dark:text-slate-400 mb-3 select-none">
          <SlidersHorizontal size={16} className="text-primary" /> Trạng thái
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUS.map((s) => {
            const isInactiveButton = s.key === "inactive";
            const isActiveButton = s.key === "active";
            const isSelected = statusFilter === s.key;
            
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-black transition-colors cursor-pointer ${
                  isSelected
                    ? isInactiveButton
                      ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : isActiveButton
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-primary/20 bg-primary/10 text-primary"
                    : "border-slate-200/80 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:border-white/10"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-300 pb-12 font-sans">
      {/* ═══ BREADCRUMB ═══ */}
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <BreadcrumbComponent
            pathList={[
              { name: "Trang chủ", href: "/" },
              { name: "Tìm kiếm khóa học", href: "/find-courses" },
            ]}
          />
        </div>
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <div className="relative overflow-hidden py-6 md:py-4">
        <div className="max-w-[1280px] mx-auto px-4 relative z-10">
          <div className="bg-white/50 dark:bg-slate-900/40 border border-white/60 dark:border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-sm space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-2 rounded-full bg-primary" />
                <div>
                  <h1 className="m-0 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                    Khám Phá Khóa Học
                  </h1>
                  <p className="m-0 mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                    Tìm kiếm khóa học chất lượng cao theo đúng nhu cầu và ngân sách của bạn
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {user?.role === "TEACHER" ? (
                  <Button
                    nativeButton={false}
                    render={<Link href="/post-classrooms" />}
                    className="h-11 rounded-2xl px-5 text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" /> Tạo khóa học mới
                  </Button>
                ) : (
                  <Button
                    nativeButton={false}
                    onClick={() => setModal(true)}
                    className="h-11 rounded-2xl px-5 text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" /> Đăng ký khóa học bằng mã
                  </Button>
                )}

                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<Link href="/" />}
                  className="h-11 rounded-2xl px-5 text-xs font-bold !bg-white dark:!bg-white/10 !border-slate-200 dark:!border-white/15 !text-slate-700 dark:!text-white hover:!bg-slate-50 dark:hover:!bg-white/15 hover:!border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Bookmark className="h-4 w-4" /> Khóa học đã lưu
                </Button>
              </div>
            </div>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhập tên khóa học, mã khóa học bạn muốn tìm kiếm..."
              leftAdornment={<Search className="h-4.5 w-4.5 text-muted-foreground" />}
              rightAdornment={
                search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="cursor-pointer rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : undefined
              }
              className="!h-12 !rounded-2xl !bg-white/70 dark:!bg-white/5 !border-white/50 dark:!border-white/10 !text-sm !font-medium !shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <h2 className="m-0 text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? "Đang tìm kiếm" : "Tìm thấy"}{" "}
              {!loading && <span className="text-primary font-black">{results.length}</span>}{" "}
              khóa học phù hợp{total > 1 ? ` · Trang ${page}/${total}` : ""}
            </h2>

            <div className="flex items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowFilters(true)}
                className="flex lg:hidden items-center justify-center gap-2 px-4 h-11 border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer hover:border-primary transition-all shadow-sm shrink-0 whitespace-nowrap"
              >
                <Filter className="h-4 w-4" />
                <span>Bộ lọc</span>
                {activeBadge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ml-0.5">
                    {activeBadge}
                  </span>
                )}
              </button>

              <div className="min-w-[180px]">
                <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "relevant")}>
                  <SelectTrigger className="h-11 px-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm outline-none whitespace-nowrap w-full cursor-pointer">
                    <SelectValue placeholder="Sắp xếp theo">
                      {SORT.find((opt) => opt.value === sortBy)?.label || "Sắp xếp theo"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 min-w-[200px] z-[100]">
                    {SORT.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="rounded-xl cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 focus:bg-primary/10 focus:text-primary transition-colors my-0.5 whitespace-nowrap"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Chips */}
          <div className="w-full min-h-[28px]">
            {hasActive ? (
              <div className="flex items-center gap-2 flex-wrap py-0.5">
                {chips.map((item, i) => (
                  <span
                    key={i}
                    className="cursor-pointer shrink-0 animate-in fade-in zoom-in-95 duration-150"
                    onClick={item.onRemove}
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-black text-sky-600 transition-colors hover:border-sky-500/40 hover:bg-sky-500/20 dark:text-sky-400"
                    >
                      {item.label} <X className="h-4 w-4 opacity-70" />
                    </Badge>
                  </span>
                ))}

                {hasFilter && (
                  <button
                    onClick={reset}
                    className="whitespace-nowrap shrink-0 inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-black text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
                  >
                    <span>XÓA TẤT CẢ</span> <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Layout Danh sách + Sidebar */}
        <div className="flex gap-8 pb-10 mt-2">
          <aside className="w-[320px] shrink-0 sticky top-[90px] h-fit p-6 bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none max-lg:hidden flex flex-col transition-all">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200/50 dark:border-white/10">
              <span className="text-xs font-black text-foreground tracking-tight flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> BỘ LỌC TÌM KIẾM
              </span>
            </div>

            <div className="pr-1">
              {FilterContent()}
            </div>
          </aside>

          {/* ═══ MOBILE FILTERS DRAWER ═══ */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/60 z-[999] lg:hidden backdrop-blur-sm animate-in fade-in"
              onClick={() => setShowFilters(false)}
            >
              <div
                className="fixed right-0 top-0 bottom-0 w-[85vw] sm:w-[380px] bg-white dark:bg-slate-950 overflow-y-auto z-[1000] rounded-l-3xl shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-slate-950 z-[1]">
                  <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Filter className="h-4.5 w-4.5 text-primary" /> BỘ LỌC TÌM KIẾM
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  {FilterContent()}
                </div>

                {hasActive && (
                  <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 sticky bottom-0">
                    <button
                      type="button"
                      onClick={() => { reset(); setShowFilters(false); }}
                      className="whitespace-nowrap shrink-0 inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-black text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
                    >
                      <X className="h-4 w-4" /> XÓA TẤT CẢ
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ LISTING COLUMN ═══ */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col gap-5">
                {Array.from({ length: LIMIT }).map((_, i) => <CoursesSkeleton key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <Empty
                variant="search"
                icon={<BookX className="h-12 w-12 text-primary" />}
                title="Không tìm thấy khóa học nào phù hợp"
                description="Thử điều chỉnh lại bộ lọc để tìm kiếm lại nhé"
                action={
                  hasFilter ? (
                    <Button variant="outline" onClick={reset} className="whitespace-nowrap shrink-0 inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-black text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400">
                      <X className="h-4 w-4 mr-1" /> XÓA BỘ LỌC
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="flex flex-col gap-5">
                {results.map((cls) => (
                  <div key={cls.id} className="transition-all duration-200 hover:-translate-y-0.5">
                    <CoursesCard
                      course={{
                        ...cls,
                        count: cls.count ?? (cls as any).enrolled ?? 0,
                      }}
                      onAction={(id) => router.push(cls.status ? `/my-classrooms/?id=${id}` : `/my-classrooms/${id}`)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Phân trang */}
            {!loading && results.length > 0 && total > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                      className={page === 1 ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>

                  {pageNumbers.map((p, idx) =>
                    p === "..." ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p as number);
                          }}
                          className="font-bold text-xs"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(total, p + 1));
                      }}
                      className={page === total ? "pointer-events-none opacity-40" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MODAL THAM GIA BẰNG MÃ ═══ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md !p-6 !rounded-3xl shadow-2xl border border-white/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl relative">
            <button
              onClick={() => { setModal(false); setCode(""); }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <LogIn className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="m-0 text-lg font-black text-foreground leading-tight tracking-tight">Đăng ký khóa học</h3>
                  <p className="m-0 text-xs text-muted-foreground">Nhập mã khóa học</p>
                </div>
              </div>

              <form onSubmit={EnrollCode} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Input
                    autoFocus
                    placeholder="XXXX-XXX-XXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="!rounded-2xl uppercase font-bold text-center tracking-wider text-base h-12 bg-slate-100/50 dark:bg-white/5 border-slate-200/70 dark:border-white/10"
                  />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Mã khóa học chỉ gồm chữ hoa, số và dấu gạch ngang
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setModal(false); setCode(""); }}
                    className="flex-1 h-11 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1 h-11 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    Tham gia ngay
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}