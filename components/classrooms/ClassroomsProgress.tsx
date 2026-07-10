"use client";

import { Users } from "lucide-react";

interface ClassroomsProgressProps {
  current: number;  // Sĩ số hiện tại
  capacity: number; // Sĩ số tối đa
}

export default function ClassroomsProgress({
  current = 0,
  capacity = 50,
}: ClassroomsProgressProps) {
  const total = capacity > 0 ? capacity : 50;
  
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  return (
    <div className="space-y-1.5">

      {/* Tiêu đề & Chỉ số số lượng */}
      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> Sĩ số
        </span>
        <span className="text-foreground">
          {current}/{total}
        </span>
      </div>

      {/* Thanh chạy Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
        <div 
          className="h-full rounded-full bg-primary transition-all duration-500" 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}