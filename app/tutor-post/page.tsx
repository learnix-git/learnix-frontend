"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TwoColumn } from "@/components/layout/TwoColumn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/lib/stores/auth";
import { Cn } from "@/lib/utils";
import {
  GraduationCap,
  Laptop2,
  MapPin,
  Banknote,
  AlertCircle,
  Plus,
  X,
  Loader2,
  FileText,
  Wallet,
  Lightbulb,
  HelpCircle,
  Home,
  Shuffle,
  PhoneCall,
} from "lucide-react";

import { getSubjects } from "@/lib/api/subject";
import { createPost } from "@/lib/api/post";
import type { Subject, CreatePostRequest } from "@/lib/api/types";

type LevelOption = "PRIMARY" | "MIDDLE" | "HIGH" | "ALL";
type ModeOption = "ONLINE" | "OFFLINE";
type VenueOption = "TUTOR" | "STUDENT" | "BOTH";

interface TopicEntry {
  key: string;
  subjectId: string | null;
  label: string;
}

interface PostFormData {
  title: string;
  content: string;
  topics: TopicEntry[];
  level: LevelOption;
  grade: number | null;
  mode: ModeOption;
  venue: VenueOption;
  city: string;
  district: string;
  ward: string;
  street: string;
  from: number;
  to: number;
}

const MAX_TOPICS = Infinity;

const VENUES: {
  value: VenueOption;
  label: string;
  desc: string;
  icon: React.ReactNode;
  selected: string;
  hover: string;
}[] = [
  {
    value: "TUTOR",
    label: "Tại nhà gia sư",
    desc: "Học sinh đến nhà bạn để học",
    icon: <Home className="h-5 w-5 shrink-0" />,
    selected: "border-sky-500 bg-sky-500/5 text-sky-600 dark:text-sky-400",
    hover: "hover:border-sky-500/30",
  },
  {
    value: "STUDENT",
    label: "Tại nhà học sinh",
    desc: "Bạn đến nhà học sinh để dạy",
    icon: <MapPin className="h-5 w-5 shrink-0" />,
    selected: "border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400",
    hover: "hover:border-violet-500/30",
  },
  {
    value: "BOTH",
    label: "Tùy ý",
    desc: "Địa điểm khác",
    icon: <Shuffle className="h-5 w-5 shrink-0" />,
    selected: "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-500/30",
  },
];

const LEVELS: { value: LevelOption; label: string; desc: string }[] = [
  { value: "PRIMARY", label: "Tiểu học", desc: "Lớp 1 - 5" },
  { value: "MIDDLE", label: "THCS", desc: "Lớp 6 - 9" },
  { value: "HIGH", label: "THPT", desc: "Lớp 10 - 12" },
  { value: "ALL", label: "Tất cả", desc: "Mọi lớp học" },
];

const GRADE_RANGE: Record<LevelOption, number[]> = {
  PRIMARY: [1, 2, 3, 4, 5],
  MIDDLE: [6, 7, 8, 9],
  HIGH: [10, 11, 12],
  ALL: Array.from({ length: 12 }, (_, i) => i + 1),
};

const POST_TIPS = [
  {
    title: "Tiêu đề rõ ràng",
    desc: "Nêu rõ môn dạy và cấp học để phụ huynh hiểu ngay bài đăng của bạn.",
  },
  {
    title: "Mô tả chi tiết",
    desc: "Nói rõ phương pháp dạy, kinh nghiệm và cam kết đầu ra bạn có thể mang lại.",
  },
  {
    title: "Học phí hợp lý",
    desc: "Khoảng học phí phù hợp với thị trường sẽ thu hút nhiều học sinh liên hệ hơn.",
  },
];

function extractSubjects(raw: unknown): Subject[] {
  if (Array.isArray(raw)) return raw as Subject[];
  if (raw && typeof raw === "object" && Array.isArray((raw as any).items)) {
    return (raw as any).items as Subject[];
  }
  return [];
}

function getInputCls(hasError?: boolean, isTextarea = false) {
  return Cn(
    "w-full rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-xl shadow-xs shadow-slate-200/50 dark:shadow-none",
    isTextarea ? "min-h-[140px] resize-y py-4" : "h-12",
    hasError ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10" : ""
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[13px] text-rose-500">
      <AlertCircle className="h-3.5 w-3.5" /> {message}
    </p>
  );
}

// Card đánh số cho từng phần của form — dùng chung để 1 form dài
// được chia thành nhiều khối rõ ràng thay vì gộp vào 1-2 tab.
function SectionCard({
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

export default function TutorPostPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectSearch, setSubjectSearch] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const [form, setForm] = useState<PostFormData>({
    title: "",
    content: "",
    topics: [],
    level: "ALL",
    grade: null,
    mode: "ONLINE",
    venue: "TUTOR",
    city: "",
    district: "",
    ward: "",
    street: "",
    from: 0,
    to: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
      return;
    }
    if (!authLoading && user && user.role !== "TUTOR") {
      toast.error("Chỉ tài khoản gia sư mới đăng được bài tuyển sinh.");
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSubjects();
        setSubjects(extractSubjects(res.data));
      } catch {
        toast.error("Không tải được danh sách môn học.");
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    })();
  }, []);

  const update = <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    if (form.grade !== null && !GRADE_RANGE[form.level].includes(form.grade)) {
      update("grade", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.level]);

  const filteredSubjects = useMemo(() => {
    const chosenIds = form.topics.map((t) => t.subjectId).filter(Boolean);
    return (subjects ?? [])
      .filter((s) => !chosenIds.includes(s.id))
      .filter((s) => s.name.toLowerCase().includes(subjectSearch.toLowerCase()));
  }, [subjects, form.topics, subjectSearch]);

  const addSubjectTopic = (subject: Subject) => {
    if (form.topics.length >= MAX_TOPICS) {
      toast.error("Tối đa 5 môn học cho 1 bài đăng.");
      return;
    }
    update("topics", [...form.topics, { key: subject.id, subjectId: subject.id, label: subject.name }]);
    setSubjectSearch("");
  };

  const addCustomTopic = () => {
    const label = customTopic.trim();
    if (!label) return;
    if (form.topics.length >= MAX_TOPICS) {
      toast.error("Tối đa 5 môn học cho 1 bài đăng.");
      return;
    }
    update("topics", [...form.topics, { key: `custom-${Date.now()}`, subjectId: null, label }]);
    setCustomTopic("");
  };

  const removeTopic = (key: string) => {
    update("topics", form.topics.filter((t) => t.key !== key));
  };

  const validate = () => {
    const next: Partial<Record<keyof PostFormData, string>> = {};
    if (!form.title.trim()) next.title = "Vui lòng nhập tiêu đề bài đăng.";
    else if (form.title.length > 150) next.title = "Tiêu đề tối đa 150 ký tự.";

    if (!form.content.trim()) next.content = "Vui lòng mô tả nội dung dạy.";
    else if (form.content.length > 5000) next.content = "Nội dung tối đa 5000 ký tự.";

    if (form.topics.length === 0) next.topics = "Chọn hoặc thêm ít nhất 1 môn dạy.";
    if (!form.grade) next.grade = "Vui lòng chọn khối lớp.";
    if (form.mode === "OFFLINE" && form.venue === "TUTOR" && !form.city.trim()) next.city = "Nhập khu vực dạy khi chọn hình thức Offline.";
    if (!form.from || form.from < 1000) next.from = "Học phí tối thiểu từ 1.000đ.";
    if (!form.to || form.to < 1000) next.to = "Học phí tối đa từ 1.000đ.";
    if (form.from && form.to && form.from > form.to) next.to = "Học phí tối đa phải lớn hơn hoặc bằng tối thiểu.";

    setErrors(next);

    // cuộn tới field lỗi đầu tiên — vì giờ tất cả section đều hiển thị cùng lúc
    // nên không cần chuyển tab, chỉ cần scrollIntoView là đủ.
    const firstKey = Object.keys(next)[0] as keyof PostFormData | undefined;
    if (firstKey) {
      setTimeout(() => document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (form.grade === null) return;

    setSubmitting(true);
    try {
      const payload: CreatePostRequest = {
        title: form.title.trim(),
        content: form.content.trim(),
        level: form.level,
        grade: form.grade,
        mode: form.mode,
        venue: form.mode === "OFFLINE" ? form.venue : undefined,
        city: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.city || undefined : undefined,
        district: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.district || undefined : undefined,
        ward: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.ward || undefined : undefined,
        street: form.mode === "OFFLINE" && form.venue === "TUTOR" ? form.street || undefined : undefined,
        from: form.from,
        to: form.to,
        topics: form.topics.map((t) => (t.subjectId ? { subject: t.subjectId } : { custom: t.label })),
      };
      const res = await createPost(payload);
      if (res.code === 201 || res.code === 200) {
        toast.success("Đăng bài tuyển sinh thành công!");
        router.push("/tutor-post");
      } else {
        toast.error(res.message || "Đăng bài thất bại, thử lại sau.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng bài thất bại, thử lại sau.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !isAuthenticated) return null;

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Đăng bài tuyển sinh", href: "/tutor-post" },
  ];

  const sidebar = (
    <>
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Lightbulb className="h-5 w-5 text-primary" />
          Mẹo đăng bài hiệu quả
        </div>
        <ul className="space-y-3">
          {POST_TIPS.map((tip) => (
            <li key={tip.title} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-[13px] font-semibold text-foreground">{tip.title}</p>
                <p className="text-[13px] text-muted-foreground">{tip.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <HelpCircle className="h-5 w-5 text-primary" />
          Cần hỗ trợ?
        </div>
        <p className="text-[13px] text-muted-foreground">
          Gặp khó khăn khi đăng bài? Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/contact")}
          className="w-full rounded-2xl h-11 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 font-bold text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <PhoneCall className="h-4 w-4 mr-1.5" />
          Liên hệ hỗ trợ
        </Button>
      </Card>
    </>
  );

  return (
    <div className="pb-24">
      <TwoColumn
        title="Đăng bài tuyển sinh"
        description="Tạo bài đăng để bắt đầu làm gia sư ngay hôm nay"
        breadcrumb={breadcrumb}
        sidebar={sidebar}
      >
        <form id="tutor-post-form" onSubmit={handleSubmit} className="space-y-6">
          <SectionCard index={1} icon={<FileText className="h-4 w-4 text-primary" />} title="Thông tin chung">
            <div id="title">
              <label htmlFor="title-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tiêu đề <span className="text-rose-500">*</span>
              </label>
              <input
                id="title-input"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="VD: Gia sư Learnix"
                className={getInputCls(!!errors.title)}
                maxLength={150}
              />
              <FieldError message={errors.title} />
            </div>

            <div id="topics">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Môn dạy <span className="text-rose-500">*</span>
                </label>
                <span className="text-[13px] text-muted-foreground">{form.topics.length} đã chọn</span>
              </div>

              <div className={Cn(
                "min-h-[52px] p-2.5 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 backdrop-blur-xl transition-all duration-300 mb-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
                errors.topics && "border-rose-500/50"
              )}>
                <div className="flex flex-wrap items-center gap-2">
                  {form.topics.map((t) => {
                    return (
                      <div
                        key={t.key}
                        role="button"
                        tabIndex={0}
                        title="Nhấp để xóa môn này"
                        onClick={() => removeTopic(t.key)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            removeTopic(t.key);
                          }
                        }}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer select-none transition-all duration-200 bg-slate-100 dark:bg-white/10 text-primary hover:opacity-80 active:scale-95 animate-in fade-in zoom-in-95"
                      >
                        {t.label}
                        {!t.subjectId && <span className="text-[10px] uppercase tracking-wide opacity-60">tự nhập</span>}
                        <X className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-200" />
                      </div>
                    );
                  })}
                  {form.topics.length === 0 && (
                    <input
                      type="text"
                      value={subjectSearch}
                      placeholder={subjectsLoading ? "Đang tải môn học..." : "Tìm kiếm môn học..."}
                      disabled={subjectsLoading}
                      onChange={(e) => setSubjectSearch(e.target.value)}
                      className="flex-1 min-w-[160px] bg-transparent outline-none text-[14px] px-2 py-1.5 animate-in fade-in duration-200"
                    />
                  )}
                </div>
              </div>

              <p className="mb-1.5 text-[12px] text-muted-foreground">Gợi ý:</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {!subjectsLoading &&
                    filteredSubjects.map((s) => (
                      <span
                        key={s.id}
                        onClick={() => addSubjectTopic(s)}
                        className="inline-flex items-center rounded-full border border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95"
                      >
                        <Plus className="mr-1 h-3 w-3" /> {s.name}
                      </span>
                    ))}
                  {!subjectsLoading && !subjectSearch && filteredSubjects.length === 0 && (
                      <p className="text-[13px] text-muted-foreground py-2 italic">Không tìm thấy môn học nào phù hợp</p>
                    )}
                    {!subjectsLoading && subjectSearch && filteredSubjects.length === 0 && (
                      <p className="text-[13px] text-muted-foreground py-2 italic">Không tìm thấy môn phù hợp.</p>
                    )}
                    {subjectsLoading && (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-[13px] text-muted-foreground">Đang tải môn học...</span>
                      </div>
                    )}
                  </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTopic();
                      }
                    }}
                    placeholder="Môn học khác"
                    className={Cn(getInputCls(false), "h-11 flex-1")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomTopic}
                    className="h-11 shrink-0 rounded-2xl px-4 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 font-bold text-xs tracking-widest hover:scale-[1.03] active:scale-95 transition-transform"
                  >
                    Thêm
                  </Button>
                </div>
              <FieldError message={errors.topics} />
            </div>

            <div className="space-y-6">
              <div id="level">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Cấp học <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LEVELS.map((lv) => {
                    const isSelected = form.level === lv.value;
                    return (
                      <div
                        key={lv.value}
                        onClick={() => update("level", lv.value)}
                        className={Cn(
                          "cursor-pointer rounded-2xl border-2 p-3 text-center transition-all backdrop-blur-xl",
                          isSelected ? "border-primary bg-primary/5 text-primary" : "border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 text-foreground hover:border-primary/30"
                        )}
                      >
                        <span className="font-semibold text-sm block">{lv.label}</span>
                        <span className="text-[11px] opacity-70">{lv.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div id="grade">
                <label htmlFor="grade-select" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Khối lớp <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={form.grade ? form.grade.toString() : ""}
                  onValueChange={(val) => update("grade", val ? parseInt(val) : null)}
                  items={GRADE_RANGE[form.level].map((g) => ({ value: g.toString(), label: `Lớp ${g}` }))}
                >
                  <SelectTrigger className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 backdrop-blur-xl">
                    <SelectValue placeholder="Chọn khối lớp" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                    {GRADE_RANGE[form.level].map((g) => (
                      <SelectItem key={g} value={g.toString()}>
                        Lớp {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.grade} />
              </div>
            </div>
          </SectionCard>

          <SectionCard index={2} icon={<FileText className="h-4 w-4 text-primary" />} title="Mô tả chi tiết">
            <div id="content">
              <label htmlFor="content-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nội dung <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="content-input"
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                placeholder="Giới thiệu phương pháp dạy, kinh nghiệm, cam kết đầu ra,..."
                className={getInputCls(!!errors.content, true)}
                maxLength={5000}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <FieldError message={errors.content} />
                <span className="text-[12px] text-muted-foreground ml-auto">{form.content.length}/5000</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard index={3} icon={<Laptop2 className="h-4 w-4 text-primary" />} title="Hình thức dạy">
            <div id="mode">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Bạn nhận dạy <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    {
                      value: "ONLINE",
                      label: "Online",
                      desc: "Dạy qua nền tảng học online không cần địa điểm",
                      icon: <Laptop2 className="h-5 w-5 shrink-0" />,
                      selected: "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
                      hover: "hover:border-emerald-500/30",
                    },
                    {
                      value: "OFFLINE",
                      label: "Offline",
                      desc: "Dạy trực tiếp tại khu vực cụ thể",
                      icon: <MapPin className="h-5 w-5 shrink-0" />,
                      selected: "border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400",
                      hover: "hover:border-amber-500/30",
                    },
                  ] as const
                ).map((opt) => {
                  const isSelected = form.mode === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => update("mode", opt.value)}
                      className={Cn(
                        "cursor-pointer rounded-2xl border-2 p-4 transition-all backdrop-blur-xl",
                        isSelected
                          ? opt.selected
                          : Cn("border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 text-foreground", opt.hover)
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span className="font-semibold text-sm">{opt.label}</span>
                      </div>
                      <p className="text-[12px] opacity-70 mt-1.5">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {form.mode === "OFFLINE" && (
              <div className="space-y-4" id="venue">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Địa điểm dạy <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {VENUES.map((opt) => {
                      const isSelected = form.venue === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => update("venue", opt.value)}
                          className={Cn(
                            "cursor-pointer rounded-2xl border-2 p-4 transition-all backdrop-blur-xl",
                            isSelected
                              ? opt.selected
                              : Cn("border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 text-foreground", opt.hover)
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {opt.icon}
                            <span className="font-semibold text-sm">{opt.label}</span>
                          </div>
                          <p className="text-[12px] opacity-70 mt-1.5">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {form.venue === "TUTOR" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="city">
                      <label htmlFor="city-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Tỉnh/Thành phố <span className="text-rose-500">*</span>
                      </label>
                      <input id="city-input" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Nhập tỉnh/thành phố của bạn" className={getInputCls(!!errors.city)} />
                      <FieldError message={errors.city} />
                    </div>
                    <div id="district">
                      <label htmlFor="district-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Quận/Huyện</label>
                      <input id="district-input" value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="Nhập quận/huyện của bạn" className={getInputCls(false)} />
                    </div>
                    <div id="ward">
                      <label htmlFor="ward-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phường/Xã</label>
                      <input id="ward-input" value={form.ward} onChange={(e) => update("ward", e.target.value)} placeholder="Nhập phường/xã của bạn" className={getInputCls(false)} />
                    </div>
                    <div id="street">
                      <label htmlFor="street-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Số nhà, đường</label>
                      <input
                        id="street-input"
                        value={form.street}
                        onChange={(e) => update("street", e.target.value)}
                        placeholder="Nhập số nhà, đường của bạn"
                        className={getInputCls(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          <SectionCard index={4} icon={<Wallet className="h-4 w-4 text-primary" />} title="Học phí">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="from">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Học phí tối thiểu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="VD: 100000"
                    value={form.from > 0 ? form.from.toLocaleString("vi-VN") : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      update("from", val ? parseInt(val) : 0);
                    }}
                    className={Cn(getInputCls(!!errors.from), "pl-10")}
                  />
                </div>
                <FieldError message={errors.from} />
              </div>

              <div id="to">
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Học phí tối đa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="VD: 200.000"
                    value={form.to > 0 ? form.to.toLocaleString("vi-VN") : ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      update("to", val ? parseInt(val) : 0);
                    }}
                    className={Cn(getInputCls(!!errors.to), "pl-10")}
                  />
                </div>
                <FieldError message={errors.to} />
              </div>
            </div>
          </SectionCard>
        </form>
      </TwoColumn>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/10 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] p-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Sẵn sàng chưa?</p>
            <p className="text-xs text-muted-foreground">Kiểm tra kỹ thông tin trước khi đăng</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none rounded-2xl h-12 px-6 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white/30 dark:hover:bg-white/10 transition-all font-bold text-xs tracking-widest shadow-sm"
            >
              Hủy bỏ
            </Button>
            <Button
              size="lg"
              type="submit"
              form="tutor-post-form"
              loading={submitting}
              className="flex-1 sm:flex-none rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-xs tracking-widest transition-all hover:scale-[1.02]"
            >
              Đăng bài ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}