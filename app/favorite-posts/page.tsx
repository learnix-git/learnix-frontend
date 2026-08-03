"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { TwoColumn } from "@/components/layout/TwoColumn";
import { RequestSidebar } from "@/components/request/RequestSidebar";
import { Empty } from "@/components/ui/Empty";
import { RequestCard } from "@/components/request/RequestCard";
import { useAuth } from "@/lib/stores/auth";
import { getSavedRequests } from "@/lib/api/request";
import type { RequestModel } from "@/lib/api/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import { LOGIN_PATH } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";

const PAGE_SIZE = 10;

function SavedJobSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-white/[0.03] border border-white/80 dark:border-white/10 rounded-[28px] p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">

        {/* Avatar */}
        <div className="shrink-0 w-[48px] h-[48px] rounded-full bg-slate-200/80 dark:bg-white/10" />

        {/* Title & Info */}
        <div className="flex-1 min-w-0 py-1 space-y-3">
          <div className="h-4 w-[85%] rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="h-3 w-48 rounded-full bg-slate-200/60 dark:bg-white/5" />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block w-24 h-10 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
          <div className="w-10 h-10 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded-full bg-slate-200/50 dark:bg-white/5" />
        <div className="h-3 w-[90%] rounded-full bg-slate-200/50 dark:bg-white/5" />
      </div>

      {/* Meta Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="h-8 w-32 rounded-full bg-slate-200/70 dark:bg-white/10" />
        <div className="h-8 w-24 rounded-full bg-slate-200/60 dark:bg-white/5" />
        <div className="h-8 w-28 rounded-full bg-slate-200/60 dark:bg-white/5" />
        <div className="h-8 w-32 rounded-full bg-slate-200/60 dark:bg-white/5" />
      </div>

      {/* Subjects */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-7 w-20 rounded-xl bg-slate-200/50 dark:bg-white/5" />
        <div className="h-7 w-16 rounded-xl bg-slate-200/50 dark:bg-white/5" />
        <div className="h-7 w-24 rounded-xl bg-slate-200/50 dark:bg-white/5" />
      </div>
    </div>
  );
}

export default function FavoritePostsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Trạng thái danh sách việc làm đã lưu
  const [jobs, setJobs] = useState<RequestModel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Việc làm đang được hover để hiển thị preview
  const [hoveredJob, setHoveredJob] = useState<RequestModel | null>(null);

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Việc làm", href: "/find-posts" },
    { name: "Đã lưu", href: "/favorite-posts" },
  ];

  // Chặn truy cập nếu chưa đăng nhập
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`${LOGIN_PATH}?callbackUrl=/favorite-posts`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Gọi API lấy danh sách việc làm đã lưu theo trang
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;

    const FetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await getSavedRequests({ limit: PAGE_SIZE, page: currentPage });
        if (!active) return;

        const items = res.data?.items || [];
        const totalCount = res.data?.total || 0;

        setJobs(items);
        setTotal(totalCount);
        if (items.length > 0) setHoveredJob(items[0]);
      } catch (error) {
        console.error("Lấy danh sách việc làm đã lưu thất bại", error);
        if (!active) return;
        toast.error("Không thể tải danh sách việc làm đã lưu");
        setJobs([]);
        setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    };

    FetchWishlist();
    return () => { active = false; };
  }, [authLoading, isAuthenticated, currentPage]);

  const HandleRemove = (jobId: string) => {
    const jobIndex = jobs.findIndex((j) => j.id === jobId);
    if (jobIndex === -1) return;

    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    setTotal((prev) => Math.max(0, prev - 1));
    if (hoveredJob?.id === jobId) setHoveredJob(null);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <TwoColumn title="Danh sách việc làm đã lưu" breadcrumb={breadcrumb} sidebar={<RequestSidebar />}>
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => <SavedJobSkeleton key={idx} />)}
          </div>
        ) : jobs.length === 0 ? (
          <Empty
            icon={<Search size={54} strokeWidth={1.2} />}
            title="Bạn chưa lưu việc làm nào"
            description="Hãy quay lại trang tìm việc và lưu những dự án bạn quan tâm."
            action={
              <Link href="/tim-lop-hoc">
                <Button className="rounded-xl shadow-lg mt-4">Tìm việc ngay</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <RequestCard
                key={job.id}
                req={{ ...job, saved: true }}
                onBookmark={() => HandleRemove(job.id)}
                showReviewOnHover={true}
                showApplyOnHover={true}
              />
            ))}

            {totalPages > 1 && (
              <div className="pt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1} className="cursor-pointer">
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </TwoColumn>
  );
}