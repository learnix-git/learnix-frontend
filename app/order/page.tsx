"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Loader2,
  Package,
  XCircle,
  Search,
  X,
  CreditCard,
  Eye,
  MessageSquare,
  GraduationCap,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { Empty } from "@/components/ui/Empty";
import { Avatar } from "@/components/ui/Avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";

import { useAuth } from "@/lib/stores/auth";
import { Cn } from "@/lib/utils";
import {
  getStudentContracts,
  getTutorContracts,
  type Contract,
  type ContractStatus,
  CONTRACT_STATUS_META,
} from "@/lib/api/contract";
import {
  studentDeposit,
  tutorDeposit,
  formatCurrency,
} from "@/lib/api/payment";

const PAGE_SIZE = 10;

import { OrderStats } from "@/components/order/OrderStats";
import { OrderTabs, type StatusFilter } from "@/components/order/OrderTabs";
import { OrderCard } from "@/components/order/OrderCard";
import { OrderSkeleton } from "@/components/order/OrderSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER PAGE — Main list of contracts for students and tutors
// ─────────────────────────────────────────────────────────────────────────────

const breadcrumb = [
  { name: "Trang chủ", href: "/" },
  { name: "Quản lý đơn hàng", href: "/order" },
];

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // URL state
  const [activeTab, setActiveTab] = useState<"student" | "tutor">(
    searchParams.get("tab") === "tutor" ? "tutor" : "student"
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get("status") as StatusFilter) || "all"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  // Data
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/dang-nhap?callbackUrl=/order");
    }
  }, [authLoading, isAuthenticated, router]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch
  const fetchContracts = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const data =
        activeTab === "student"
          ? await getStudentContracts()
          : await getTutorContracts();
      setContracts(data);
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      toast.error(err?.response?.data?.message || "Không thể tải danh sách hợp đồng");
      setContracts([]);
    } finally {
      if (!abortRef.current?.signal.aborted) setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchContracts();
    return () => abortRef.current?.abort();
  }, [fetchContracts]);

  // Handlers
  const handleTabChange = (tab: "student" | "tutor") => {
    setActiveTab(tab);
    setStatusFilter("all");
    setSearch("");
    setCurrentPage(1);
  };

  const handleResetAll = () => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
    setDebouncedSearch("");
  };

  const handleViewDetails = (code: string) => router.push(`/order/${code}`);

  // Client-side filter + search
  const filtered = useMemo(() => {
    let result = contracts;
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.teacher.account.name.toLowerCase().includes(q) ||
          c.student.account.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [contracts, statusFilter, debouncedSearch]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Breadcrumb */}
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <BreadcrumbComponent pathList={breadcrumb} />
        </div>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/15 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/8 dark:bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-400/8 dark:bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-[130px] opacity-40 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-200/50 dark:border-white/5">
          <div className="flex flex-row items-center gap-3">
            <div className="h-10 w-1.5 shrink-0 rounded-full bg-primary" />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Quản lý đơn hàng
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Theo dõi, quản lý tiến độ học tập và thanh toán các hợp đồng của bạn trên Learnix.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {activeTab === "student" ? (
              <Link
                href="/tim-gia-su"
                className="inline-flex items-center gap-2 rounded-2xl h-11 px-6 font-bold text-xs tracking-widest shadow-md bg-primary text-white hover:bg-primary/90 transition-all"
              >
                <GraduationCap className="h-4 w-4" />
                TÌM GIA SƯ MỚI
              </Link>
            ) : (
              <Link
                href="/my-posts"
                className="inline-flex items-center gap-2 rounded-2xl h-11 px-6 font-bold text-xs tracking-widest shadow-md bg-primary text-white hover:bg-primary/90 transition-all"
              >
                <Users className="h-4 w-4" />
                BÀI ĐĂNG CỦA TÔI
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex p-1.5 rounded-2xl border border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-sm">
            <button
              onClick={() => handleTabChange("student")}
              className={Cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs tracking-widest transition-all cursor-pointer border-none",
                activeTab === "student"
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/5"
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              ĐƠN THUÊ (HỌC SINH)
            </button>
            <button
              onClick={() => handleTabChange("tutor")}
              className={Cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs tracking-widest transition-all cursor-pointer border-none",
                activeTab === "tutor"
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/5"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              ĐƠN NHẬN (GIA SƯ)
            </button>
          </div>

          {/* ── HEADER & KPI ── */}
          <div className="space-y-5">
            <OrderStats contracts={contracts} tab={activeTab} />
          </div>

          {/* ── FILTERS ── */}
          <OrderTabs
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onResetAll={handleResetAll}
          />

          {/* ── LIST ── */}
          <div className="space-y-4">
            {loading && contracts.length === 0 ? (
              <OrderSkeleton />
            ) : contracts.length === 0 ? (
              <Empty
                variant="search"
                icon={
                  <ShoppingBag
                    size={54}
                    strokeWidth={1.2}
                    className="text-slate-400"
                  />
                }
                title="Không tìm thấy hợp đồng"
                description={
                  search || statusFilter !== "all"
                    ? "Không có hợp đồng nào khớp với bộ lọc. Thử thay đổi điều kiện tìm kiếm."
                    : activeTab === "student"
                    ? "Bạn chưa có hợp đồng thuê gia sư nào. Tìm gia sư phù hợp và bắt đầu học ngay!"
                    : "Bạn chưa nhận được hợp đồng nào. Hoàn thiện hồ sơ để học sinh tìm thấy bạn!"
                }
                action={
                  search || statusFilter !== "all" ? (
                    <button
                      onClick={handleResetAll}
                      className="inline-flex items-center gap-2 rounded-2xl h-11 px-6 font-bold text-xs tracking-widest border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
                    >
                      XOÁ BỘ LỌC
                    </button>
                  ) : activeTab === "student" ? (
                    <Link
                      href="/tim-gia-su"
                      className="inline-flex items-center gap-2 rounded-2xl h-11 px-6 font-bold text-xs tracking-widest bg-primary text-white shadow-md hover:bg-primary/90 transition-all"
                    >
                      TÌM GIA SƯ NGAY
                    </Link>
                  ) : (
                    <Link
                      href="/my-posts"
                      className="inline-flex items-center gap-2 rounded-2xl h-11 px-6 font-bold text-xs tracking-widest bg-primary text-white shadow-md hover:bg-primary/90 transition-all"
                    >
                      QUẢN LÝ BÀI ĐĂNG
                    </Link>
                  )
                }
              />
            ) : (
              <>
                <div className="space-y-3">
                  {paginated.map((c) => (
                    <OrderCard
                      key={c.id}
                      contract={c}
                      role={activeTab}
                      onView={handleViewDetails}
                      onRefresh={fetchContracts}
                    />
                  ))}
                  {loading && contracts.length > 0 && <OrderSkeleton />}
                </div>

                {totalPages > 1 && (
                  <Pagination className="pt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((p) => Math.max(1, p - 1));
                          }}
                          className={
                            currentPage === 1 ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pg = i + 1;
                        if (
                          pg === 1 ||
                          pg === totalPages ||
                          (pg >= currentPage - 1 && pg <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pg}>
                              <PaginationLink
                                href="#"
                                isActive={pg === currentPage}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(pg);
                                }}
                              >
                                {pg}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        if (pg === currentPage - 2 || pg === currentPage + 2) {
                          return (
                            <PaginationItem key={pg}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
