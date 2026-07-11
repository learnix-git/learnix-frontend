"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ClassroomsSkeleton() {
  return (
    <Card className="!p-5 sm:!p-6 !rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-200/80 dark:border-white/10 w-full">
      <div className="flex-1 min-w-0 space-y-3.5 w-full">
        {/* Avatar + tên GV + trạng thái + khối lớp */}
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Tiêu đề & mã lớp */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-32 rounded-md" />
        </div>

        {/* Mô tả */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
        </div>

        {/* Tags: học phí, khu vực, đánh giá */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col justify-between items-stretch gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 md:pl-6 md:border-l md:border-slate-200/60 md:dark:border-white/10 md:w-[240px] w-full">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </Card>
  );
}