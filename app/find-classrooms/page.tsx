// * Accept * //

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search, X, Bookmark, Star, Users,
  GraduationCap, Wallet, ArrowUpRight, LogIn,
  SlidersHorizontal, BookX, Plus,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";

import type { Classroom } from "@/lib/api/types";
import { ClassroomsAPI } from "@/lib/api/classrooms";
import { NormalizeString, FormatMoney } from "@/lib/utils";
import { GetToken } from "@/lib/auth/session";
import { jwtDecode } from "jwt-decode";

const  GRADE = [
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

// Chuyển thành kiểu map
type GradeMap = (typeof  GRADE)[number]["key"];
type StatusMap = (typeof STATUS)[number]["key"];

// Hàm lọc lớp học theo cấp học đã chọn.
function FilterGrade(grade: string | number, map: GradeMap) {
  if (map === "all") 
      return true;
  
  const str = String(grade || "");

  if (map === "other") 
    return !["6", "7", "8", "9", "10", "11", "12"].some((g) => str.includes(g));
  return str.includes(map);
}

// Thanh tiến trình về số lượng học sinh tham gia
function ProgressBar({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const percent = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Sĩ số</span>
        <span className="text-foreground">{enrolled}/{capacity}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Khung xương cho thẻ lớp học
function SkeletionCard() {
  return (
    <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24 !rounded-full" />
        <Skeleton className="h-5 w-16 !rounded-full" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 !rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-10 w-full !rounded-xl" />
    </Card>
  );
}

export default function ClassroomsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [classrooms, setClassrooms] = useState<(Classroom & Record<string, any>)[]>([]);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeMap>("all");
  const [statusFilter, setStatusFilter] = useState<StatusMap>("all");

  // Fetch danh sách lớp học từ BE
  const fetchData = useCallback(async () => {
    // Trạng thái load
    setLoading(true);
    try {
      // Gọi API
      const res = await ClassroomsAPI.getAll();
      if (res.status === "SUCCESS" && res.data) {
        setClassrooms(res.data as any);
      } else {
        toast.error("Không thể tải danh sách lớp học, vui lòng thử lại");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Kiểm tra xem người dùng có đang áp dụng bộ lọc nào hay không
  const hasFilter = search.trim() !== "" || gradeFilter !== "all" || statusFilter !== "all";

  // Đặt lại bộ lọc hay xóa bộ lọc
  const reset = () => {
    setSearch("");
    setGradeFilter("all");
    setStatusFilter("all");
  };

  // Ghi nhớ kết quả lọc để chỉ tính toán lại khi dữ liệu hoặc bộ lọc thay đổi
  const results = useMemo(() => {
    // Xử lý từ khóa
    const keyword = search.trim().toLowerCase();

    // Trả về danh sách thỏa điều kiện
    return classrooms.filter((cls) => {
      const text = [
        cls.name,
        cls.code,
        cls.grade,
        cls.description,
      ]
        .filter(Boolean)
        .join(" "); 

      const tokens = NormalizeString(keyword).split(/\s+/).filter(Boolean);
      const matches_search = tokens.length === 0 || tokens.some((token) => NormalizeString(text).includes(token));

      // Danh sách phù hợp với trạng thái
      const matches_status =
        statusFilter === "all" ||
        (statusFilter === "active" && cls.active) ||
        (statusFilter === "inactive" && !cls.active);

      return matches_search && FilterGrade(cls.grade, gradeFilter) && matches_status;
    });
  }, [classrooms, search, gradeFilter, statusFilter]);

  // Lấy token
  const user = useMemo(() => {
    if (typeof window === "undefined") 
      return null;
    const token = GetToken();
    if (!token) return null;
    try {
      // Giải mã token
      return jwtDecode<{ role: string; name?: string; id?: string }>(token);
    } catch {
      return null;
    }
  }, []);

  const [modal, setModal] = useState(false);
  const [code, setCode] = useState("");

  const EnrollCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã lớp học!");
      return;
    }

    setLoading(true);

    try {
      // Gọi API
      const res = await ClassroomsAPI.joinClass(code.trim());
      
      if (res && res.status === "SUCCESS") {
        toast.success("Tham gia lớp học thành công!");
        setModal(false);
        setCode("");
        fetchData(); 
      } else {
        toast.error(res?.message || "Mã lớp học không chính xác hoặc lớp đã đóng!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Không thể tham gia lớp học lúc này.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-6">

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-primary" />
            <div>
              <h1 className="m-0 text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Khám Phá Lớp Học</h1>
              <p className="m-0 mt-1.5 text-sm text-muted-foreground">Tìm lớp học phù hợp và bắt đầu hành trình học tập của bạn.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 ml-auto w-fit">
            {user?.role === "TEACHER" ? (
              <Button 
                nativeButton={false} 
                render={<Link href="/classrooms/create" />} 
                className="h-11 w-full rounded-2xl text-[13px] gap-2 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10"
              >
                <Plus className="h-4 w-4" /> Tạo lớp học mới
              </Button>
            ) : (
              <Button 
                nativeButton={false} 
                variant="outline" 
                onClick={() => setModal(true)}
                className="h-11 w-full rounded-2xl text-[13px] gap-2 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10"
              >
                <LogIn className="h-4 w-4" /> Tham gia lớp học bằng mã
              </Button>
            )}

            <Button 
              nativeButton={false} 
              variant="secondary"
              render={<Link href="/classrooms/stored" />} 
              className="h-11 rounded-2xl px-5 text-[13px] shadow-lg shadow-primary/20"
            >
              <Bookmark className="h-4 w-4" /> Lớp học đã lưu
            </Button>
          </div>
        </div>

        {/* ═══ SEARCH & FILTER BAR ═══ */}
        <Card className="!p-4 sm:!p-5 !rounded-3xl space-y-4">
          {/* Search */}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập lớp học bạn muốn tìm kiếm..."
            leftAdornment={<Search className="h-4 w-4" />}
            rightAdornment={
              search ? (
                <button onClick={() => setSearch("")} className="cursor-pointer rounded-full p-0.5 hover:bg-muted transition-colors" aria-label="Xóa tìm kiếm">
                  <X className="h-4 w-4" />
                </button>
              ) : undefined
            }
            className="!rounded-2xl"
          />

          {/* Grade filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" /> Khối lớp
            </div>
            <div className="flex flex-wrap gap-2">
              { GRADE.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGradeFilter(g.key)}
                  className={`rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all cursor-pointer ${
                    gradeFilter === g.key
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border border-slate-200/70 bg-white/55 text-muted-foreground hover:border-primary/30 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Trạng thái
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all cursor-pointer ${
                    statusFilter === s.key
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "border border-slate-200/70 bg-white/55 text-muted-foreground hover:border-primary/30 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ═══ GRID ═══ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletionCard key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <Empty
            variant="search"
            icon={<BookX className="h-10 w-10 text-primary" />}
            title="Không tìm thấy lớp học nào phù hợp"
            description="Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả khác."
            action={
              hasFilter ? (
                <Button variant="outline" onClick={reset} className="h-11 rounded-2xl px-6 text-[13px]">
                  <X className="h-4 w-4" /> Xóa bộ lọc
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((cls) => (
              <Card key={cls.id} hover className="!p-4 sm:!p-5 !rounded-3xl flex flex-col gap-4">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <Badge variant={cls.active ? "success" : "warning"}>
                    {cls.active ? "Đang mở" : "Tạm đóng"}
                  </Badge>
                  <Badge variant="secondary" className="gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> Khối {cls.grade}
                  </Badge>
                </div>

                {/* Title & Code */}
                <div className="space-y-1">
                  <h3 className="m-0 line-clamp-2 text-base font-black leading-snug tracking-tight text-foreground">
                    {cls.name}
                  </h3>
                  <p className="m-0 text-[12px] font-bold text-primary">Mã lớp: {cls.code}</p>
                </div>

                {/* Teacher & Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar alt={cls.name} size="sm" />
                    <span className="truncate text-[13px] font-medium text-muted-foreground">{cls.name}</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {(cls.rating || 0).toFixed(1)}
                  </span>
                </div>

                {/* Fee */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Học phí
                  </span>
                  {!cls.fee || cls.fee === 0 ? (
                    <Badge variant="success">Miễn phí</Badge>
                  ) : (
                    <span className="text-[13px] font-black text-foreground">{FormatMoney(cls.fee)}</span>
                  )}
                </div>

                {/* Enroll progress */}
                <ProgressBar enrolled={cls.enrolled || 0} capacity={cls.capacity || 50} />

                {/* Action */}
                <div className="mt-auto pt-1">
                  {cls.isEnrolled ? (
                    <Button nativeButton={false} render={<Link href={`/classrooms/?id=${cls.id}`} />} className="h-10 w-full rounded-xl text-[13px]">
                      <LogIn className="h-4 w-4" /> Vào lớp học
                    </Button>
                  ) : (
                    <Button nativeButton={false} variant="outline" render={<Link href={`/classrooms/${cls.id}`} />} className="h-10 w-full rounded-xl gap-2 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10">
                      Xem lớp học <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
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

            {/* Nội dung */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <LogIn className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="m-0 text-lg font-black text-foreground leading-tight tracking-tight">Tham gia lớp học</h3>
                  <p className="m-0 text-xs text-muted-foreground">Nhập mã lớp học</p>
                </div>
              </div>

              <form onSubmit={EnrollCode} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Input
                    autoFocus
                    placeholder="XXX-XXX-XXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="!rounded-2xl uppercase font-bold text-center tracking-wider text-base h-12 bg-slate-100/50 dark:bg-white/5 border-slate-200/70 dark:border-white/10"
                  />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Mã lớp chỉ gồm chữ hoa, số và dấu gạch ngang
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setModal(false); setCode(""); }}
                    className="flex-1 h-11 rounded-xl text-[13px] cursor-pointer"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1 h-11 rounded-xl text-[13px] shadow-lg shadow-primary/20 cursor-pointer"
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