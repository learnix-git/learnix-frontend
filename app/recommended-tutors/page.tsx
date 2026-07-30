"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Sparkles } from "lucide-react";

import { TwoColumn } from "@/components/layout/TwoColumn";
import { TutorsSidebar } from "@/components/tutor/TutorsSidebar";
import { Empty } from "@/components/ui/Empty";
import { TutorCardSkeleton, TutorCard } from "@/components/tutor/TutorCard";
import { useAuth } from "@/lib/stores/auth";
import { getPosts } from "@/lib/api/post";
import type { Post } from "@/lib/api/types";
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

export default function RecommendedTutorsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Thuê gia sư", href: "/find-tutors" },
    { name: "Phù hợp", href: "/recommended-tutors" },
  ];

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`${LOGIN_PATH}?callbackUrl=/recommended-tutors`);
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await getPosts({
          limit: PAGE_SIZE,
          page: currentPage,
        });
        if (!active) return;
        setPosts(res.data?.items || []);
        setTotal(res.data?.total || 0);
      } catch (error) {
        console.error("Fetch recommended failed", error);
        toast.error("Không thể tải danh sách gia sư");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, currentPage]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <TwoColumn
      title="Gia sư phù hợp với bạn"
      breadcrumb={breadcrumb}
      sidebar={<TutorsSidebar />}
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
            Hệ thống đã tự động phân tích <strong>Bài đăng tìm gia sư (Yêu cầu học)</strong> của bạn và lọc ra những gia sư có độ tương thích cao nhất về <strong>môn học, địa điểm</strong>. Hãy cập nhật hồ sơ thường xuyên để nhận gợi ý chính xác hơn nhé!
          </p>
        </div>

        {/* Danh sách post */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => (
              <TutorCardSkeleton key={idx} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Empty
            icon={<Search size={54} strokeWidth={1.2} />}
            title="Không tìm thấy gia sư phù hợp"
            description="Thử cập nhật thêm kỹ năng và địa điểm trong hồ sơ của bạn để xem nhiều công việc hơn."
            action={
              <Link href="/client-post">
                <button className="rounded-2xl bg-primary px-6 py-3 mt-4 text-xs font-bold text-white tracking-wider shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02]">
                  CẬP NHẬT YÊU CẦU
                </button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-sm font-bold text-foreground">
                Hệ thống tìm thấy <span className="text-primary">{total}</span> gia sư phù hợp
              </p>
            </div>

            {posts.map((post) => (
              <TutorCard
                key={post.id}
                post={post}
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
