"use client";

import { Users, BookOpen, Video } from "lucide-react";

interface CoursesProgressProps {
  current?: number;       // Số học viên
  chaptersCount?: number; // Số chương
  lessonsCount?: number;  // Số bài học
}

export default function CoursesProgress({
  current = 0,
  chaptersCount = 0,
  lessonsCount = 0,
}: CoursesProgressProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" /> Số học viên
        </span>
        <span className="text-foreground font-black text-sm">
          {current}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-sky-500" /> Số chương
        </span>
        <span className="text-foreground font-black text-sm">
          {chaptersCount}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5 text-emerald-500" /> Bài giảng
        </span>
        <span className="text-foreground font-black text-sm">
          {lessonsCount}
        </span>
      </div>
    </div>
  );
}