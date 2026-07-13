"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useForm, Controller, type SubmitHandler, type Resolver
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  GraduationCap, UploadCloud, X, Sparkles,
  AlertCircle, Lightbulb, HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Combobox } from "@/components/ui/Combobox";
import { TwoColumnLayout } from "@/components/layout/TwoColumn";
import { Cn } from "@/lib/utils";

import { CoursesAPI } from "@/lib/api/courses";
import {
  coursesSchema, type CoursesFormData
} from "@/lib/validations/courses";
import CoursesCard from "@/components/courses/CoursesCard";

const GRADE = ["lớp 6", "lớp 7", "lớp 8", "lớp 9", "lớp 10", "lớp 11", "lớp 12", "Đại học"];
const MAX_THUMBNAIL_MB = 5;

function getInputCls(hasError?: boolean) {
  return Cn(
    "w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-xl shadow-xs shadow-slate-200/50 dark:shadow-none",
    hasError ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10" : ""
  );
}

export default function PostCoursesPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { watch, control, register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<CoursesFormData>({
    resolver: zodResolver(coursesSchema) as Resolver<CoursesFormData>,
    defaultValues: {
      name: "",
      grade: GRADE[0],
      fee: 0,
      description: "",
      thumbnail: "",
    },
    mode: "onBlur",
  });

  const values = watch();

  // ═══ Xử lý ảnh bìa ═══
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp hình ảnh hợp lệ");
      return;
    }
    if (file.size > MAX_THUMBNAIL_MB * 1024 * 1024) {
      toast.error(`Ảnh bìa không được vượt quá ${MAX_THUMBNAIL_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setThumbnailPreview(result);
      setValue("thumbnail", result, { shouldValidate: true, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setValue("thumbnail", "", { shouldValidate: true, shouldDirty: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit: SubmitHandler<CoursesFormData> = async (data) => {
    setSubmitting(true);

    try {
      let numeric = parseInt(data.grade.replace(/\D/g, ""));
      if (isNaN(numeric)) numeric = 13;

      const res = await CoursesAPI.create({
        active: true,
        name: data.name,
        grade: numeric,
        fee: Number(data.fee),
        description: data.description || "",
        thumbnail: data.thumbnail || "",
      });

      if (res && res.success === true) {
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

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Tạo lớp học", href: "/post-classrooms" },
  ];

  // ═══ SIDEBAR: mẹo tạo lớp & hỗ trợ (đồng bộ pattern với trang Đăng dự án) ═══
  const sidebar = (
    <div className="flex flex-col gap-6 h-full">
      <Card className="!bg-primary !border-primary/20 !text-white shadow-lg shadow-primary/20">
        <div className="mb-4 flex items-center gap-2 font-bold text-white">
          <Lightbulb className="h-5 w-5" />
          Mẹo tạo lớp học hiệu quả
        </div>

        <ul className="space-y-4">
          <li className="flex gap-3">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                Tên lớp dễ hiểu
              </h4>
              <p className="mt-1 text-[13px] leading-relaxed text-white/90">
                Đặt tên cụ thể giúp học sinh nhanh chóng nhận ra lớp học phù hợp với
                nhu cầu của mình.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                Mô tả chi tiết
              </h4>
              <p className="mt-1 text-[13px] leading-relaxed text-white/90">
                Nêu rõ nội dung, lộ trình học và những gì học sinh sẽ nhận được sau
                khóa học.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                Ảnh bìa cuốn hút
              </h4>
              <p className="mt-1 text-[13px] leading-relaxed text-white/90">
                Một ảnh bìa rõ ràng, chuyên nghiệp sẽ giúp lớp học nổi bật hơn trên
                trang danh sách.
              </p>
            </div>
          </li>
        </ul>
      </Card>

      <Card className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-foreground font-bold mb-2">
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
          Bạn cần hỗ trợ?
        </div>
        <p className="text-[13px] text-muted-foreground mb-4">
          Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn tạo lớp học.
        </p>
        <Button
          variant="outline"
          className="w-full justify-center rounded-2xl h-12 px-6 font-bold text-xs tracking-widest mt-auto"
        >
          Liên hệ hỗ trợ
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="pb-24">
      <TwoColumnLayout
        title="Tạo lớp học mới"
        description="Vui lòng điền đầy đủ thông tin bên dưới để tạo lớp học trên Learnix."
        breadcrumb={breadcrumb}
        sidebar={sidebar}
        extraHeader={
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold text-sm">Tạo lớp học chỉ trong vài phút</span>
          </div>
        }
      >
        <form id="courses-form" onSubmit={handleSubmit(submit)} className="space-y-6">

          {/* 1. Thông tin cơ bản */}
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-white/10 dark:border-white/5 px-6 py-5 bg-white/20 dark:bg-white/5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">1</span>
                Thông tin cơ bản
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div id="name">
                <label htmlFor="name-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tên lớp học <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name-input"
                  placeholder="Lớp học Learnix"
                  className={getInputCls(!!errors.name)}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.name.message}
                  </p>
                )}
              </div>

              <div id="grade">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Khối lớp <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      value={field.value}
                      onValueChange={(val) => field.onChange(val || GRADE[0])}
                      options={GRADE.map((g) => ({ value: g, label: g }))}
                      placeholder="Chọn khối lớp"
                      leftIcon={<GraduationCap className="h-4 w-4" />}
                    />
                  )}
                />
                {errors.grade && (
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.grade.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* 2. Học phí */}
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-white/10 dark:border-white/5 px-6 py-5 bg-white/20 dark:bg-white/5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">2</span>
                Học phí
              </h2>
            </div>
            <div className="p-6">
              <div id="fee">
                <label htmlFor="fee-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Học phí (VNĐ)
                </label>
                <input
                  id="fee-input"
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0"
                  className={getInputCls(!!errors.fee)}
                  {...register("fee", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/^0+(?=\d)/, "");
                    }
                  })}
                />
                {errors.fee ? (
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.fee.message}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[13px] text-muted-foreground">Để trống hoặc 0 nếu lớp học miễn phí.</p>
                )}
              </div>
            </div>
          </Card>

          {/* 3. Mô tả lớp học */}
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-white/10 dark:border-white/5 px-6 py-5 bg-white/20 dark:bg-white/5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">3</span>
                Mô tả lớp học
              </h2>
            </div>
            <div className="p-6">
              <div id="description">
                <label htmlFor="description-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mô tả lớp học <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                </label>
                <textarea
                  id="description-input"
                  rows={5}
                  placeholder="Giới thiệu ngắn gọn về khóa học của bạn..."
                  className={getInputCls(!!errors.description) + " min-h-[120px] resize-y py-4"}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1.5 flex items-center gap-1 text-[13px] text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* 4. Ảnh bìa lớp học */}
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-white/10 dark:border-white/5 px-6 py-5 bg-white/20 dark:bg-white/5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">4</span>
                Ảnh bìa lớp học
              </h2>
            </div>
            <div className="p-6">
              <div id="thumbnail">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ảnh bìa lớp học <span className="text-muted-foreground font-normal">(Tùy chọn)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />

                {thumbnailPreview ? (
                  <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/50 dark:border-white/10">
                    <img
                      src={thumbnailPreview}
                      alt="Xem trước ảnh bìa"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors" />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/70 text-white backdrop-blur-md hover:bg-rose-500 transition-colors cursor-pointer"
                      aria-label="Xóa ảnh bìa"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 backdrop-blur-xl py-9 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <UploadCloud className="h-7 w-7" />
                    <span className="text-xs font-bold">Nhấn để tải ảnh bìa lên</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG tối đa {MAX_THUMBNAIL_MB}MB</span>
                  </button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </TwoColumnLayout>

      {/* 5. Xem trước lớp học — full-width THẬT SỰ, nằm ngoài layout 2 cột nên không bị bóp vào cột form hẹp */}
      <div className="max-w-[1280px] mx-auto px-4 -mt-16 md:-mt-20">
        <Card className="overflow-hidden !p-0">
          <div className="border-b border-white/10 dark:border-white/5 px-6 py-5 bg-white/20 dark:bg-white/5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">5</span>
              Xem trước lớp học
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-[13px] text-muted-foreground">
              Đây là bản xem trước, thẻ lớp học sẽ trông như thế này trên trang danh sách lớp học sau khi bạn tạo thành công.
            </p>

            <CoursesCard
              layout="auto"
              course={{
                name: values.name || "",
                grade: values.grade as any,
                fee: values.fee || 0,
                description: values.description || "",
                thumbnail: thumbnailPreview || "",
                count: 0,
                active: true,
              }}
              isPreview={true}
            />
          </div>
        </Card>
      </div>

      {/* ═══ Sticky Bottom Actions ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/10 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] p-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Sẵn sàng chưa?</p>
            <p className="text-xs text-muted-foreground">Kiểm tra kỹ thông tin trước khi tạo lớp</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 sm:flex-none rounded-2xl h-12 px-6 font-bold text-xs tracking-widest"
            >
              Hủy bỏ
            </Button>
            <Button
              size="lg"
              type="submit"
              form="courses-form"
              loading={submitting}
              className="flex-1 sm:flex-none rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-xs tracking-widest transition-all hover:scale-[1.02]"
            >
              {submitting ? (
                "Đang tạo lớp học..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" /> Tạo lớp học ngay
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}