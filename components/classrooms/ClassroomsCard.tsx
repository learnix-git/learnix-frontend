// * Accept * //

"use client";

import { Star, Wallet, GraduationCap } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Classroom } from "@/lib/api/types";
import { FormatMoney } from "@/lib/utils";

import ClassroomsProgress from "./ClassroomsProgress";

interface ClassroomsCardProps {
  classroom: Partial<Classroom> & {
    count?: number;
    status?: "active" | "draft";            
  };
  isPreview?: boolean;             
  isJoining?: boolean;             
  onAction?: (id: string) => void; 
}

export default function ClassroomsCard({
  classroom,
  isPreview = false,
  isJoining = false,
  onAction,
}: ClassroomsCardProps) {
  const {
    id,
    name,
    grade,
    description,
    code,
    fee,
    capacity,
    count = 0,
    teacher,
    active = true,
    status = false,
  } = classroom;

  const display = typeof grade === "number" ? `Khối ${grade}` : (grade || "Chưa chọn");

  return (
    <Card className="!p-4 sm:!p-5 !rounded-3xl flex flex-col gap-4 h-full hover:shadow-md transition-shadow">

      {/* Trạng thái & Khối lớp */}
      <div className="flex items-center justify-between">
        <Badge variant={active ? "success" : "secondary"}>
          {active ? "Đang mở" : "Tạm đóng"}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" /> {display}
        </Badge>
      </div>

      {/* Tiêu đề & Mã lớp */}
      <div className="space-y-1">
        <h3 className="m-0 mb-1 line-clamp-2 text-base font-black leading-snug tracking-tight text-foreground">
          {name?.trim() || "Tên lớp học của bạn sẽ hiện ở đây"}
        </h3>
        <p className="m-0 text-[12px] font-bold text-primary">
          Mã lớp: {code || (isPreview ? "Dữ liệu được tạo tự động" : "Chưa có")}
        </p>
      </div>

      {/* Mô tả */}
      {description?.trim() ? (
        <p className="m-0 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground flex-grow">
          Mô tả: {description}
        </p>
      ) : (
        <div className="flex-grow" />
      )}

      {/* Giảng viên */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar alt={teacher || "Giảng viên"} size="sm" />
          <span className="truncate text-[13px] font-medium text-muted-foreground">
            {teacher || "Tên của bạn sẽ hiện ở đây"}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-500" /> Mới
        </span>
      </div>

      {/* Học phí */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
        <span className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
          <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Học phí
        </span>
        {!fee || Number(fee) === 0 ? (
          <Badge variant="success">Miễn phí</Badge>
        ) : (
          <span className="text-[13px] font-black text-foreground">
            {FormatMoney(Number(fee))}
          </span>
        )}
      </div>

      {/*  Thanh tiến trình sĩ số */}
      <ClassroomsProgress current={count} capacity={Number(capacity) || 50} />

      {/* Nút hành động */}
      {status ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-xl text-[13px]"
          onClick={() => id && onAction && onAction(id)}
        >
          Vào không gian học
        </Button>
      ) : (
        <Button
          type="button"
          className="h-10 w-full rounded-xl text-[13px]"
          disabled={isPreview || isJoining || !active}
          onClick={() => id && onAction && onAction(id)}
          loading={isJoining}
        >
          {isPreview ? "Tham gia lớp học" : "Đăng ký tham gia"}
        </Button>
      )}
    </Card>
  );
}