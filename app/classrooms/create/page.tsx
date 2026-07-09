"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  BookOpen, Hash, GraduationCap, Wallet, Users,
  AlignLeft, ArrowLeft, Sparkles, Star, ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Avatar } from "@/components/ui/Avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { FormatMoney } from "@/lib/utils";
import { ClassroomsAPI } from "@/lib/api/classrooms";
import { classroomSchema, GRADE, type ClassroomFormValues } from "@/lib/validations/classrooms";

// ============ HELPERS ============
function sanitizeCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "");
}

// ============ PAGE ============
export default function CreateClassroomPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: "",
      code: "",
      grade: GRADE[2],
      fee: 0,
      capacity: 50,
      description: "",
    },
    mode: "onBlur",
  });

  const values = watch();

  const onSubmit = async (data: ClassroomFormValues) => {
    setSubmitting(true);
    try {
      const res = await ClassroomsAPI.createClass({
        name: data.name,
        code: data.code,
        grade: data.grade,
        fee: Number(data.fee),
        capacity: Number(data.capacity),
        description: data.description || "",
      });

      if (res && (res.status === "SUCCESS" || res.id || res.data)) {
        toast.success("Tạo lớp học thành công!", {
          description: `Lớp "${data.name}" đã được tạo.`,
        });
        router.push("/dashboard/teacher");
      } else {
        toast.error((res as { message?: string }).message || "Không thể tạo lớp học, vui lòng thử lại.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi khi tạo lớp học, vui lòng thử lại.";
      console.error("Lỗi tạo lớp học:", error);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-6">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <div>
            <h1 className="m-0 text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Tạo lớp học mới</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ═══ CỘT TRÁI: FORM (7/12) ═══ */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="!p-4 sm:!p-6 !rounded-3xl space-y-5">
              {/* Tên lớp học */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> Tên lớp học <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Toán 12"
                  className={errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-rose-500">{errors.name.message}</p>
                )}
              </div>

              {/* Mã lớp học */}
              <div className="space-y-1.5">
                <Label htmlFor="code">
                  <Hash className="h-3.5 w-3.5 text-primary" /> Mã lớp học <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="code"
                      placeholder="Ví dụ: MA-12"
                      className={errors.code ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                      value={field.value}
                      onChange={(e) => field.onChange(sanitizeCode(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.code ? (
                  <p className="text-xs font-medium text-rose-500">{errors.code.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Mã lớp được viết liền, chỉ gồm chữ, số và dấu gạch ngang.</p>
                )}
              </div>

              {/* Khối lớp */}
              <div className="space-y-1.5">
                <Label htmlFor="grade">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" /> Khối lớp <span className="text-rose-500">*</span>
                </Label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.grade ? "border-rose-500" : ""}>
                        <SelectValue placeholder="Chọn khối lớp" />
                        <ChevronDown className="hidden" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.grade && (
                  <p className="text-xs font-medium text-rose-500">{errors.grade.message}</p>
                )}
              </div>

              {/* Học phí & Sĩ số */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fee">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Học phí (VNĐ)
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="0"
                    className={errors.fee ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                    {...register("fee")}
                  />
                  {errors.fee && (
                    <p className="text-xs font-medium text-rose-500">{errors.fee.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="capacity">
                    <Users className="h-3.5 w-3.5 text-blue-500" /> Sĩ số tối đa
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={10}
                    max={500}
                    placeholder="50"
                    className={errors.capacity ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                    {...register("capacity")}
                  />
                  {errors.capacity && (
                    <p className="text-xs font-medium text-rose-500">{errors.capacity.message}</p>
                  )}
                </div>
              </div>

              {/* Mô tả */}
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  <AlignLeft className="h-3.5 w-3.5 text-primary" /> Mô tả lớp học <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                </Label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Giới thiệu ngắn gọn về lớp học của bạn..."
                  className={`w-full rounded-2xl border bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-all focus:bg-white/60 dark:focus:bg-slate-900/60 focus:ring-2 resize-none ${
                    errors.description ? "border-rose-500 focus:ring-rose-500/20" : "border-white/60 dark:border-white/10 focus:border-primary/40 focus:ring-primary/20"
                  }`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs font-medium text-rose-500">{errors.description.message}</p>
                )}
              </div>
            </Card>

            {/* ═══ ACTION BAR ═══ */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="h-11 rounded-2xl px-6 text-[13px]"
              >
                <ArrowLeft className="h-4 w-4" /> Hủy bỏ
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="h-11 rounded-2xl px-8 text-[13px] shadow-lg shadow-primary/20"
              >
                {submitting ? (
                  "Đang tạo lớp học..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Tạo lớp học
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ═══ CỘT PHẢI: LIVE PREVIEW (5/12) ═══ */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-3">
              <h3 className="m-0 mb-2 px-1 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Xem trước lớp học</h3>

              <Card className="!p-4 sm:!p-5 !rounded-3xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant="success">Đang mở</Badge>
                  <Badge variant="secondary" className="gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> {values.grade || "Chưa chọn"}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="m-0 line-clamp-2 text-base font-black leading-snug tracking-tight text-foreground">
                    {values.name?.trim() || "Tên lớp học của bạn sẽ hiện ở đây"}
                  </h3>
                  <p className="m-0 text-[12px] font-bold text-primary">
                    Mã lớp: {values.code?.trim() || "MA_LOP"}
                  </p>
                </div>

                {values.description?.trim() && (
                  <p className="m-0 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                    {values.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar alt="Giảng viên" size="sm" />
                    <span className="truncate text-[13px] font-medium text-muted-foreground">Bạn</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> Mới
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white/55 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                    <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Học phí
                  </span>
                  {!values.fee || Number(values.fee) === 0 ? (
                    <Badge variant="success">Miễn phí</Badge>
                  ) : (
                    <span className="text-[13px] font-black text-foreground">{FormatMoney(Number(values.fee))}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Sĩ số</span>
                    <span className="text-foreground">0/{values.capacity || 50}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: "0%" }} />
                  </div>
                </div>

                <Button type="button" className="h-10 w-full rounded-xl text-[13px]">
                  Tham gia lớp học
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}