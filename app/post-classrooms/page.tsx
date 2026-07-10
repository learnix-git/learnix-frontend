// * Accept * //

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  useForm, Controller, type SubmitHandler, type Resolver 
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  BookOpen, GraduationCap, Wallet, Users,
  AlignLeft, ArrowLeft, Sparkles, ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";

import { ClassroomsAPI } from "@/lib/api/classrooms";
import { 
  classroomSchema, GRADE, type ClassroomFormData 
} from "@/lib/validations/classrooms";
import ClassroomsCard from "@/components/classrooms/ClassroomsCard";

export default function PostClassroomPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Khởi tạo form với giá trị mặc định và quy tắc kiểm tra dữ liệu.
  const { watch, control, register, handleSubmit,
    formState: { errors },
  } = useForm<ClassroomFormData>({

    resolver: zodResolver(classroomSchema) as Resolver<ClassroomFormData>,
    
    defaultValues: {
      name: "",
      grade: GRADE[0],
      fee: 0,
      capacity: 50,
      description: "",
    },
    mode: "onBlur",
  });

  const values = watch();

  const submit: SubmitHandler<ClassroomFormData> = async (data) => {
    setSubmitting(true);
    
    try {
      // Chuyển giá trị cấp học thành số, mặc định là 13 nếu không tìm thấy
      let numeric = parseInt(data.grade.replace(/\D/g, ""));
      if (isNaN(numeric)) numeric = 13;

      // Gọi API
      const res = await ClassroomsAPI.createClass({
        name: data.name,
        grade: numeric,
        fee: Number(data.fee),
        capacity: Number(data.capacity),
        description: data.description || "",
      });

      if (res && res.status === "SUCCESS") {
        toast.success("Tạo lớp học thành công!");
        router.push("/classrooms");
      } else {
        toast.error(res?.message || "Không thể tạo lớp học, vui lòng thử lại.");
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
            <p className="m-0 mt-1.5 text-sm text-muted-foreground">Vui lòng điền đầy đủ thông tin bên dưới để tạo lớp học trên Learnix.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <Card className="!p-4 sm:!p-6 !rounded-3xl space-y-5">

              {/* Tên lớp học */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> Tên lớp học <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Lớp học Learnix"
                  className={errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-rose-500">{errors.name.message}</p>
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
                        <SelectValue/>
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
                    step="any"
                    placeholder="0"
                    className={errors.fee ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                    {...register("fee", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/^0+(?=\d)/, "");
                      }
                    })}
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
                    {...register("capacity", {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/^0+(?=\d)/, "");
                      }
                    })}
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
                  placeholder="Giới thiệu ngắn gọn về khóa học của bạn..."
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
            <div className="grid grid-cols-2 gap-2 ml-auto w-fit">
              <Button
                type="button"
                nativeButton={false}
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="h-10 w-full rounded-xl gap-2 dark:!bg-transparent dark:!text-white dark:hover:!bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Hủy bỏ
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

          {/* ═══ LIVE PREVIEW ═══ */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-3">
              <h3 className="m-0 mb-2 px-1 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Xem trước lớp học</h3>

              <ClassroomsCard 
                classroom={{ 
                  name: values.name || "", 
                  grade: values.grade as any, 
                  fee: values.fee || 0,
                  capacity: values.capacity as any || 50, 
                  description: values.description || "", 
                  count: 0, 
                  active: true,
                }}
                isPreview={true} 
              /> 

              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                Đây là bản xem trước thẻ lớp học sẽ trông như thế này trên trang danh sách lớp học sau khi bạn tạo thành công.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}