// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth/session";
import { useAuth } from "@/lib/stores/auth";

import { updateUserInfo, getTutorProfile } from "@/lib/api/user";
const updateCreatorInfo = async (d: any) => ({ code: 200 } as any);
const RequireCreatorAccess = ({children, restrictedProps}: any) => <>{children}</>;
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Combobox } from "@/components/ui/Combobox";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { ProfileEmpty } from "@/components/profile/ProfileEmpty";
import { toast } from "sonner";
import {
  Briefcase,
  ShieldCheck,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutDashboard,
  Check,
  Edit,
  Award,
  Save,
  X,
  Plus,
  Upload
} from "lucide-react";
import { Cn } from "@/lib/utils";
const containsSearchQuery = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase());

const getDegrees = async () => ({ code: 200, items: [] as any[] } as any);


const AVAILABLE_TYPE_OPTIONS = [
  { value: "0", label: "Việc làm dự án" },
  { value: "1", label: "Việc bán thời gian" },
  { value: "2", label: "Việc toàn thời gian" },
];

const AVAILABILITY_OPTIONS = [
  { value: "0", label: "Online" },
  { value: "1", label: "Tại văn phòng" },
];

const FREELANCER_BREADCRUMB = [
  { name: "Trang chủ", href: "/" },
  { name: "Hồ sơ của tôi", href: "/ho-so" },
  { name: "Hồ sơ Gia sư", href: "/ho-so/freelancer" },
];

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon: any }) {
  return (
    <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 mb-4 sm:mb-6 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      {children}
    </h2>
  );
}

function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={Cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 py-3 sm:py-4 border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-white/40 dark:hover:bg-white/5 px-2 -mx-2 rounded-lg min-w-0 w-full", className)}>
      <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-bold text-slate-900 dark:text-white sm:text-right min-w-0 max-w-full break-all sm:break-words truncate sm:whitespace-normal">{value}</span>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest text-slate-400 ml-1">{label}</label>
      {children}
    </div>
  );
}

function TagPicker({
  id,
  title,
  hint,
  selectedIds,
  options,
  search,
  onSearchChange,
  onToggle,
  disabled,
  emptyText,
  error,
}: {
  id: string;
  title: string;
  hint: string;
  selectedIds: number[];
  options: any[];
  search: string;
  onSearchChange: (value: string) => void;
  onToggle: (id: number) => void;
  disabled?: boolean;
  emptyText: string;
  error?: string;
}) {
  const visibleOptions = options.filter((item) =>
    containsSearchQuery(item.name, search)
  );

  return (
    <div id={id} className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <label className="block text-[13px] font-semibold text-foreground">{title}</label>
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        </div>
        <span className="text-xs text-muted-foreground">{selectedIds.length} đã chọn</span>
      </div>

      <div
        className={Cn(
          "rounded-2xl border bg-white/40 dark:bg-white/5 p-4 focus-within:ring-2 backdrop-blur-md transition-all",
          error
            ? "border-destructive/50 focus-within:ring-destructive/20 focus-within:border-destructive"
            : "border-slate-200 dark:border-white/10 focus-within:ring-primary/20 focus-within:border-primary"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const item = options.find((opt) => opt.id === id);
            if (!item) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {item.name}
                <X size={14} />
              </button>
            );
          })}
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={disabled ? emptyText : "Tìm kiếm để thêm..."}
            disabled={disabled}
            className="min-w-[180px] flex-1 bg-transparent px-2 py-1 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
        {disabled ? (
          <p className="py-2 text-sm italic text-muted-foreground">{emptyText}</p>
        ) : visibleOptions.length === 0 ? (
          <p className="py-2 text-sm italic text-muted-foreground">Không có kết quả phù hợp.</p>
        ) : (
          visibleOptions
            .filter((item) => !selectedIds.includes(item.id))
            .slice(0, 40)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 px-3.5 py-1.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/10 hover:scale-[1.02] backdrop-blur-sm"
              >
                <Sparkles size={14} className="mr-1.5 text-muted-foreground" />
                {item.name}
              </button>
            ))
        )}
      </div>
    </div>
  );
}
const inputClass = "w-full h-12 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md";

export default function FreelancerProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const categories: any[] = []; const cities: any[] = []; const fetchGeneralData = async () => {}; const fetchServices = async (d: any) => {}; const fetchSkills = async (d: any) => {}; const generalLoading = false;

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [showFrontId, setShowFrontId] = useState(false);
  const [showBackId, setShowBackId] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  // Form states
  const [form, setForm] = useState({
    alias: "",
    bio: "",
    level: "",
    major: "",
    school: "",
    exp: 0,
    rate: 0,
    city: 0,
    skills: [] as number[],
  });

  const [kycFile, setKycFile] = useState<File | null>(null);
  const [frontIdFile, setFrontIdFile] = useState<File | null>(null);
  const [backIdFile, setBackIdFile] = useState<File | null>(null);
  
  const [previews, setPreviews] = useState({
    kyc: "",
    front: "",
    back: ""
  });

  const [skillOptions, setSkillOptions] = useState<any[]>([]);

  // Check lỗi ảnh đại diện
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchGeneralData();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(LOGIN_PATH);
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if ((user as any)?.tutor) {
      setPreviews({
        kyc: (user as any)?.tutor?.kycImage || "",
        front: (user as any)?.tutor?.frontIdImage || "",
        back: (user as any)?.tutor?.backIdImage || ""
      });
    }
  }, [user]);

  // Handle mode toggle and data initialization
  const startEditing = () => {
    if (!(user as any)?.tutor) return;
    setForm({
      alias: (user as any)?.tutor?.alias || "",
      bio: (user as any)?.tutor?.bio || "",
      level: (user as any)?.tutor?.level || "",
      major: (user as any)?.tutor?.major || "",
      school: (user as any)?.tutor?.school || "",
      exp: (user as any)?.tutor?.exp || 0,
      rate: Number((user as any)?.tutor?.rate) || 0,
      city: (user as any)?.tutor?.city || 0,
      skills: (user as any)?.tutor?.skills?.map((s: any) => s.id) || [],
    });
    setSkillSearch("");
    setPreviews({
      kyc: (user as any)?.tutor?.kycImage || "",
      front: (user as any)?.tutor?.frontIdImage || "",
      back: (user as any)?.tutor?.backIdImage || ""
    });
    setIsEditing(true);
  };

  const handleToggleSkill = (skillId: number) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  // Load skills dynamically if needed
  useEffect(() => {
    if (!isEditing) return;
    // Assuming skills can be fetched globally without depending on a 'service'
    fetchSkills({}).then((res: any) => {
      setSkillOptions(res);
      setSkillSearch("");
    });
  }, [isEditing]);

  if (!(user as any)?.tutor) {
    return (<div className="max-w-3xl mx-auto py-12 px-4 sm:px-6"><ProfileEmpty onCreate={() => setIsEditing(true)} /></div>);
  }
  const isBlocked = (user as any)?.tutor?.status === -1;
  const isPending = (user as any)?.tutor?.status === 0;
  const statusConfig = {
    0: { label: "Chờ duyệt", icon: Clock, class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    1: { label: "Đã duyệt", icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    2: { label: "Từ chối", icon: XCircle, class: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  };

  const creatorStatus = (user as any)?.tutor ? Number((user as any)?.tutor?.status) : null;
  const currentStatus = statusConfig[creatorStatus as keyof typeof statusConfig] || statusConfig[0];
  const StatusIcon = currentStatus.icon;

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        kycImage: kycFile || previews.kyc,
        frontIdImage: frontIdFile || previews.front,
        backIdImage: backIdFile || previews.back
      };
      
      await updateCreatorInfo(payload);
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
      window.location.reload(); // Refresh to get updated user data from store
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'kyc' | 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const previewUrl = URL.createObjectURL(file);
    if (type === 'kyc') {
      setKycFile(file);
      setPreviews(p => ({ ...p, kyc: previewUrl }));
    } else if (type === 'front') {
      setFrontIdFile(file);
      setPreviews(p => ({ ...p, front: previewUrl }));
    } else {
      setBackIdFile(file);
      setPreviews(p => ({ ...p, back: previewUrl }));
    }
  };

  return (<RequireCreatorAccess
      restrictedProps={{
        icon: Briefcase,
        title: "Chưa có hồ sơ freelancer",
        description:
          "Hãy bắt đầu hành trình của bạn tại MinaHub bằng cách tạo một hồ sơ freelancer chuyên nghiệp để tiếp cận hàng ngàn dự án hấp dẫn.",
        ctaLabel: "Tạo hồ sơ ngay",
      }}
    >
    <div className="min-h-screen bg-transparent pb-28">
      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8">
          <BreadcrumbComponent pathList={FREELANCER_BREADCRUMB} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 sm:py-10">
        {/* ── Page header ─────────────────────────────────────────── */}
        <header className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 sm:h-8 sm:w-1.5 rounded-full bg-primary shadow-lg shadow-primary/30" />
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Hồ sơ Gia sư
            </h1>
          </div>
        </header>

        {/* Premium Header Banner */}
      <div className="relative mb-5 sm:mb-8 overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="h-20 sm:h-40 md:h-48 w-full bg-linear-to-r from-primary/40 via-purple-500/30 to-blue-500/30 relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-linear-to-t from-white/90 dark:from-slate-950/80 to-transparent" />
        </div>

        <div className="relative px-4 pb-5 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-5 md:gap-8">
                <div className="relative h-16 w-16 sm:h-28 sm:w-28 md:h-40 md:w-40 rounded-full overflow-hidden border-[3px] sm:border-4 border-white dark:border-slate-900 shadow-2xl shrink-0 -mt-8 sm:-mt-14 md:-mt-20">
                  {user?.avatar && !error? (
                    <img src={user?.avatar} alt={user?.name} className="h-full w-full object-cover" onError={() => setError(true)}/>
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center text-white text-2xl sm:text-4xl md:text-5xl font-black">
                      {user?.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="text-center md:text-left space-y-2 sm:space-y-3 min-w-0 flex-1 translate-y-2 sm:translate-y-3 md:translate-y-4">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 md:gap-4">
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight break-words">{user?.name}</h1>
                    <div className={Cn("inline-flex items-center gap-1 sm:gap-2 rounded-full border-2 px-2.5 py-0.5 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-black tracking-wider sm:tracking-widest backdrop-blur-md shadow-sm", currentStatus.class)}>
                      <StatusIcon size={11} strokeWidth={3} className="sm:hidden" />
                      <StatusIcon size={14} strokeWidth={3} className="hidden sm:inline-block" />
                      {currentStatus.label.toUpperCase()}
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="w-full max-w-md mx-auto md:mx-0">
                      <input
                        className={inputClass}
                        value={form.major}
                        onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                        placeholder="Chuyên ngành..."
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-2 bg-white/60 dark:bg-white/5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100">
                        <Briefcase size={11} className="text-primary sm:hidden" />
                        <Briefcase size={14} className="text-primary hidden sm:inline-block" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{((user as any)?.tutor?.major || "CHƯA CẬP NHẬT").toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 bg-white/60 dark:bg-white/5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100">
                        <Award size={11} className="text-amber-500 sm:hidden" />
                        <Award size={14} className="text-amber-500 hidden sm:inline-block" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{((user as any)?.tutor?.level === "STUDENT" ? "SINH VIÊN" : (user as any)?.tutor?.level === "TEACHER" ? "GIÁO VIÊN" : "CHƯA PHÂN LOẠI")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-stretch sm:items-center justify-center gap-2 sm:gap-3 md:gap-4 w-full md:w-auto">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 border-rose-200 dark:border-rose-900/30 text-rose-500 bg-transparent hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest whitespace-nowrap"
                    >
                      <X size={13} className="mr-1 sm:mr-2 sm:hidden" />
                      <X size={16} className="mr-2 hidden sm:inline-block" />
                      HỦY
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={submitting}
                      className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest transition-all whitespace-nowrap"
                    >
                      {submitting ? <Clock className="animate-spin mr-1 sm:mr-2" size={13} /> : <Save size={13} className="mr-1 sm:mr-2 sm:hidden" />}
                      {submitting ? null : <Save size={16} className="mr-2 hidden sm:inline-block" />}
                      LƯU THAY ĐỔI
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={startEditing}
                      disabled={isPending}
                      className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest shadow-sm whitespace-nowrap"
                    >
                      <Edit size={13} className="mr-1 sm:mr-2 sm:hidden" />
                      <Edit size={16} className="mr-2 hidden sm:inline-block" />
                      CHỈNH SỬA
                    </Button>
                    <Button
                      onClick={() => router.push("/ho-so/tutor/portfolio")}
                      disabled={isPending}
                      className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest transition-all whitespace-nowrap"
                    >
                      <LayoutDashboard size={13} className="mr-1 sm:mr-2 sm:hidden" />
                      <LayoutDashboard size={16} className="mr-2 hidden sm:inline-block" />
                      PORTFOLIO
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Notification for Pending */}
        {String((user as any)?.tutor?.status) === "0" && !isEditing && (
          <div className="mb-6 sm:mb-8 block">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 backdrop-blur-xl shadow-lg shadow-amber-200/20">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-500 shadow-inner border border-amber-500/20">
                <AlertCircle size={24} className="sm:hidden" />
                <AlertCircle size={28} className="hidden sm:inline-block" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="font-black text-sm sm:text-base tracking-tight text-amber-900 dark:text-amber-400">Hồ sơ đang chờ phê duyệt</p>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-amber-800/80 dark:text-amber-400/80 font-medium">Chuyên gia của MinaHub đang xác thực thông tin của bạn. Hồ sơ sẽ xuất hiện trên bảng tin sau khi được duyệt.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-3 min-w-0 w-full">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10 min-w-0 w-full">
            <Card className="p-0 overflow-hidden border-white/60 dark:border-white/5 min-w-0 w-full">
              <div className="p-5 sm:p-7 md:p-10 space-y-8 sm:space-y-10">
                <div className="space-y-8 sm:space-y-10 md:space-y-12">
                  <div className="space-y-6 sm:space-y-8">
                    <SectionTitle icon={Briefcase}>Thông tin chuyên môn</SectionTitle>
                    {isEditing ? (
                      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                        <EditField label="Tên định danh (URL hồ sơ)">
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                              /tutor/
                            </span>
                            <input
                              className={Cn(inputClass, "pl-[5.5rem] font-mono text-sm")}
                              value={form.alias}
                              onChange={e => {
                                const normalized = e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-");
                                setForm(f => ({ ...f, alias: normalized }));
                              }}
                              placeholder="nguyen-van-a"
                              maxLength={50}
                              spellCheck={false}
                              autoCapitalize="off"
                              autoCorrect="off"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            URL hồ sơ công khai:&nbsp;
                            <span className="font-mono text-primary">{process.env.NEXT_PUBLIC_APP_URL || "https://learnix.vn"}/tutor/{form.alias || "..."}</span>.
                            Chỉ gồm chữ thường, số, gạch ngang (-), gạch dưới (_) và tối đa 40 kí tự.
                          </p>
                          {form.alias !== ((user as any)?.tutor?.alias || "") && (
                            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 leading-relaxed">
                              ⚠ Đổi alias sẽ phá vỡ các link cũ đang trỏ tới hồ sơ của bạn.
                            </p>
                          )}
                        </EditField>
                        <EditField label="Trình độ">
                          <select
                            className={inputClass}
                            value={form.level}
                            onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                          >
                            <option value="">Chọn trình độ</option>
                            <option value="STUDENT">Sinh viên</option>
                            <option value="TEACHER">Giáo viên</option>
                            <option value="PROFESSIONAL">Người đi làm</option>
                          </select>
                        </EditField>
                        <EditField label="Chuyên ngành">
                          <input 
                            type="text"
                            className={inputClass}
                            value={form.major}
                            onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                            placeholder="VD: Sư phạm Toán"
                          />
                        </EditField>
                        <EditField label="Trường học/Đơn vị công tác">
                          <input 
                            type="text"
                            className={inputClass}
                            value={form.school}
                            onChange={e => setForm(f => ({ ...f, school: e.target.value }))}
                            placeholder="VD: Đại học Sư phạm HN"
                          />
                        </EditField>
                        <EditField label="Kinh nghiệm (năm)">
                          <input 
                            type="number"
                            className={inputClass}
                            value={form.exp || ""}
                            onChange={e => setForm(f => ({ ...f, exp: Number(e.target.value) }))}
                            placeholder="VD: 3"
                          />
                        </EditField>
                        <EditField label="Học phí (VNĐ/giờ)">
                          <input 
                            type="text"
                            inputMode="numeric"
                            className={inputClass}
                            value={form.rate > 0 ? form.rate.toLocaleString("vi-VN") : ""}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, "");
                              setForm(f => ({ ...f, rate: raw ? Number(raw) : 0 }));
                            }}
                            placeholder="VD: 150.000"
                          />
                        </EditField>
                      </div>
                    ) : (
                      <div className="grid gap-x-6 sm:gap-x-12 gap-y-2 grid-cols-1 md:grid-cols-2 min-w-0 w-full">
                        <InfoRow
                          label="URL hồ sơ"
                          value={
                            <a
                              href={typeof window !== "undefined" ? `${window.location.origin}/tutor/${(user as any)?.tutor?.alias}` : ""}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-primary hover:underline break-all"
                            >
                              {process.env.NEXT_PUBLIC_APP_URL || "https://learnix.vn"}/tutor/{(user as any)?.tutor?.alias}
                            </a>
                          }
                        />
                        <InfoRow label="Trình độ" value={(user as any)?.tutor?.level === "STUDENT" ? "Sinh viên" : (user as any)?.tutor?.level === "TEACHER" ? "Giáo viên" : (user as any)?.tutor?.level === "PROFESSIONAL" ? "Người đi làm" : "Chưa cập nhật"} />
                        <InfoRow label="Chuyên ngành" value={(user as any)?.tutor?.major || "Chưa cập nhật"} />
                        <InfoRow label="Trường học/Đơn vị" value={(user as any)?.tutor?.school || "Chưa cập nhật"} />
                        <InfoRow label="Kinh nghiệm" value={((user as any)?.tutor?.exp || 0) + " năm"} />
                        <InfoRow label="Học phí" value={<span className="text-primary font-black text-lg">{Number((user as any)?.tutor?.rate || 0).toLocaleString("vi-VN")} đ / buổi</span>} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 md:pt-10 border-t border-slate-100 dark:border-white/5">
                    <SectionTitle icon={Sparkles}>Câu chuyện nghề nghiệp</SectionTitle>
                    {isEditing ? (
                      <textarea 
                        className={Cn(inputClass, "min-h-40 py-4")}
                        value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="Hãy chia sẻ thêm về kinh nghiệm và phong cách làm việc của bạn..."
                      />
                    ) : (
                      <div className="relative group p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 transition-all duration-500 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl overflow-hidden">
                        <div className="absolute -left-1.5 sm:-left-2 top-5 sm:top-8 bottom-5 sm:bottom-8 w-1 sm:w-1.5 bg-linear-to-b from-primary to-purple-500 rounded-full opacity-50" />
                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-base sm:text-lg leading-[1.7] sm:leading-[1.8] text-slate-600 dark:text-slate-300 whitespace-pre-line italic font-medium pl-2 sm:pl-0 break-words max-w-full">
                            &ldquo;{(user as any)?.tutor?.bio || "Chưa có giới thiệu..."}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 md:pt-10 border-t border-slate-100 dark:border-white/5">
                  <SectionTitle icon={Briefcase}>Kỹ năng (Môn dạy)</SectionTitle>
                  {isEditing ? (
                    <div className="space-y-6">
                      <TagPicker
                        id="skills"
                        title="Kỹ năng chuyên môn"
                        hint="Chọn các kỹ năng/môn học phù hợp nhất với hồ sơ của bạn."
                        selectedIds={form.skills}
                        options={skillOptions}
                        search={skillSearch}
                        onSearchChange={setSkillSearch}
                        onToggle={handleToggleSkill}
                        emptyText="Không có dữ liệu kỹ năng."
                      />
                    </div>
                  ) : (
                    <div className="space-y-6 sm:space-y-8 md:space-y-10">
                      <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-slate-50 dark:border-white/5">
                        {(user as any)?.tutor?.skills?.length > 0 ? (
                          (user as any)?.tutor?.skills.map((skill: any) => (
                            <Badge key={skill.id} variant="default" className="rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent font-black text-[10px] sm:text-xs tracking-wider shadow-md">
                              {skill.name?.toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-400 italic">Chưa có kỹ năng.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <Card className="p-5 sm:p-7 md:p-10 space-y-6 sm:space-y-8 md:space-y-10 border-white/60 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl">
              <SectionTitle icon={ImageIcon}>Định danh & Tin cậy (KYC)</SectionTitle>
              <div className="space-y-6 sm:space-y-8 md:space-y-10">
                <div className="group relative">
                  <p className="mb-3 sm:mb-4 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 dark:text-slate-500">Chân dung định danh</p>
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/60 dark:border-white/10 shadow-lg">
                    <img src={previews.kyc || "https://placehold.co/400x500?text=No+KYC"} alt="Ảnh KYC" className="aspect-[4/5] w-full object-cover" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:gap-6 md:gap-8">
                  <div className="group relative">
                    <p className="mb-3 sm:mb-4 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 dark:text-slate-500">CCCD mặt trước</p>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                      <img
                        src={previews.front || "https://placehold.co/600x400?text=CCCD+Front"}
                        alt="CCCD mặt trước"
                        className={`aspect-[3/2] w-full object-cover transition-all duration-700 ${showFrontId ? "blur-0" : "blur-xl"}`}
                      />
                      {!showFrontId && (
                        <button
                          type="button"
                          onClick={() => setShowFrontId(true)}
                          aria-label="Hiện ảnh CCCD mặt trước"
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm cursor-pointer"
                        >
                          <ShieldCheck size={28} className="text-white mb-2 opacity-90 sm:hidden" />
                          <ShieldCheck size={32} className="text-white mb-2 opacity-80 hidden sm:inline-block" />
                          <span className="text-[10px] sm:text-xs font-bold text-white tracking-widest bg-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg">NHẤN ĐỂ XEM</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="group relative">
                    <p className="mb-3 sm:mb-4 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-400 dark:text-slate-500">CCCD mặt sau</p>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                      <img
                        src={previews.back || "https://placehold.co/600x400?text=CCCD+Back"}
                        alt="CCCD mặt sau"
                        className={`aspect-[3/2] w-full object-cover transition-all duration-700 ${showBackId ? "blur-0" : "blur-xl"}`}
                      />
                      {!showBackId && (
                        <button
                          type="button"
                          onClick={() => setShowBackId(true)}
                          aria-label="Hiện ảnh CCCD mặt sau"
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm cursor-pointer"
                        >
                          <ShieldCheck size={28} className="text-white mb-2 opacity-90 sm:hidden" />
                          <ShieldCheck size={32} className="text-white mb-2 opacity-80 hidden sm:inline-block" />
                          <span className="text-[10px] sm:text-xs font-bold text-white tracking-widest bg-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-lg">NHẤN ĐỂ XEM</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </RequireCreatorAccess>
  );
}
