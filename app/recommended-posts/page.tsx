"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Sparkles } from "lucide-react";

import { TwoColumn } from "@/components/layout/TwoColumn";
import { RequestSidebar } from "@/components/request/RequestSidebar";
import { Empty } from "@/components/ui/Empty";
import { RequestCard } from "@/components/request/RequestCard";
import { useAuth } from "@/lib/stores/auth";
import { getRequests } from "@/lib/api/request";
import type { RequestModel } from "@/lib/api/types";
import { LOGIN_PATH } from "@/lib/auth/session";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";

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

export default function RecommendedPostsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<RequestModel[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Việc làm", href: "/find-posts" },
    { name: "Phù hợp", href: "/recommended-posts" },
  ];

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`${LOGIN_PATH}?callbackUrl=/recommended-posts`);
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getRequests({
          limit: PAGE_SIZE,
          page: currentPage,
          type: "match"
        });
        if (!active) return;
        setJobs(res.data?.items || []);
        setTotal(res.data?.total || 0);
      } catch (error) {
        console.error("Fetch recommended failed", error);
        toast.error("Không thể tải danh sách việc làm");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <TwoColumn
      title="Việc làm phù hợp với bạn"
      breadcrumb={breadcrumb}
      sidebar={<RequestSidebar />}
    >
      <div className="mt-4 flex flex-col gap-3">
        {/* Banner giới thiệu */}
        <div className="rounded-3xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-[16px]">Gợi ý từ hệ thống</h3>
          </div>

          <p className="text-sm text-muted-foreground m-0 leading-relaxed">
            Hệ thống đã tự động phân tích <strong>Hồ sơ Gia sư</strong> của bạn và lọc ra những yêu cầu tìm gia sư có độ tương thích cao nhất về <strong>môn học, địa điểm</strong>. Hãy cập nhật hồ sơ thường xuyên để nhận gợi ý chính xác hơn nhé!
          </p>
        </div>

        {/* Danh sách job */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => (
              <SavedJobSkeleton key={idx} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Empty
            icon={<Search size={54} strokeWidth={1.2} />}
            title="Không tìm thấy việc làm phù hợp"
            description="Thử cập nhật thêm kỹ năng và địa điểm trong hồ sơ của bạn để xem nhiều công việc hơn."
            action={
              <Link href="/gia-su/profile">
                <button className="rounded-2xl bg-primary px-6 py-3 mt-4 text-xs font-bold text-white tracking-wider shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02]">
                  CẬP NHẬT HỒ SƠ
                </button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-sm font-bold text-foreground">
                Hệ thống tìm thấy <span className="text-primary">{total}</span> việc làm phù hợp
              </p>
            </div>

            {jobs.map((job) => (
              <RequestCard
                key={job.id}
                req={job}
                showApplyOnHover={true}
                showReviewOnHover={true}
              />
            ))}

            {totalPages > 1 && (
              <div className="pt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.max(1, currentPage - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={pageNum === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return (
                          <PaginationItem key={pageNum}>
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
                          setCurrentPage(Math.min(totalPages, currentPage + 1));
                        }}
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
