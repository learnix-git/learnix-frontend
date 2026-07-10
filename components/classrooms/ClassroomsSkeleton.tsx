"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ClassroomsSkeleton() {
  return (
    <Card className="!p-4 sm:!p-5 !rounded-3xl flex flex-col gap-4 h-full border-slate-200/60 dark:border-white/5">
      {/* Trạng thái & Khối lớp */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Tiêu đề & Mã lớp */}
      <div className="space-y-2.5">
        <Skeleton className="h-5 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>

      {/* Mô tả */}
      <div className="space-y-2 flex-grow mt-2">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-5/6 rounded-md" />
        <Skeleton className="h-3.5 w-4/6 rounded-md" />
      </div>

      {/* Giảng viên & Nhãn */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <Skeleton className="h-4 w-12 rounded-md shrink-0" />
      </div>

      {/* Học phí */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 px-3 py-3 dark:border-white/5 dark:bg-white/5">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-md" />
      </div>

      {/* Thanh tiến trình sĩ số */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Nút hành động */}
      <Skeleton className="h-10 w-full rounded-xl mt-1" />
    </Card>
  );
}