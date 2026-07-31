"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Hourglass, FileText, Laptop2, Wallet, Clock } from "lucide-react";
import { useAuth } from "@/lib/stores/auth";
import { updatePost } from "@/lib/api/post";
import { getSubjects } from "@/lib/api/subject";
import { Subject, Slot, CreatePostRequest, PostTime, Level, Mode, Venue, Unit, Post } from "@/lib/api/types";
import { Dialog, DialogPortal, DialogBackdrop, DialogPopup, DialogTitle, DialogClose } from "@/components/ui/Dialog";
import { Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Cn } from "@/lib/utils";
import { validatePostForm } from "@/lib/validations/post";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

// Component con
import { PostInfo } from "@/components/post/PostInfo";
import { PostDesc } from "@/components/post/PostDesc";
import { PostMode } from "@/components/post/PostMode";
import { PostPrice } from "@/components/post/PostPrice";
import { PostTime as PostTimeSection } from "@/components/post/PostTime";
import { PostTips } from "@/components/post/PostTips";
import { PostActions } from "@/components/post/PostActions";

// === KIỂU DỮ LIỆU ===

// Kiểu dữ liệu cho môn học đã chọn
export interface TopicEntry {
  key: string;
  subjectId: string | null;
  label: string;
}

// Kiểu dữ liệu cho toàn bộ form đăng bài
export interface PostFormData {
  title: string;
  content: string;
  topics: TopicEntry[];
  level: Level;
  grades: number[];
  mode: Mode;
  venue: Venue;
  city: string;
  ward: string;
  street: string;
  from: number;
  to: number;
  unit: Unit;
  duration: number;
  slot: Slot | null;
  days: number[];
  startTime: string;
  endTime: string;
  flexible: boolean;
  status: string;
}

// Kiểu dữ liệu cho khu vực hành chính (Tỉnh/Thành, Quận/Huyện)
export interface AdminUnit {
  code: number;
  name: string;
}


// === TIỆN ÍCH UI ===

// Hàm định dạng class name cho input, hỗ trợ trạng thái lỗi
export function GetInputCls(hasError?: boolean, isTextarea = false) {
  return Cn(
    "w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs shadow-slate-200/50 dark:shadow-none",
    isTextarea ? "min-h-[140px] resize-y py-4" : "h-12",
    hasError ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10" : ""
  );
}

// Hàm hiển thị dòng thông báo lỗi dưới mỗi trường nhập liệu
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[13px] text-rose-500">
      <AlertCircle className="h-3.5 w-3.5" /> {message}
    </p>
  );
}

// Component thẻ chứa từng phần thông tin của form
export function SectionCard({
  index,
  icon,
  title,
  id,
  children,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-5" id={id}>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
          {index}
        </div>
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          {icon}
          {title}
        </div>
      </div>
      {children}
    </Card>
  );
}

// Component chọn thời gian (giờ:phút)
export function TimeScrollPicker({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  // Tách giờ và phút từ giá trị (vd: "18:00")
  const [hour, min] = value ? value.split(":") : ["18", "00"];
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <div>
      <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
        <Hourglass className="h-3.5 w-3.5 text-primary" /> {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Dropdown chọn giờ */}
        <div className="flex-1 min-w-0">
          <Select
            value={hour}
            onValueChange={(h) => onChange(`${h || "06"}:${min}`)}
            items={hours.map((h) => ({ value: h, label: `${h} giờ` }))}
          >
            <SelectTrigger className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 font-bold text-base px-3">
              <SelectValue placeholder="Giờ" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/90 dark:bg-slate-900/90">
              {hours.map((h) => (
                <SelectItem key={`h-${h}`} value={h}>
                  {h} giờ
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="font-black text-foreground text-lg pb-0.5">:</span>

        {/* Dropdown chọn phút */}
        <div className="flex-1 min-w-0">
          <Select
            value={min}
            onValueChange={(m) => onChange(`${hour}:${m || "00"}`)}
            items={minutes.map((m) => ({ value: m, label: `${m} phút` }))}
          >
            <SelectTrigger className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 font-bold text-base px-3">
              <SelectValue placeholder="Phút" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/90 dark:bg-slate-900/90">
              {minutes.map((m) => (
                <SelectItem key={`m-${m}`} value={m}>
                  {m} phút
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <FieldError message={error} />}
    </div>
  );
}

// === TRANG CHÍNH ===

export function PostDialog({
  open,
  onOpenChange,
  post,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onSaved: () => void;
}) {
  const router = useRouter();
  
  // Trạng thái xác thực người dùng
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Trạng thái dữ liệu form đăng bài
  const [form, setForm] = useState<PostFormData>({
    title: "",
    content: "",
    topics: [],
    level: "ALL",
    grades: [],
    mode: "ONLINE",
    venue: "TUTOR",
    city: "",
    ward: "",
    street: "",
    from: 0,
    to: 0,
    unit: "PER_SESSION",
    duration: 1.5,
    slot: null,
    days: [],
    startTime: "18:00",
    endTime: "20:00",
    flexible: false,
    status: "OPEN",
  });

  // Khởi tạo form khi có post
  useEffect(() => {
    if (post && open) {
      setForm({
        title: post.title || "",
        content: post.content || "",
        topics: (post.topics || []).map((t: any) => ({ 
          key: Math.random().toString(), 
          subjectId: t.topic?.id || t.subject || null, 
          label: t.topic?.name || t.custom || "" 
        })),
        level: post.level || "ALL",
        grades: post.grades || [],
        mode: post.mode || "ONLINE",
        venue: post.venue || "TUTOR",
        city: post.city || "",
        ward: post.ward || "",
        street: post.street || "",
        from: post.from || 0,
        to: post.to || 0,
        unit: post.unit || "PER_SESSION",
        duration: post.times?.[0] ? ((new Date(`1970/01/01 ${post.times[0].end}`).getTime() - new Date(`1970/01/01 ${post.times[0].start}`).getTime()) / 3600000) : 1.5,
        slot: post.times?.[0]?.slot || null,
        days: Array.from(new Set((post.times || []).map((t: any) => t.day))),
        startTime: post.times?.[0]?.start || "18:00",
        endTime: post.times?.[0]?.end || "20:00",
        flexible: post.flexible || false,
        status: post.status || "OPEN",
      });
      if (post.mode === "OFFLINE") {
        setProvinceCode(-1);
      }
    }
  }, [post, open]);

  // Trạng thái lưu trữ các lỗi validation của form
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});
  
  // Trạng thái đang gửi dữ liệu
  const [submitting, setSubmitting] = useState(false);

  // Trạng thái danh sách môn học từ hệ thống
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  // Trạng thái danh sách khu vực hành chính (Tỉnh/Thành phố)
  const [provinces, setProvinces] = useState<AdminUnit[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);

  // Trạng thái danh sách khu vực hành chính (Phường/Xã)
  const [wards, setWards] = useState<AdminUnit[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);

  // Hàm cập nhật một trường dữ liệu trong form và xóa lỗi của trường đó nếu có
  const handleUpdate = <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
    setForm((prev: PostFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: Partial<Record<keyof PostFormData, string>>) => ({ ...prev, [field]: undefined }));
  };

  // Kiểm tra quyền truy cập khi trang được load
  useEffect(() => {
    // Nếu chưa đăng nhập thì chuyển hướng về trang đăng nhập
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đăng bài.");
      router.push("/auth/login");
    } 
    // Nếu không phải gia sư thì không cho phép đăng bài
    else if (user && user.role !== "TUTOR") {
      toast.error("Chỉ gia sư mới có thể đăng bài tuyển sinh.");
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Gọi API lấy danh sách Tỉnh/Thành phố khi trang load
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        setProvincesLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  // Gọi API lấy danh sách Phường/Xã khi người dùng chọn Tỉnh/Thành phố
  useEffect(() => {
    // Nếu chưa chọn Tỉnh/Thành thì xóa danh sách Phường/Xã
    if (!provinceCode) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
      setWardsLoading(true);
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await res.json();
        setWards(data.districts || []);
      } catch (error) {
        console.error("Failed to fetch wards:", error);
      } finally {
        setWardsLoading(false);
      }
    };
    fetchWards();
  }, [provinceCode]);

  // Gọi API lấy danh sách Môn học từ hệ thống khi trang load
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await getSubjects();
        if (res.code === 200 && res.data) {
          // Xử lý đảm bảo lấy đúng mảng môn học
          const subjectsArr = Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
          setSubjects(subjectsArr);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Hàm xử lý khi người dùng chọn buổi học (Sáng, Chiều, Tối)
  const handleSlotChange = (slot: Slot) => {
    // Thiết lập giờ bắt đầu/kết thúc mặc định cho từng buổi
    const defaultTimes: Record<Slot, { start: string; end: string }> = {
      MORNING: { start: "08:00", end: "10:00" },
      AFTERNOON: { start: "14:00", end: "16:00" },
      EVENING: { start: "18:00", end: "20:00" },
    };
    setForm((prev: PostFormData) => ({
      ...prev,
      slot,
      startTime: defaultTimes[slot].start,
      endTime: defaultTimes[slot].end,
    }));
    // Xóa lỗi của trường slot nếu có
    if (errors.slot) setErrors((prev: Partial<Record<keyof PostFormData, string>>) => ({ ...prev, slot: undefined }));
  };

  // Hàm xử lý chọn/hủy chọn ngày học trong tuần
  const toggleDay = (day: number) => {
    // Nếu đã chọn thì bỏ chọn, nếu chưa chọn thì thêm vào danh sách
    if (form.days.includes(day)) {
      handleUpdate("days", form.days.filter((d: number) => d !== day));
    } else {
      handleUpdate("days", [...form.days, day].sort((a, b) => a - b));
    }
    // Xóa lỗi của trường days nếu có
    if (errors.days) setErrors((prev: Partial<Record<keyof PostFormData, string>>) => ({ ...prev, days: undefined }));
  };

  // Hàm xử lý chọn/hủy chọn khối lớp
  const toggleGrade = (grade: number) => {
    // Nếu đã chọn thì bỏ chọn, nếu chưa chọn thì thêm vào danh sách
    if (form.grades.includes(grade)) {
      handleUpdate("grades", form.grades.filter((g: number) => g !== grade));
    } else {
      handleUpdate("grades", [...form.grades, grade].sort((a, b) => a - b));
    }
    // Xóa lỗi của trường grades nếu có
    if (errors.grades) setErrors((prev: Partial<Record<keyof PostFormData, string>>) => ({ ...prev, grades: undefined }));
  };

  // Tính toán danh sách môn học hiển thị (Lọc theo tìm kiếm và bỏ đi các môn đã chọn)
  const filteredSubjects = useMemo(() => {
    const chosenIds = form.topics.map((t: TopicEntry) => t.subjectId).filter(Boolean);
    return (subjects ?? [])
      .filter((s: Subject) => !chosenIds.includes(s.id))
      .filter((s: Subject) => s.name.toLowerCase().includes(subjectSearch.toLowerCase()));
  }, [subjects, form.topics, subjectSearch]);

  // Hàm thêm một môn học từ danh sách hệ thống vào bài đăng
  const addSubjectTopic = (subject: Subject) => {
    handleUpdate("topics", [...form.topics, { key: subject.id, subjectId: subject.id, label: subject.name }]);
    // Reset tìm kiếm
    setSubjectSearch("");
  };

  // Hàm thêm một môn học tự định nghĩa vào bài đăng
  const addCustomTopic = () => {
    const label = customTopic.trim();
    // Nếu nội dung trống thì không xử lý
    if (!label) return;
    
    handleUpdate("topics", [...form.topics, { key: `custom-${Date.now()}`, subjectId: null, label }]);
    // Reset ô nhập
    setCustomTopic("");
  };

  // Hàm xóa một môn học khỏi bài đăng
  const removeTopic = (key: string) => {
    handleUpdate("topics", form.topics.filter((t: TopicEntry) => t.key !== key));
  };

  // Hàm xử lý khi thay đổi Tỉnh/Thành phố
  const handleProvinceChange = (code: string | null) => {
    const province = provinces.find((p: AdminUnit) => p.code.toString() === code);
    setProvinceCode(province ? province.code : null);
    handleUpdate("city", province ? province.name : "");
    // Xóa Phường/Xã cũ
    handleUpdate("ward", "");
  };

  // Hàm xử lý khi thay đổi Phường/Xã
  const handleWardChange = (code: string | null) => {
    const ward = wards.find((w: AdminUnit) => w.code.toString() === code);
    handleUpdate("ward", ward ? ward.name : "");
  };

  // Hàm kiểm tra tính hợp lệ của toàn bộ form, dùng validatePostForm từ lib/validations/post.ts
  const validateForm = () => {
    const next = validatePostForm(form);
    setErrors(next);
    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      setTimeout(() => document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
    return Object.keys(next).length === 0;
  };

  // Hàm xử lý sự kiện submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nếu form không hợp lệ thì không xử lý tiếp
    if (!validateForm()) return;
    if (form.grades.length === 0) return;

    // Bật trạng thái đang gửi
    setSubmitting(true);

    try {
      // Format lại thời gian dạy thành mảng các object theo chuẩn API
      const formattedTimes: PostTime[] = form.flexible
        ? []
        : form.days.map((day: number) => ({
          day,
          slot: form.slot as Slot,
          start: form.startTime,
          end: form.endTime,
        }));

      // Tạo payload gửi lên API
      const payload: CreatePostRequest = {
        title: form.title.trim(),
        content: form.content.trim(),
        level: "ALL", // Luôn đặt level là ALL để hỗ trợ chọn nhiều khối lớp
        grades: form.grades,
        mode: form.mode,
        venue: form.mode === "OFFLINE" ? form.venue : undefined,
        city: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.city || undefined : undefined,
        ward: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.ward || undefined : undefined,
        street: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.street || undefined : undefined,
        from: Number(form.from),
        to: Number(form.to),
        unit: form.unit,
        hours: form.unit === "PER_SESSION" ? Number(form.duration) : undefined,
        flexible: form.flexible,
        times: form.flexible ? undefined : formattedTimes,
        topics: form.topics.map((t: TopicEntry) => (t.subjectId ? { subject: t.subjectId } : { custom: t.label })),
      };

      // Gọi API cập nhật bài đăng
      if (!post) return;
      const res = await updatePost(post.id, { ...payload, status: form.status } as any);

      // Nếu tạo thành công, thông báo và chuyển hướng
      if (res.code === 201 || res.code === 200) {
        toast.success("Cập nhật bài đăng thành công!");
        onSaved();
      } else {
        // Nếu API trả về lỗi
        toast.error(res.message || "Cập nhật thất bại, thử lại sau.");
      }
    } catch (err: unknown) {
      // Nếu có lỗi hệ thống
      const message = err instanceof Error ? err.message : "Cập nhật thất bại, thử lại sau.";
      toast.error(message);
    } finally {
      // Tắt trạng thái đang gửi
      setSubmitting(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop className="bg-black/60 backdrop-blur-sm" />
        <DialogPopup className="sm:max-w-[850px] w-full p-0 bg-slate-900 border-white/10 shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
          <div className="px-6 py-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Cập nhật bài đăng
            </DialogTitle>
            <DialogClose className="text-slate-400 hover:text-white" />
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="tutor-post-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Mục 1: Thông tin chung */}
          <SectionCard index={1} icon={<FileText className="h-4 w-4 text-primary" />} title="Thông tin chung">
            <PostInfo
              form={form as any}
              errors={errors}
              handleUpdate={handleUpdate as any}
              subjectsLoading={subjectsLoading}
              subjectSearch={subjectSearch}
              setSubjectSearch={setSubjectSearch}
              filteredSubjects={filteredSubjects}
              addSubjectTopic={addSubjectTopic}
              removeTopic={removeTopic}
              customTopic={customTopic}
              setCustomTopic={setCustomTopic}
              addCustomTopic={addCustomTopic}
              toggleGrade={toggleGrade}
            />
          </SectionCard>
          
          {/* Mục 2: Mô tả chi tiết */}
          <SectionCard index={2} icon={<FileText className="h-4 w-4 text-primary" />} title="Mô tả chi tiết">
            <PostDesc form={form as any} errors={errors} handleUpdate={handleUpdate as any} />
          </SectionCard>

          {/* Mục 3: Hình thức dạy */}
          <SectionCard index={3} icon={<Laptop2 className="h-4 w-4 text-primary" />} title="Hình thức dạy">
            <PostMode
              form={form as any}
              errors={errors}
              handleUpdate={handleUpdate as any}
              provinces={provinces}
              provincesLoading={provincesLoading}
              provinceCode={provinceCode}
              handleProvinceChange={handleProvinceChange}
              wards={wards}
              wardsLoading={wardsLoading}
              handleWardChange={handleWardChange}
            />
          </SectionCard>

          {/* Mục 4: Học phí */}
          <SectionCard index={4} icon={<Wallet className="h-4 w-4 text-primary" />} title="Học phí">
            <PostPrice form={form as any} errors={errors} handleUpdate={handleUpdate as any} />
          </SectionCard>

          {/* Mục 5: Lịch dạy */}
          <SectionCard index={5} icon={<Clock className="h-4 w-4 text-primary" />} title="Lịch dạy">
            <PostTimeSection
              form={form as any}
              errors={errors}
              handleUpdate={handleUpdate as any}
              handleSlotChange={handleSlotChange}
              toggleDay={toggleDay}
            />
          </SectionCard>
          {/* Mục 6: Trạng thái */}
          <SectionCard index={6} icon={<Edit2 className="h-4 w-4 text-primary" />} title="Trạng thái hiển thị">
            <div className="space-y-2">
                <Select value={form.status} onValueChange={(val: any) => handleUpdate("status", val)}>
                  <SelectTrigger className="w-full bg-black/20 border-white/10 text-[14px] font-bold h-12 rounded-2xl px-5">
                    <SelectValue>
                      {form.status === "OPEN" ? "Công khai" : form.status === "HOLD" ? "Đang ẩn" : "Chọn trạng thái"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-slate-900">
                  <SelectItem value="OPEN" className="!text-emerald-400 font-bold data-[selected]:!bg-emerald-500/10 data-[selected]:!border-emerald-500/20 hover:!bg-emerald-500/10 focus:!bg-emerald-500/10">Công khai</SelectItem>
                  <SelectItem value="HOLD" className="!text-amber-400 font-bold data-[selected]:!bg-amber-500/10 data-[selected]:!border-amber-500/20 hover:!bg-amber-500/10 focus:!bg-amber-500/10">Đang ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SectionCard>
        </form>
      </div>

      <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-3 shrink-0">
        <DialogClose render={
          <Button type="button" variant="ghost" className="text-slate-400 hover:text-white rounded-xl">Hủy</Button>
        } />
        <Button type="submit" form="tutor-post-form" disabled={submitting} className="bg-primary font-bold rounded-xl h-10 px-6">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Lưu thay đổi"}
        </Button>
      </div>
      </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}