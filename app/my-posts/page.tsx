"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  Calendar,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  LayoutDashboard,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  X,
  FileText
} from "lucide-react";

import { getMyPosts, deletePost, updatePost } from "@/lib/api/post";
import type { Post } from "@/lib/api/types";
import { Cn, FormatMoney } from "@/lib/utils";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";

const BREADCRUMB = [
  { name: "Trang chủ", href: "/" },
  { name: "Quản lý bài đăng", href: "/my-posts" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Mới cập nhật" },
  { id: "oldest", label: "Cũ nhất" },
  { id: "price-desc", label: "Giá cao đến thấp" },
  { id: "price-asc", label: "Giá thấp đến cao" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["id"];
type StatusTab = "all" | "active" | "inactive";

function TooltipHover({ content, children, side = "top" }: { content: string; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent side={side} className="bg-slate-900 text-white font-medium text-[11px] px-2.5 py-1">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  fillRatio,
  stackedBar,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: any;
  accent: "primary" | "emerald" | "amber" | "blue";
  fillRatio?: number;
  stackedBar?: { active: number; inactive: number };
}) {
  const accentMap = {
    primary: { bar: "bg-primary", text: "text-primary", bg: "bg-primary/10" },
    emerald: { bar: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" },
    amber: { bar: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" },
    blue: { bar: "bg-blue-500", text: "text-blue-500", bg: "bg-blue-500/10" },
  } as const;
  const c = accentMap[accent];
  return (
    <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 truncate">
            {label}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
            {value}
          </p>
          {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{hint}</p>}
        </div>
        <div className={Cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", c.bg, c.text)}>
          <Icon size={16} strokeWidth={2.4} />
        </div>
      </div>
      {stackedBar ? (
        <div className="mt-3 flex h-1.5 w-full rounded-full overflow-hidden bg-slate-200/60 dark:bg-white/5">
          {(() => {
            const total = stackedBar.active + stackedBar.inactive;
            if (total === 0) return null;
            const aPct = (stackedBar.active / total) * 100;
            return (
              <>
                <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${aPct}%` }} />
                <div className="bg-amber-500 transition-all duration-500" style={{ width: `${100 - aPct}%` }} />
              </>
            );
          })()}
        </div>
      ) : fillRatio !== undefined ? (
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/60 dark:bg-white/5 overflow-hidden">
          <div
            className={Cn("h-full rounded-full transition-all duration-500", c.bar)}
            style={{ width: `${Math.max(0, Math.min(100, fillRatio * 100))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function StatusDistribution({ active, inactive }: { active: number; inactive: number }) {
  const total = active + inactive;
  if (total === 0) return null;
  const activePct = (active / total) * 100;
  const inactivePct = 100 - activePct;
  return (
    <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl p-4">
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          Phân bố trạng thái
        </p>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">{total} bài đăng</p>
      </div>
      <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-200/60 dark:bg-white/5">
        <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${activePct}%` }} title={`Công khai: ${active}`} />
        <div className="bg-amber-500 transition-all duration-500" style={{ width: `${inactivePct}%` }} title={`Đang ẩn: ${inactive}`} />
      </div>
      <div className="flex items-center justify-between mt-2.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Công khai</span>
          <span className="text-slate-500 dark:text-slate-400 tabular-nums font-medium">{active} · {activePct.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Ẩn</span>
          <span className="text-slate-500 dark:text-slate-400 tabular-nums font-medium">{inactive} · {inactivePct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, count, children, accent }: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode; accent?: "primary" | "emerald" | "amber" }) {
  const activeMap = {
    primary: "border-primary bg-primary text-white shadow-md shadow-primary/20",
    emerald: "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20",
    amber: "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20",
  } as const;
  const inactive = "border-white/50 dark:border-white/10 bg-white/55 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10";
  return (
    <button
      type="button"
      onClick={onClick}
      className={Cn(
        "inline-flex items-center gap-1.5 rounded-full border h-9 px-3.5 text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer",
        active && accent ? activeMap[accent] : active ? activeMap.primary : inactive
      )}
    >
      {children}
      {count !== undefined && (
        <span className={Cn("ml-0.5 text-[10px] font-black tabular-nums rounded-md px-1.5 py-0.5", active ? "bg-white/20 text-white" : "bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-slate-400")}>
          {count}
        </span>
      )}
    </button>
  );
}

function PostRowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b border-white/40 dark:border-white/5 last:border-b-0 animate-pulse">
      <div className="col-span-3 sm:col-span-2 min-w-0">
        <div className="aspect-[4/3] w-full max-w-[88px] rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="col-span-9 sm:col-span-5 space-y-2 min-w-0">
        <div className="flex gap-2">
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-3.5 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="hidden sm:flex col-span-2 flex-col items-end space-y-1.5 min-w-0">
        <div className="h-3 w-12 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-20 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="hidden lg:flex col-span-1 flex-col items-end space-y-1.5 min-w-0">
        <div className="h-3 w-8 rounded bg-slate-200 dark:bg-white/10" />
        <div className="h-4 w-10 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="hidden md:flex col-span-1 items-center gap-1 min-w-0">
        <div className="h-3.5 w-16 rounded bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="col-span-12 sm:col-span-1 flex items-center justify-end gap-1.5 min-w-0">
        <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-white/10" />
        <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-white/10" />
        <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

function PostRow({
  item,
  onEdit,
  onDelete,
  onToggleStatus,
  isTogglingStatus,
}: {
  item: Post;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (item: Post) => void;
  isTogglingStatus: boolean;
}) {
  const isActive = item.status === "OPEN";
  const code = item.id.substring(0, 8);
  const topicsStr = item.topics?.map((t: any) => t.topic?.name || t.custom).join(", ") || "Chưa phân loại";

  return (
    <div
      onClick={() => onEdit(item.id)}
      className={Cn(
        "group grid grid-cols-12 gap-3 items-center px-4 py-3 cursor-pointer",
        "border-b border-white/40 dark:border-white/5 last:border-b-0",
        "hover:bg-primary/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-200"
      )}
    >
      {/* Thumbnail + status dot */}
      <div className="col-span-3 sm:col-span-2 min-w-0">
        <div className="relative aspect-[4/3] w-full max-w-[88px] rounded-xl overflow-hidden border border-white/50 dark:border-white/10 bg-black/5">
          <div className="flex h-full w-full items-center justify-center text-slate-400 bg-white/5">
            <FileText size={20} className="stroke-[1.2] opacity-60" />
          </div>
          <span
            className={Cn(
              "absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900",
              isActive ? "bg-emerald-500" : "bg-amber-500"
            )}
            title={isActive ? "Công khai" : "Đang ẩn"}
          />
        </div>
      </div>

      {/* Title + code + category */}
      <div className="col-span-9 sm:col-span-5 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-slate-900/70 backdrop-blur text-[9px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider border border-white/40 dark:border-white/10 font-mono">
            {code}
          </span>
          <span
            className={Cn(
              "px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border",
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}
          >
            {isActive ? "Công khai" : "Đang ẩn"}
          </span>
        </div>
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {topicsStr}
        </p>
      </div>

      {/* Price */}
      <div className="hidden sm:flex col-span-2 flex-col items-end min-w-0">
        <span className="text-[9px] text-slate-500 font-medium tracking-wide">
          {item.unit === "PER_MONTH" ? "Tháng" : "Buổi"}
        </span>
        <span className="text-[13px] font-black text-purple-500 dark:text-purple-400 tabular-nums">
          {item.from === item.to ? FormatMoney(item.from) : `${FormatMoney(item.from)} - ${FormatMoney(item.to)}`}
        </span>
      </div>

      {/* Views */}
      <div className="hidden lg:flex col-span-1 flex-col items-end min-w-0">
        <span className="text-[9px] text-slate-500 font-medium tracking-wide uppercase">Views</span>
        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">0</span>
      </div>

      {/* Updated */}
      <div className="hidden md:flex col-span-1 items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
        <Calendar size={11} className="shrink-0" />
        <span className="truncate">
          {item.updated ? new Date(item.updated).toLocaleDateString("vi-VN") : "—"}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-12 sm:col-span-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <TooltipHover content={isActive ? "Ẩn bài đăng" : "Hiện bài đăng"} side="top">
          <button
            aria-label={isActive ? "Ẩn bài đăng" : "Hiện bài đăng"}
            disabled={isTogglingStatus}
            onClick={() => onToggleStatus(item)}
            className={Cn(
              "h-7 w-7 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer",
              isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20"
                : "bg-white/5 text-slate-500 border-white/10 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20",
              isTogglingStatus && "opacity-50 cursor-wait"
            )}
          >
            {isTogglingStatus ? <Loader2 size={12} className="animate-spin" /> : isActive ? <Eye size={12} strokeWidth={2.2} /> : <EyeOff size={12} strokeWidth={2.2} />}
          </button>
        </TooltipHover>
        <TooltipHover content="Chỉnh sửa" side="top">
          <button
            aria-label="Chỉnh sửa"
            onClick={() => onEdit(item.id)}
            className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-purple-400 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all cursor-pointer"
          >
            <Edit2 size={12} strokeWidth={2.2} />
          </button>
        </TooltipHover>
        <TooltipHover content="Xóa" side="top">
          <button
            aria-label="Xóa"
            onClick={() => onDelete(item.id)}
            className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 flex items-center justify-center transition-all cursor-pointer"
          >
            <Trash2 size={12} strokeWidth={2.2} />
          </button>
        </TooltipHover>
      </div>
    </div>
  );
}

export default function MyPostsPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; OPEN: number; HOLD: number }>({ total: 0, OPEN: 0, HOLD: 0 });

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, sortKey]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusTab === "all" ? undefined : statusTab === "active" ? "OPEN" : "HOLD";
      const res = await getMyPosts({
        page,
        limit: PAGE_SIZE,
        search: debouncedKeyword || undefined,
        status: statusParam,
        sort: sortKey,
      });
      setPosts(res.data?.items || []);
      setTotal(res.data?.total || 0);
      if (res.data?.stats) {
        setStats({
          total: (res.data.stats.OPEN || 0) + (res.data.stats.HOLD || 0),
          OPEN: res.data.stats.OPEN || 0,
          HOLD: res.data.stats.HOLD || 0
        });
      }
    } catch (err) {
      toast.error("Không thể tải danh sách bài đăng");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedKeyword, statusTab, sortKey]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleToggleStatus = useCallback(async (item: Post) => {
    const nextStatus = item.status === "OPEN" ? "HOLD" : "OPEN";
    setTogglingId(item.id);
    try {
      await updatePost(item.id, { status: nextStatus } as any);
      toast.success(nextStatus === "OPEN" ? "Đã hiện bài đăng" : "Đã ẩn bài đăng");
      await fetchPosts();
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setTogglingId(null);
    }
  }, [fetchPosts]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá bài đăng này?")) {
      try {
        await deletePost(id);
        toast.success("Xoá bài đăng thành công!");
        await fetchPosts();
      } catch (err) {
        toast.error("Không thể xoá bài đăng");
      }
    }
  }, [fetchPosts]);

  const isEmpty = !loading && stats.total === 0;
  const isFilterEmpty = !loading && stats.total > 0 && posts.length === 0;
  const activeRatio = stats.total > 0 ? stats.OPEN / stats.total : 0;

  return (
    <div className="min-h-screen bg-transparent pb-28">
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8">
          <BreadcrumbComponent pathList={BREADCRUMB} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                <LayoutDashboard size={12} />
                <span>Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Quản lý bài đăng
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Theo dõi và tối ưu các bài đăng tìm học sinh của bạn.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/profile")} className="rounded-xl h-10 px-4 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all font-bold text-[11px] tracking-widest">
                HỒ SƠ
              </Button>
              <Button onClick={() => router.push("/tutor-post")} className="rounded-xl h-10 px-5 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-[11px] tracking-widest transition-all hover:scale-[1.02]">
                <Plus size={14} className="mr-1.5" />
                TẠO BÀI ĐĂNG MỚI
              </Button>
            </div>
          </div>

          {!isEmpty && (
            <div className="flex items-center gap-2 px-4 bg-white/55 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-2xl rounded-2xl h-12 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm theo tên, mô tả hoặc mã bài đăng…"
                className="flex-1 min-w-0 bg-transparent text-sm font-medium placeholder:text-muted-foreground outline-none"
              />
              {searchKeyword && (
                <button type="button" onClick={() => setSearchKeyword("")} className="h-6 w-6 rounded-full hover:bg-slate-200/60 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 cursor-pointer shrink-0">
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && stats.total > 0 && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-4">
            <KpiCard label="Tổng bài đăng" value={stats.total} hint={`${stats.OPEN} công khai · ${stats.HOLD} đang ẩn`} icon={Package} accent="primary" stackedBar={{ active: stats.OPEN, inactive: stats.HOLD }} />
            <KpiCard label="Đang công khai" value={stats.OPEN} hint={`${(activeRatio * 100).toFixed(0)}% tổng số`} icon={Eye} accent="emerald" fillRatio={activeRatio} />
            <KpiCard label="Đang ẩn" value={stats.HOLD} hint={`${(100 - activeRatio * 100).toFixed(0)}% tổng số`} icon={EyeOff} accent="amber" fillRatio={1 - activeRatio} />
          </div>
        )}

        {!loading && stats.total > 0 && (
          <div className="mb-6">
            <StatusDistribution active={stats.OPEN} inactive={stats.HOLD} />
          </div>
        )}

        {!isEmpty && !loading && (
          <Card className="p-3 mb-4 border-white/60 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar -mx-1 px-1">
                <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
                <FilterChip active={statusTab === "all"} onClick={() => setStatusTab("all")} count={stats.total} accent="primary">Tất cả</FilterChip>
                <FilterChip active={statusTab === "active"} onClick={() => setStatusTab("active")} count={stats.OPEN} accent="emerald"><Eye size={11} strokeWidth={2.5} /> Công khai</FilterChip>
                <FilterChip active={statusTab === "inactive"} onClick={() => setStatusTab("inactive")} count={stats.HOLD} accent="amber"><EyeOff size={11} strokeWidth={2.5} /> Đang ẩn</FilterChip>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">Sắp xếp:</span>
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                  <SelectTrigger className="w-[180px] h-10 px-4 rounded-2xl border border-white/50 dark:border-white/10 bg-white/55 dark:bg-white/5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-white/10 shadow-sm backdrop-blur-md">
                    <SelectValue placeholder="Sắp xếp theo">{SORT_OPTIONS.find((opt) => opt.id === sortKey)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent align="end" className="min-w-[200px]">
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="whitespace-nowrap">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/50 bg-white/10 dark:bg-black/10">
            <Package size={40} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">Bạn chưa có bài đăng nào</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">Đăng bài tuyển sinh để học viên có thể tìm thấy và thuê bạn dễ dàng.</p>
            <Button onClick={() => router.push("/tutor-post")} className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs tracking-widest transition-all">
              <Plus size={16} className="mr-2" /> Tạo bài đăng đầu tiên
            </Button>
          </div>
        )}

        {isFilterEmpty && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/50 bg-white/10 dark:bg-black/10 mt-6">
            <Package size={36} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold mb-2">Không tìm thấy bài đăng phù hợp</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">Thử đổi bộ lọc hoặc xoá từ khoá tìm kiếm.</p>
            <Button onClick={() => { setSearchKeyword(""); setStatusTab("all"); }} className="rounded-2xl h-11 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs tracking-widest">
              XOÁ BỘ LỘC
            </Button>
          </div>
        )}

        {!isEmpty && !isFilterEmpty && (
          <Card className="p-0 border-white/60 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
              <div className="col-span-2">Ảnh</div>
              <div className="col-span-5">Bài đăng</div>
              <div className="col-span-2 text-right">Học phí</div>
              <div className="col-span-1 text-right hidden lg:block">Views</div>
              <div className="col-span-1 hidden md:block">Cập nhật</div>
              <div className="col-span-1 text-right">Thao tác</div>
            </div>
            <div>
              {loading
                ? Array.from({ length: Math.min(PAGE_SIZE, stats.total || 5) }).map((_, idx) => <PostRowSkeleton key={idx} />)
                : posts.map((item) => (
                    <PostRow
                      key={item.id}
                      item={item}
                      onEdit={(id) => router.push(`/tutor-post/${id}`)}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      isTogglingStatus={togglingId === item.id}
                    />
                  ))}
            </div>
          </Card>
        )}

        {!isEmpty && !isFilterEmpty && !loading && totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink href="#" isActive={pageNum === page} onClick={(e) => { e.preventDefault(); setPage(pageNum); }} className="cursor-pointer">{pageNum}</PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (pageNum === page - 2 || pageNum === page + 2) {
                    return <PaginationItem key={pageNum}><PaginationEllipsis /></PaginationItem>;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
