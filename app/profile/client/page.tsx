"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  X,
  Edit,
  ExternalLink,
  CalendarDays,
  MapPin,
  Briefcase,
  UserPlus,
  Sparkles,
  Clock,
  PlusCircle,
  FolderKanban,
  MessageSquare,
  ShoppingBag,
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FullPageLoader } from "@/components/ui/Loader";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { ProfileUrl } from "@/components/profile/ProfileUrl";
import { Combobox } from "@/components/ui/Combobox";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileEmpty } from "@/components/profile/ProfileEmpty";
import { getStudentProfile, updateUserInfo } from "@/lib/api/user";
export type OwnerItem = { alias: string, about: string, locationCity: any, totalProjects: number, hiredFreelancers: number, status: number, created: string };
export type SaveOwnerInfoRequest = any;
export const saveOwnerInfoSchema = { safeParse: (v: any) => ({ success: true, data: v }) } as any;
export const normalizeAlias = (s: string) => s;
const getMyOwnerInfo = async () => {
  const uStr = localStorage.getItem("user");
  if (!uStr) return { code: 401 };
  const user = JSON.parse(uStr);
  try {
    const res = await getStudentProfile(user.id);
    const data = res.data;
    if (!data) return { code: 200, item: null };
    return { code: 200, item: { alias: user.alias || '', about: '', locationCity: data.city ? { id: 1, name: data.city } : null, totalProjects: 0, hiredFreelancers: 0, status: 1, created: user.created } as OwnerItem, message: "" };
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 400) {
      return { code: 200, item: null };
    }
    return { code: 400, message: "Lỗi khi lấy thông tin" };
  }
};
const saveOwnerInfo = async (d: any) => {
  try {
    const r = await updateUserInfo({ alias: d.alias, city: d.city ? "Hà Nội" : undefined });
    return { code: 200, item: r.data, message: "" };
  } catch (e) { return { code: 400, message: "" }; }
};
import Link from "next/link";

type FieldErrors = Partial<Record<"alias" | "about" | "city", string>>;

import { LOGIN_PATH } from "@/lib/auth/session";

function formatJoinedMonthYear(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const month = d.toLocaleDateString("vi-VN", { month: "long" });
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  return `Tháng ${monthCap}, ${d.getFullYear()}`;
}

export default function ClientProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const cities = [] as any[];

  const [owner, setOwner] = useState<OwnerItem | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const [isEditing, setIsEditing] = useState(false);
  const [editAlias, setEditAlias] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editCityId, setEditCityId] = useState<string | null>(null);
  const [aliasTouched, setAliasTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(LOGIN_PATH);
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await getMyOwnerInfo();
        if (cancelled) return;
        if (res.code === 200) {
          setOwner(res.item ?? null);
        } else {
          if ((res as any).message) toast.error((res as any).message);
          setOwner(null);
        }
      } catch (error: unknown) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải hồ sơ.";
        toast.error(message);
        setOwner(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isEditing || !aliasTouched) return;
    const normalized = normalizeAlias(editAlias);
    if (normalized && normalized !== editAlias) {
      setEditAlias(normalized);
    }
  }, [editAlias, aliasTouched, isEditing]);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.name })),
    [cities]
  );

  const handleStartEdit = () => {
    if (!owner) return;
    setEditAlias(owner.alias);
    setEditAbout(owner.about);
    setEditCityId(owner.locationCity ? String(owner.locationCity.id) : null);
    setAliasTouched(false);
    setFieldErrors({});
    setFormError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFieldErrors({});
    setFormError(null);
  };

  const handleSaveEdit = async () => {
    if (!owner) return;
    setFieldErrors({});
    setFormError(null);

    const city = editCityId ? Number(editCityId) : undefined;
    const result = saveOwnerInfoSchema.safeParse({
      alias: editAlias,
      about: (editAbout ?? "").trim() || "",
      city,
    });

    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "alias" || field === "about" || field === "city") {
          nextErrors[field as keyof typeof nextErrors] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      const firstIssue = result.error.issues[0];
      toast.error(firstIssue?.message || "Vui lòng kiểm tra lại thông tin");
      return;
    }

    const body: Partial<SaveOwnerInfoRequest> = {};
    if (result.data.alias && result.data.alias !== owner.alias) {
      body.alias = result.data.alias;
    }
    if ((editAbout ?? "") !== owner.about) {
      body.about = (editAbout ?? "").trim();
    }
    const baselineCityId = owner.locationCity ? String(owner.locationCity.id) : null;
    const newCity = editCityId ? Number(editCityId) : null;
    if (newCity !== null && String(newCity) !== baselineCityId) {
      body.city = newCity;
    }

    if (Object.keys(body).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào.");
      setIsEditing(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await saveOwnerInfo(body as SaveOwnerInfoRequest);
      if (res.code === 200 && res.item) {
        toast.success("Cập nhật hồ sơ thành công!");
        
        const refreshRes = await getMyOwnerInfo();
        if (refreshRes.code === 200) {
          setOwner(refreshRes.item ?? null);
        }
        setIsEditing(false);
      } else {
        setFormError((res as any).message || "Có lỗi xảy ra, vui lòng thử lại.");
        toast.error((res as any).message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosError?.response?.status === 409) {
        const msg = axiosError.response.data?.message || "Alias đã được sử dụng";
        setFormError(msg);
        setFieldErrors((prev) => ({ ...prev, alias: msg }));
        toast.error(msg);
      } else {
        const message =
          error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
        setFormError(message);
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSuccess = async () => {
    setSubmitting(true);
    try {
      const res = await getMyOwnerInfo();
      if (res.code === 200) {
        setOwner(res.item ?? null);
      } else {
        toast.error((res as any).message || "Cập nhật thất bại.");
      }
    } catch {
      toast.error("Không thể làm mới hồ sơ sau khi lưu.");
    } finally {
      setSubmitting(false);
      setShowForm(false);
    }
  };

  if (authLoading || owner === undefined) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isNewMember =
    owner !== null &&
    owner.totalProjects === 0 &&
    owner.hiredFreelancers === 0;
  const isPending = owner !== null && owner.status === 0;
  const userDisplayName = user.name || user.email || "User";

  const breadcrumbList = [
    { name: "Trang chủ", href: "/" },
    { name: "Hồ sơ của tôi", href: "/ho-so" },
  ];

  const isBlocked = owner?.status === -1;

  const ownerStatusConfig: Record<number, { label: string; class: string; icon: typeof CheckCircle2 }> = {
    [-1]: { label: "Bị chặn", class: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: XCircle },
    0: { label: "Chờ duyệt", class: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    1: { label: "Đã duyệt", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  };
  const ownerStatus = owner ? ownerStatusConfig[Number(owner.status) as -1 | 0 | 1] : null;
  const OwnerStatusIcon = ownerStatus?.icon;

  const publicUrl = owner
    ? typeof window !== "undefined"
      ? `${window.location.origin}/client/${owner.alias}`
      : `/client/${owner.alias}`
    : "";

  const joinedText = owner ? formatJoinedMonthYear(owner.created) : null;

  return (
    <div className="min-h-screen bg-transparent pb-28">
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-3 py-4 sm:px-6 lg:px-8">
          <BreadcrumbComponent pathList={breadcrumbList} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 sm:py-10">
        <header className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-1 sm:h-8 sm:w-1.5 rounded-full bg-primary shadow-lg shadow-primary/30" />
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Hồ sơ của tôi
            </h1>
          </div>
        </header>



        {owner === null ? (
          showForm ? (
            <div className="mx-auto max-w-3xl">
              <FormCard
                title="Tạo hồ sơ học sinh/phụ huynh"
                onClose={() => setShowForm(false)}
                submitting={submitting}
              >
                <ProfileForm
                  mode="create"
                  onSuccess={handleSaveSuccess}
                  onCancel={() => setShowForm(false)}
                  submitLabel="Tạo hồ sơ"
                />
              </FormCard>
            </div>
          ) : (
            <ProfileEmpty onCreate={() => setShowForm(true)} />
          )
        ) : (
          <>
            {/* ── View & Edit mode: Banner + Details Grid ── */}
            <div className="relative mb-5 sm:mb-8 overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
              {/* Cover gradient band */}
              <div className="h-20 sm:h-40 md:h-48 w-full bg-linear-to-r from-primary/40 via-purple-500/30 to-blue-500/30 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-32 bg-linear-to-t from-white/90 dark:from-slate-950/80 to-transparent" />
              </div>

              <div className="relative px-4 pb-5 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
                <div className="flex flex-col gap-4 -mt-8 sm:-mt-14 md:-mt-20 md:flex-row md:items-end md:justify-between md:gap-8 min-w-0 w-full">
                  {/* LEFT: avatar + name + status badges */}
                  <div className="flex flex-col items-center gap-4 sm:gap-5 md:flex-row md:items-end md:gap-8 min-w-0 flex-1 w-full md:w-auto">
                    <div className="relative h-16 w-16 sm:h-28 sm:w-28 md:h-40 md:w-40 rounded-[1.25rem] sm:rounded-[1.75rem] md:rounded-[2.2rem] overflow-hidden border-[3px] sm:border-4 border-white dark:border-slate-900 shadow-2xl shrink-0">
                      <Avatar
                        src={user.avatar ?? undefined}
                        alt={userDisplayName}
                        size="xl"
                        className="!h-full !w-full !rounded-none !border-0 !bg-primary !text-white"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3 text-center md:text-left min-w-0 flex-1 w-full">
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 md:justify-start">
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight break-words max-w-full">
                          {userDisplayName}
                        </h1>
                        {ownerStatus && !isEditing && (
                          <div className={`inline-flex items-center gap-1 sm:gap-2 rounded-full border-2 px-2.5 py-0.5 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-black tracking-wider sm:tracking-widest backdrop-blur-md shadow-sm ${ownerStatus.class}`}>
                            {OwnerStatusIcon && (
                              <>
                                <OwnerStatusIcon size={11} strokeWidth={3} className="sm:hidden" />
                                <OwnerStatusIcon size={14} strokeWidth={3} className="hidden sm:inline-block" />
                              </>
                            )}
                            {ownerStatus.label.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Header details tags (only visible in view mode) */}
                      {!isEditing && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 md:justify-start">
                          {owner.locationCity && (
                            <div className="inline-flex items-center gap-1 sm:gap-2 bg-white/60 dark:bg-white/5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100">
                              <MapPin size={11} className="text-primary sm:hidden" />
                              <MapPin size={14} className="text-primary hidden sm:inline-block" />
                              <span className="truncate max-w-[140px] sm:max-w-none">{owner.locationCity.name.toUpperCase()}</span>
                            </div>
                          )}
                          {joinedText && (
                            <div className="inline-flex items-center gap-1 sm:gap-2 bg-white/60 dark:bg-white/5 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 border border-white/40 dark:border-white/10 shadow-sm shadow-slate-100">
                              <CalendarDays size={11} className="text-primary sm:hidden" />
                              <CalendarDays size={14} className="text-primary hidden sm:inline-block" />
                              <span className="truncate max-w-[140px] sm:max-w-none">THAM GIA {joinedText.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {isEditing && (
                        <p className="text-[11px] sm:text-xs text-primary font-bold tracking-wider uppercase">
                          Đang trong chế độ chỉnh sửa thông tin
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Action buttons */}
                  <div className="flex items-stretch sm:items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto justify-center md:justify-end">
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={submitting}
                          onClick={handleCancelEdit}
                          className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 border-rose-200 dark:border-rose-900/30 text-rose-500 bg-transparent hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest whitespace-nowrap"
                        >
                          HỦY BỎ
                        </Button>
                        <Button
                          type="button"
                          disabled={submitting}
                          onClick={handleSaveEdit}
                          className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest transition-all whitespace-nowrap"
                        >
                          LƯU THAY ĐỔI
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href={`/client/${owner.alias}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
                          <Button
                            variant="outline"
                            disabled={isBlocked}
                            className="w-full rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white dark:hover:bg-white/10 transition-all font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest shadow-sm whitespace-nowrap"
                          >
                            <ExternalLink size={13} className="mr-1 sm:mr-2 sm:hidden" />
                            <ExternalLink size={16} className="mr-2 hidden sm:inline-block" />
                            XEM TRANG CÔNG KHAI
                          </Button>
                        </Link>
                        <Button
                          onClick={handleStartEdit}
                          disabled={isBlocked}
                          className="flex-1 sm:flex-initial rounded-lg sm:rounded-2xl h-10 sm:h-12 px-3 sm:px-6 md:px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest transition-all whitespace-nowrap"
                        >
                          <Edit size={13} className="mr-1 sm:mr-2 sm:hidden" />
                          <Edit size={16} className="mr-2 hidden sm:inline-block" />
                          CHỈNH SỬA HỒ SƠ
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Public URL row (only shown in view mode) */}
                {!isEditing && (
                  <div className="mt-5 sm:mt-8 rounded-xl sm:rounded-2xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md p-3 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] text-slate-400 dark:text-slate-500">
                          Đường dẫn trang cá nhân (Public URL)
                        </p>
                        <p className="truncate font-mono text-xs sm:text-sm font-semibold text-foreground">
                          {publicUrl}
                        </p>
                      </div>
                      <ProfileUrl url={publicUrl} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pending alert notification */}
            {isPending && !isEditing && (
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 backdrop-blur-xl shadow-lg shadow-amber-200/20">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-500 shadow-inner border border-amber-500/20">
                  <AlertCircle size={24} className="sm:hidden" />
                  <AlertCircle size={28} className="hidden sm:inline-block" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="font-black text-sm sm:text-base tracking-tight text-amber-900 dark:text-amber-400">
                    Hồ sơ đang chờ phê duyệt
                  </p>
                  <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-amber-800/80 dark:text-amber-400/80 font-medium">
                    Đội ngũ MinaHub đang xác thực thông tin hồ sơ của bạn. Hồ sơ sẽ xuất hiện công khai sau khi được duyệt.
                  </p>
                </div>
              </div>
            )}

            {formError && isEditing && (
              <div
                role="alert"
                className="mb-6 sm:mb-8 flex items-center gap-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-400 backdrop-blur-xl"
              >
                <AlertCircle size={20} className="shrink-0 text-rose-500" />
                <p className="text-sm font-semibold">{formError}</p>
              </div>
            )}

            {/* 2-Column details layout */}
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
              {/* Left Column (2 spans): General info & About */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">

                {/* ── CARD: THÔNG TIN CHUNG (General Info) ── */}
                <Card className="p-5 sm:p-7 md:p-10 space-y-5 sm:space-y-6">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 sm:pb-4">
                    <Info className="w-4 h-4 text-primary" />
                    Thông tin tài khoản chủ dự án
                  </h2>

                  <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                    {/* Alias input */}
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest text-slate-400 ml-1">
                        Tên định danh (Alias URL)
                      </label>
                      {isEditing ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 h-12 px-4 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 focus-within:ring-2 focus-within:ring-primary/50 transition-all backdrop-blur-md">
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono select-none">
                              /client/
                            </span>
                            <input
                              type="text"
                              className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
                              value={editAlias}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\s+/g, "");
                                setEditAlias(val);
                                setAliasTouched(true);
                              }}
                              placeholder="ten-dinh-danh"
                            />
                          </div>
                          {fieldErrors.alias && (
                            <p className="text-xs text-rose-500 font-semibold">{fieldErrors.alias}</p>
                          )}
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Alias định danh viết liền, không dấu, dùng để truy cập trang hồ sơ công khai của bạn.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 h-12 px-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                            {owner.alias}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Location City select */}
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest text-slate-400 ml-1">
                        Khu vực / Thành phố
                      </label>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Combobox
                            value={editCityId}
                            onValueChange={setEditCityId}
                            options={cityOptions}
                            placeholder="Chọn tỉnh/thành phố..."
                          />
                          {fieldErrors.city && (
                            <p className="text-xs text-rose-500 font-semibold">{fieldErrors.city}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 h-12 px-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                          <MapPin size={16} className="text-primary" />
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {owner.locationCity?.name || "Chưa cập nhật"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* ── CARD: GIỚI THIỆU (About Card) ── */}
                <Card className="p-5 sm:p-7 md:p-10 space-y-5 sm:space-y-6">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 sm:pb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Giới thiệu doanh nghiệp / tổ chức
                  </h2>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={6}
                        className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all backdrop-blur-md resize-none text-foreground"
                        value={editAbout ?? ""}
                        onChange={(e) => setEditAbout(e.target.value)}
                        placeholder="Mô tả ngắn gọn về doanh nghiệp, lĩnh vực hoạt động hoặc phong cách hợp tác của bạn..."
                      />
                      <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-400">
                        {fieldErrors.about ? (
                          <p className="text-xs text-rose-500 font-semibold">{fieldErrors.about}</p>
                        ) : (
                          <span />
                        )}
                        <span>{(editAbout ?? "").trim().split(/\s+/).filter(Boolean).length} từ (tối đa 1000 từ)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group rounded-2xl sm:rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 p-5 sm:p-7 md:p-8 transition-all duration-500 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-xl">
                      <div className="absolute -left-1.5 sm:-left-2 top-5 sm:top-8 bottom-5 sm:bottom-8 w-1 sm:w-1.5 bg-linear-to-b from-primary to-purple-500 rounded-full opacity-50" />
                      {owner.about ? (
                        <p className="text-base sm:text-lg leading-[1.7] sm:leading-[1.8] text-slate-600 dark:text-slate-300 whitespace-pre-line font-medium italic pl-2 sm:pl-0">
                          &ldquo;{owner.about}&rdquo;
                        </p>
                      ) : (
                        <p className="text-base sm:text-lg leading-[1.7] sm:leading-[1.8] text-slate-400 dark:text-slate-500 whitespace-pre-line font-medium italic pl-2 sm:pl-0">
                          Chưa có phần giới thiệu. Nhấp vào nút &ldquo;Chỉnh sửa hồ sơ&rdquo; ở phía trên để cập nhật thông tin giới thiệu của bạn.
                        </p>
                      )}
                    </div>
                  )}
                </Card>

              </div>

              {/* Right Column (1 span): Stats & Shortcuts */}
              <div className="space-y-6 sm:space-y-8">

                {/* ── CARD: HOẠT ĐỘNG (Recruitment Stats) ── */}
                <Card className="p-5 sm:p-7 md:p-10 space-y-6 sm:space-y-8">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3 sm:pb-4">
                    <Clock className="w-4 h-4 text-primary" />
                    Hoạt động tuyển dụng
                  </h2>

                  {isNewMember ? (
                    <div className="space-y-3">
                      <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                        Thành viên mới
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Đăng tin tuyển dụng đầu tiên của bạn để bắt đầu hợp tác với các freelancer tài năng.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5 sm:space-y-6">
                      {/* Stat: Hired Projects */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                            {owner.totalProjects}
                          </p>
                          <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Dự án đã đăng
                          </p>
                        </div>
                        <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Briefcase size={18} className="sm:hidden" />
                          <Briefcase size={20} className="hidden sm:inline-block" />
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-white/5" />

                      {/* Stat: Hired Freelancers */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                            {owner.hiredFreelancers}
                          </p>
                          <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Freelancer đã thuê
                          </p>
                        </div>
                        <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <UserPlus size={18} className="sm:hidden" />
                          <UserPlus size={20} className="hidden sm:inline-block" />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* ── CARD: LỐI TẮT QUẢN LÝ (Workspace Shortcuts) ── */}
                <Card className="p-5 sm:p-7 md:p-10 space-y-5 sm:space-y-6">
                  <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5 pb-3 sm:pb-4">
                    Lối tắt quản lý
                  </h2>

                  <div className="space-y-2.5 sm:space-y-3">
                    <Link href="/dang-tin-du-an" className="block">
                      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/40 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/30 dark:hover:bg-primary/10 dark:hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <PlusCircle size={16} className="text-primary group-hover:scale-110 transition-transform shrink-0 sm:hidden" />
                          <PlusCircle size={18} className="text-primary group-hover:scale-110 transition-transform shrink-0 hidden sm:inline-block" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                            Đăng tin dự án mới
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link href="/du-an-cua-toi" className="block">
                      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/40 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/30 dark:hover:bg-primary/10 dark:hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <FolderKanban size={16} className="text-primary group-hover:scale-110 transition-transform shrink-0 sm:hidden" />
                          <FolderKanban size={18} className="text-primary group-hover:scale-110 transition-transform shrink-0 hidden sm:inline-block" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                            Quản lý tin tuyển dụng
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link href="/don-hang" className="block">
                      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/40 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/30 dark:hover:bg-primary/10 dark:hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <ShoppingBag size={16} className="text-primary group-hover:scale-110 transition-transform shrink-0 sm:hidden" />
                          <ShoppingBag size={18} className="text-primary group-hover:scale-110 transition-transform shrink-0 hidden sm:inline-block" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                            Hợp đồng & Đơn hàng
                          </span>
                        </div>
                      </div>
                    </Link>

                    <Link href="/tin-nhan" className="block">
                      <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-lg sm:rounded-xl border border-white/40 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:bg-primary/5 hover:border-primary/30 dark:hover:bg-primary/10 dark:hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <MessageSquare size={16} className="text-primary group-hover:scale-110 transition-transform shrink-0 sm:hidden" />
                          <MessageSquare size={18} className="text-primary group-hover:scale-110 transition-transform shrink-0 hidden sm:inline-block" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                            Tin nhắn & Đề xuất
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </Card>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Card bọc form edit/create - dùng chung cho 2 states (create từ empty state,
 * edit từ preview).
 */
function FormCard({
  title,
  onClose,
  submitting,
  children,
}: {
  title: string;
  onClose: () => void;
  submitting: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/40 dark:border-white/5 px-4 py-4 sm:px-8 sm:py-5 md:px-10">
        <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          disabled={submitting}
          aria-label="Đóng"
          className="rounded-xl"
        >
          <X size={16} />
        </Button>
      </div>
      <div className="p-4 sm:p-7 md:p-10">{children}</div>
    </div>
  );
}
