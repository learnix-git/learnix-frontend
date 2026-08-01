"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";
import { TwoColumn } from "@/components/layout/TwoColumn";
import { TutorsSidebar } from "@/components/tutor/TutorsSidebar";
import { Empty } from "@/components/ui/Empty";
import { TutorCard, TutorCardSkeleton } from "@/components/tutor/TutorCard";
import { useAuth } from "@/lib/stores/auth";
import { getSavedPosts } from "@/lib/api/post";
import type { Post } from "@/lib/api/types";
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

// Tính danh sách số trang hiển thị, rút gọn bằng dấu "..." khi quá nhiều trang
function GetPaginationPages(currentPage: number, totalPages: number) {
  const pages: Array<number | "left-ellipsis" | "right-ellipsis"> = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);
  if (currentPage > 4) pages.push("left-ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let page = start; page <= end; page += 1) pages.push(page);

  if (currentPage < totalPages - 3) pages.push("right-ellipsis");
  pages.push(totalPages);

  return pages;
}

export default function SavedTutorsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Trạng thái danh sách gia sư đã lưu
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API lấy danh sách gia sư đã lưu theo trang
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const FetchSavedPosts = async () => {
      setIsLoading(true);
      try {
        const res = await getSavedPosts({ limit: PAGE_SIZE, page: currentPage });
        if (!active) return;
        setSavedPosts(Array.isArray(res.data?.items) ? res.data.items : []);
        setTotal(res.data?.total || 0);
      } catch (error) {
        console.error("Fetch saved posts failed", error);
        if (active) {
          setSavedPosts([]);
          setTotal(0);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    FetchSavedPosts();
    return () => { active = false; };
  }, [authLoading, isAuthenticated, currentPage]);

  // Xóa 1 gia sư khỏi danh sách hiện tại
  const HandleRemove = (postId: string) => {
    const postIndex = savedPosts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotal((prev) => Math.max(0, prev - 1));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginationPages = useMemo(
    () => GetPaginationPages(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Khám phá", href: "/find-tutors" },
    { name: "Gia sư đã lưu", href: "/favorite-tutors" },
  ];

  return (
    <TwoColumn title="Gia sư đã lưu" breadcrumb={breadcrumb} sidebar={<TutorsSidebar />}>
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => <TutorCardSkeleton key={idx} />)}
          </div>
        ) : savedPosts.length === 0 ? (
          <Empty
            icon={<IconSearch size={54} stroke={1.2} />}
            title="Chưa có gia sư nào được lưu"
            description="Hãy khám phá và lưu lại những hồ sơ ấn tượng để dễ dàng mời họ dạy cho bạn."
            action={
              <Link href="/find-tutors">
                <button className="rounded-2xl bg-primary px-6 py-3 mt-4 text-xs font-bold text-white tracking-wider shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02]">
                  TÌM KIẾM GIA SƯ
                </button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-sm font-bold text-foreground">
                Bạn đã lưu <span className="text-primary">{total}</span> hồ sơ gia sư
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {savedPosts.map((post) => (
                <TutorCard key={post.id} post={{ ...post, saved: true }} onBookmark={() => HandleRemove(post.id)} />
              ))}
            </div>

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
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {paginationPages.map((item, index) => {
                      if (item === "left-ellipsis" || item === "right-ellipsis") {
                        return (
                          <PaginationItem key={`${item}-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(item);
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(Math.min(totalPages, currentPage + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </TwoColumn>
  );
}