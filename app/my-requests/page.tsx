"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Eye,
  FolderOpen,
  Lock,
  MapPin,
  PlusCircle,
  Search,
  SearchX,
  Tag,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { getMyRequests } from "@/lib/api/request";
import type { RequestModel } from "@/lib/api/types";
import { Cn, FormatMoney } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
// import { EmptyState } from "@/components/ui/EmptyState";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";

const PAGE_SIZE = 10;
const ALL_TAB = "all" as const;
type TabValue = typeof ALL_TAB | string;

const sortOptions = [
  { label: "Mới nhất", value: "newest" },
  { label: "Học phí cao nhất", value: "highest_price" },
];

type MyRequestSortBy = (typeof sortOptions)[number]["value"];

// All status from database
const STATUS_PALETTE: Record<string, { dot: string; badge: string; ring: string; label: string }> = {
  PENDING: { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20", ring: "ring-amber-500/40", label: "Chờ duyệt" },
  VERIFIED: { dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 border border-emerald-400/20", ring: "ring-emerald-400/40", label: "Đã xác thực" },
  REJECTED: { dot: "bg-rose-500", badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20", ring: "ring-rose-500/40", label: "Từ chối" },
  OPEN: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20", ring: "ring-emerald-500/40", label: "Đang tìm gia sư" },
  ACTIVE: { dot: "bg-blue-500", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20", ring: "ring-blue-500/40", label: "Đang học" },
  DONE: { dot: "bg-indigo-500", badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20", ring: "ring-indigo-500/40", label: "Hoàn thành" },
  FAILED: { dot: "bg-red-500", badge: "bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20", ring: "ring-red-500/40", label: "Thất bại" },
  CANCEL: { dot: "bg-slate-400", badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20", ring: "ring-slate-400/40", label: "Đã hủy" },
  HOLD: { dot: "bg-orange-500", badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20", ring: "ring-orange-500/40", label: "Tạm ngưng" },
  RELEASE: { dot: "bg-cyan-500", badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20", ring: "ring-cyan-500/40", label: "Phát hành" },
};

const DEFAULT_PALETTE = {
  dot: "bg-slate-400",
  badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20",
  ring: "ring-slate-400/40",
  label: "Không rõ",
};

function paletteFor(status: string) {
  return STATUS_PALETTE[status] ?? DEFAULT_PALETTE;
}

function formatDate(date?: string | null) {
  if (!date) return "Chưa cập nhật";
  const normalized = date.includes(" ") ? date.replace(" ", "T") : date;
  const parsedDate = new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) return date.split(" ")[0] || date;
  return parsedDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusCount(stats: Record<string, number> | null, statusCode: string): number {
  if (!stats) return 0;
  return stats[statusCode] || 0;
}

function RequestSkeleton() {
  return (
    <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/45 dark:bg-white/5 p-5 shadow-lg shadow-slate-200/50 dark:shadow-none">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  icon,
  dotClass,
}: {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  dotClass?: string;
}) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/55 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="space-y-0.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-black tabular-nums text-foreground">
          {value}
        </div>
      </div>
      {icon ? (
        icon
      ) : dotClass ? (
        <span className={Cn("h-2.5 w-2.5 rounded-full", dotClass)} />
      ) : null}
    </div>
  );
}

export default function MyRequestsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>(ALL_TAB);
  const [requests, setRequests] = useState<RequestModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<MyRequestSortBy>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyRequests({
        limit: PAGE_SIZE,
        page,
        sort: sortBy as any,
        status: activeTab === ALL_TAB ? undefined : activeTab,
        search: searchQuery || undefined,
      });

      if (res.code === 200 && res.data) {
        setRequests(res.data.items);
        setTotal(res.data.total);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        toast.error((res as any).message || "Không thể tải danh sách bài đăng");
      }
    } catch (error: any) {
      console.error("Fetch requests failed", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Đã xảy ra lỗi";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, sortBy, searchQuery]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Bài đăng của tôi", href: "/my-requests" },
  ];

  const tabStatuses = Object.keys(STATUS_PALETTE).map(key => ({
    id: key,
    title: STATUS_PALETTE[key].label
  }));

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* ═══ BREADCRUMB ═══ */}
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <BreadcrumbComponent pathList={breadcrumb} />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* ═══ HEADER ═══ */}
        <div className="mb-8">
          <div className="flex flex-row items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-primary" />
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Bài đăng của tôi</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/60 bg-white/50 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Bảng điều khiển bài đăng
                </div>
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                    Quản lý bài đăng tìm gia sư
                  </h2>
                  <p className="m-0 max-w-[66ch] text-[14px] leading-6 text-muted-foreground">
                    Theo dõi trạng thái các bài đăng tìm gia sư, dễ dàng quản lý quá trình kết nối với gia sư phù hợp.
                  </p>
                </div>
              </div>

              <Button
                render={<Link href="/client-post" className="w-full sm:w-auto" />}
                nativeButton={false}
                className="h-11 w-full rounded-2xl px-5 text-[13px] font-bold shadow-lg shadow-primary/20 sm:w-auto"
              >
                <PlusCircle className="h-4 w-4" />
                Đăng bài tuyển gia sư
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10">
              <KpiCell
                label="Tổng bài đăng"
                value={stats?.totalRequests ?? total}
                icon={<FolderOpen className="h-4 w-4 text-primary" />}
              />
              <KpiCell
                label="Đang tìm gia sư"
                value={getStatusCount(stats, "OPEN")}
                dotClass="bg-emerald-500"
              />
              <KpiCell
                label="Chờ duyệt"
                value={getStatusCount(stats, "PENDING")}
                dotClass="bg-amber-500"
              />
              <KpiCell
                label="Đang học"
                value={getStatusCount(stats, "ACTIVE")}
                dotClass="bg-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Trạng thái bài đăng
            </h3>
            <div
              role="tablist"
              aria-label="Trạng thái"
              className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-slate-200/70 dark:border-white/10"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === ALL_TAB}
                onClick={() => {
                  setActiveTab(ALL_TAB);
                  setPage(1);
                }}
                className={Cn(
                  "relative flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer",
                  activeTab === ALL_TAB
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                Tất cả
                <span
                  className={Cn(
                    "min-w-[24px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums",
                    activeTab === ALL_TAB
                      ? "bg-primary/15 text-primary"
                      : "bg-slate-200/70 text-muted-foreground dark:bg-white/10"
                  )}
                >
                  {stats?.totalRequests ?? total}
                </span>
                {activeTab === ALL_TAB && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>

              {tabStatuses.map((status) => {
                const palette = paletteFor(status.id);
                const isActive = activeTab === status.id;
                const count = getStatusCount(stats, status.id);
                
                if (count === 0 && !["OPEN", "PENDING", "ACTIVE", "DONE", "CANCEL", "REJECTED"].includes(status.id)) return null;

                return (
                  <button
                    key={status.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveTab(status.id);
                      setPage(1);
                    }}
                    className={Cn(
                      "relative flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className={Cn("h-2 w-2 shrink-0 rounded-full", palette.dot)} />
                    {status.title}
                    <span
                      className={Cn(
                        "min-w-[24px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums",
                        isActive
                          ? "bg-primary/15 text-primary"
                          : "bg-slate-200/70 text-muted-foreground dark:bg-white/10"
                      )}
                    >
                      {count}
                    </span>
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/45 p-3 shadow-lg shadow-slate-200/50 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài đăng..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white/70 pl-10 pr-4 text-[13px] font-medium shadow-none transition-all hover:border-primary/30 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5"
                />
              </div>
              <div className="flex sm:justify-end lg:col-start-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => value && setSortBy(value as MyRequestSortBy)}
                >
                  <SelectTrigger className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white/70 text-[13px] font-bold shadow-none transition-all hover:border-primary/30 focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 sm:w-[220px]">
                    <SelectValue placeholder="Sắp xếp">
                      {sortOptions.find((o) => o.value === sortBy)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-white/60 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="py-2.5 text-[13px] font-medium">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-1">
            <p className="m-0 text-[13px] font-medium text-muted-foreground">
              {loading ? "Đang tải dữ liệu..." : `Hiển thị ${requests.length} trong ${total} bài đăng`}
            </p>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => <RequestSkeleton key={index} />)
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 py-16 dark:border-white/10 dark:bg-white/5">
                <SearchX size={48} strokeWidth={1.5} className="mb-4 text-slate-400" />
                <h3 className="mb-2 text-lg font-bold text-foreground">Không tìm thấy bài đăng</h3>
                <p className="mb-6 max-w-sm text-center text-[14px] text-muted-foreground">Bạn chưa có bài đăng nào khớp với trạng thái hiện tại.</p>
                <Button
                  render={<Link href="/client-post" />}
                  nativeButton={false}
                  className="h-11 rounded-2xl px-5 text-[13px] font-bold"
                >
                  <PlusCircle className="h-4 w-4" />
                  Đăng bài
                </Button>
              </div>
            ) : (
              requests.map((request) => {
                const palette = paletteFor(request.status);
                const gradesText = request.grades?.length ? `Lớp ${request.grades.join(", ")}` : "";
                const levelText = request.level === "ALL" ? "" : request.level;
                const classLevelText = [gradesText, levelText].filter(Boolean).join(" - ") || "Tất cả trình độ";

                return (
                  <article
                    key={request.id}
                    className="group rounded-3xl border border-white/60 bg-white/55 p-4 shadow-lg shadow-slate-200/55 backdrop-blur-2xl transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/75 hover:shadow-xl hover:shadow-primary/10 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10 sm:p-5"
                  >
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="min-w-0 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={Cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                              palette.badge
                            )}
                          >
                            <span className={Cn("h-1.5 w-1.5 rounded-full", palette.dot)} />
                            {palette.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-muted-foreground dark:bg-white/5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(request.created)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Link href={`/my-requests/${request.alias || request.id}`} className="block w-fit max-w-full">
                            <h3 className="m-0 line-clamp-2 text-lg font-black leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                              {request.title}
                            </h3>
                          </Link>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
                              <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                              Trình độ
                            </div>
                            <div className="mt-1 truncate text-[13px] font-bold text-foreground" title={classLevelText}>
                              {classLevelText}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
                              <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                              Học phí
                            </div>
                            <div className="mt-1 truncate text-[13px] font-bold text-foreground">
                              {FormatMoney(Number(request.from))} - {FormatMoney(Number(request.to))}/{request.unit === "PER_SESSION" ? "buổi" : "tháng"}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                            <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
                              {request.mode === "ONLINE" ? (
                                <>
                                  <BriefcaseBusiness className="h-3.5 w-3.5 text-blue-500" />
                                  Hình thức
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                  Khu vực
                                </>
                              )}
                            </div>
                            <div className="mt-1 truncate text-[13px] font-bold text-foreground">
                              {request.mode === "ONLINE" ? "Online" : (request.city || "Toàn quốc")}
                            </div>
                          </div>
                        </div>

                        {request.topics && request.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {request.topics.slice(0, 8).map((t) => (
                              <Badge key={t.id} variant="secondary" className="cursor-pointer text-[11px]">
                                {t.topic?.name || t.custom}
                              </Badge>
                            ))}
                            {request.topics.length > 8 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <button
                                        type="button"
                                        className="cursor-pointer rounded-full border-none bg-transparent p-0 transition-all hover:opacity-80"
                                      >
                                        <Badge variant="outline" className="text-[11px] font-medium text-muted-foreground hover:bg-slate-100">
                                          +{request.topics.length - 8}
                                        </Badge>
                                      </button>
                                    }
                                  />
                                  <TooltipContent
                                    side="top"
                                    align="start"
                                    className="max-w-[360px] rounded-2xl border border-border bg-card px-4 py-4 text-foreground shadow-2xl"
                                    arrowClassName="bg-card fill-card"
                                  >
                                    <div className="flex max-w-sm flex-wrap gap-2">
                                      {request.topics.slice(8).map((t) => (
                                        <Badge key={t.id} variant="secondary" className="cursor-pointer text-[11px]">
                                          {t.topic?.name || t.custom}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              Ứng tuyển
                            </div>
                            <div className="mt-1 text-2xl font-black text-foreground">0</div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                              <Eye className="h-3.5 w-3.5" />
                              Lượt xem
                            </div>
                            <div className="mt-1 text-2xl font-black text-foreground">0</div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Link href={`/my-requests/${request.alias || request.id}`}>
                            <Button className="h-10 w-full rounded-xl text-[13px] font-bold">
                              Quản lý
                            </Button>
                          </Link>
                          <Link href={`/requests/${request.id}`}>
                            <Button
                              variant="outline"
                              className="h-10 w-full rounded-xl border-slate-200 bg-white/70 text-[13px] font-bold hover:border-primary/30 dark:border-white/10 dark:bg-white/5"
                            >
                              Xem tin đăng
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="border-t border-slate-200/70 pt-6 dark:border-white/10">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(Math.max(1, page - 1));
                      }}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;

                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= page - 1 && pageNumber <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === page}
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(pageNumber);
                            }}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    if (pageNumber === page - 2 || pageNumber === page + 2) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(Math.min(totalPages, page + 1));
                      }}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
