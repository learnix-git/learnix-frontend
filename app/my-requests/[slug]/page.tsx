"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    ArrowUpRight,
    Banknote,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock,
    Edit2,
    Eye,
    EyeOff,
    FileText,
    GraduationCap,
    Loader2,
    MapPin,
    MessageSquare,
    Monitor,
    Send,
    Trash2,
    Users,
    BookOpen,
} from "lucide-react";

import { getRequest, getMyRequests, updateRequest, deleteRequest } from "@/lib/api/request";
import type { RequestModel } from "@/lib/api/types";
import { Cn, FormatMoney } from "@/lib/utils";
import { useAuth } from "@/lib/stores/auth";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { Switch } from "@/components/ui/Switch";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(date?: string | null) {
    if (!date) return "Chưa cập nhật";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtMoney(n: number | string) {
    const num = Number(n);
    if (isNaN(num) || num === 0) return "Thỏa thuận";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
    return `${num}`;
}

function getStatusMeta(status: string) {
    switch (status) {
        case "OPEN":
            return { label: "Đang tuyển", variant: "success" as const, dotClass: "bg-emerald-500" };
        case "HOLD":
            return { label: "Tạm dừng", variant: "warning" as const, dotClass: "bg-amber-500" };
        case "DONE":
            return { label: "Hoàn thành", variant: "secondary" as const, dotClass: "bg-slate-500" };
        case "CANCEL":
            return { label: "Đã hủy", variant: "warning" as const, dotClass: "bg-rose-500" };
        default:
            return { label: status, variant: "secondary" as const, dotClass: "bg-slate-400" };
    }
}

const LEVEL_MAP: Record<string, string> = {
    PRIMARY: "Tiểu học",
    MIDDLE: "Trung học cơ sở",
    HIGH: "Trung học phổ thông",
    ALL: "Tất cả cấp",
};
const MODE_MAP: Record<string, string> = {
    ONLINE: "Online",
    OFFLINE: "Offline",
};
const UNIT_MAP: Record<string, string> = {
    PER_SESSION: "buổi",
    PER_MONTH: "tháng",
};
const SLOT_MAP: Record<string, string> = {
    MORNING: "Sáng",
    AFTERNOON: "Chiều",
    EVENING: "Tối",
};
const DAY_MAP: Record<number, string> = {
    1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7", 7: "CN",
};

// ─────────────────────────────────────────────────────────────────────────────
// InfoTile
// ─────────────────────────────────────────────────────────────────────────────

function InfoTile({ icon: Icon, label, value, iconClassName }: { icon: any; label: string; value: string; iconClassName?: string }) {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="flex min-w-0 items-center gap-2 text-[12px] font-bold text-muted-foreground">
                <Icon className={Cn("h-3.5 w-3.5 shrink-0", iconClassName)} />
                <span className="truncate">{label}</span>
            </div>
            <div className="mt-1 truncate text-[13px] font-bold text-foreground" title={value}>
                {value}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function DetailSkeleton() {
    return (
        <div className="min-h-screen bg-transparent pb-24">
            <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
                <div className="max-w-[1280px] mx-auto px-4 py-4">
                    <Skeleton className="h-5 w-64" />
                </div>
            </div>
            <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-5">
                <Card className="p-5 sm:p-6">
                    <Skeleton className="mb-4 h-10 w-28 rounded-xl" />
                    <Skeleton className="mb-3 h-8 w-4/5" />
                    <Skeleton className="mb-5 h-4 w-3/5" />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Skeleton className="h-16 rounded-2xl" />
                        <Skeleton className="h-16 rounded-2xl" />
                        <Skeleton className="h-16 rounded-2xl" />
                    </div>
                </Card>
                {[1, 2].map((i) => (
                    <Card key={i} className="p-5">
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "pending" | "accepted" | "rejected";

const TABS: Array<{ id: Tab; label: string; dot: string }> = [
    { id: "pending", label: "Chờ xác nhận", dot: "bg-amber-500" },
    { id: "accepted", label: "Đã chấp nhận", dot: "bg-emerald-500" },
    { id: "rejected", label: "Đã từ chối", dot: "bg-rose-500" },
];

// Placeholder tutor applications — will be replaced when backend supports it
type TutorApp = {
    id: string;
    tutor: {
        id: string;
        name: string;
        avatar: string | null;
        alias: string | null;
        rating: number;
        reviews: number;
    };
    message: string;
    price: number;
    unit: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
};

function TutorAppCard({ app, onChat, onAccept, onReject }: { app: TutorApp; onChat: () => void; onAccept: () => void; onReject: () => void }) {
    const statusMeta = {
        pending: { label: "Chờ duyệt", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
        accepted: { label: "Đã chấp nhận", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
        rejected: { label: "Đã từ chối", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
    }[app.status];
    return (
        <div className="group rounded-3xl border border-white/60 dark:border-white/10 bg-white/55 dark:bg-white/5 p-5 backdrop-blur-2xl shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <Link href={`/tutor/${app.tutor.alias || app.tutor.id}`} className="shrink-0">
                    <Avatar
                        src={app.tutor.avatar || undefined}
                        alt={app.tutor.name}
                        className="h-12 w-12 rounded-2xl border border-white/40 dark:border-white/10 shadow-sm"
                    />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link href={`/tutor/${app.tutor.alias || app.tutor.id}`} className="text-[15px] font-bold text-foreground hover:text-primary transition-colors">
                            {app.tutor.name}
                        </Link>
                        <span className={Cn("px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border", statusMeta.cls)}>
                            {statusMeta.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-3">
                        <span className="font-bold text-amber-500">★ {app.tutor.rating.toFixed(1)}</span>
                        <span>{app.tutor.reviews} đánh giá</span>
                    </div>
                    {app.message && (
                        <p className="text-[13px] text-foreground/80 leading-relaxed mb-3 line-clamp-3">{app.message}</p>
                    )}
                    <div className="flex items-center gap-2 text-[13px] font-bold text-purple-500 dark:text-purple-400">
                        <Banknote className="h-3.5 w-3.5" />
                        {fmtMoney(app.price)}₫/{UNIT_MAP[app.unit] || app.unit}
                    </div>
                </div>
                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <button onClick={onChat} className="h-9 w-9 rounded-xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-500 hover:text-primary hover:border-primary/30 flex items-center justify-center transition-all cursor-pointer" title="Nhắn tin">
                        <MessageSquare size={14} />
                    </button>
                    {app.status === "pending" && (
                        <>
                            <button onClick={onAccept} className="h-9 w-9 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-all cursor-pointer" title="Chấp nhận">
                                <CheckCircle2 size={14} />
                            </button>
                            <button onClick={onReject} className="h-9 w-9 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-all cursor-pointer" title="Từ chối">
                                <Trash2 size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MyRequestDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const slug = params.slug as string;
    const { user } = useAuth();

    const initialTab = (searchParams.get("tab") as Tab | null) || "pending";
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [request, setRequest] = useState<RequestModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Placeholder apps (will be replaced when apply API is available)
    const apps: TutorApp[] = [];
    const appGroups = {
        pending: apps.filter((a) => a.status === "pending"),
        accepted: apps.filter((a) => a.status === "accepted"),
        rejected: apps.filter((a) => a.status === "rejected"),
    };

    const loadRequest = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const res = await getRequest(slug);
            if (res.data) {
                setRequest(res.data);
            } else {
                toast.error("Không thể tải thông tin yêu cầu");
            }
        } catch {
            toast.error("Không thể tải thông tin yêu cầu");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadRequest();
    }, [loadRequest]);

    useEffect(() => {
        const tab = searchParams.get("tab") as Tab | null;
        if (tab && TABS.some((t) => t.id === tab)) setActiveTab(tab);
    }, [searchParams]);

    const handleToggleStatus = async () => {
        if (!request || togglingStatus) return;
        const nextStatus = request.status === "OPEN" ? "HOLD" : "OPEN";
        setTogglingStatus(true);
        try {
            await updateRequest(request.id, { status: nextStatus } as any);
            toast.success(nextStatus === "OPEN" ? "Đã mở nhận ứng tuyển" : "Đã tạm dừng nhận ứng tuyển");
            setRequest((prev) => prev ? { ...prev, status: nextStatus } : prev);
        } catch {
            toast.error("Không thể thay đổi trạng thái");
        } finally {
            setTogglingStatus(false);
        }
    };

    const handleDelete = async () => {
        if (!request || deleting) return;
        if (!confirm("Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá yêu cầu này?")) return;
        setDeleting(true);
        try {
            await deleteRequest(request.id);
            toast.success("Đã xoá yêu cầu tìm gia sư!");
            router.push("/my-requests");
        } catch {
            toast.error("Không thể xoá yêu cầu");
        } finally {
            setDeleting(false);
        }
    };

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        router.replace(`/my-requests/${slug}?tab=${tab}`, { scroll: false });
    };

    // ── Loading ──
    if (loading) return <DetailSkeleton />;

    // ── Not found ──
    if (!request) {
        return (
            <div className="min-h-screen bg-transparent pb-24">
                <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
                    <div className="max-w-[1280px] mx-auto px-4 py-4">
                        <BreadcrumbComponent pathList={[{ name: "Trang chủ", href: "/" }, { name: "Yêu cầu của tôi", href: "/my-requests" }, { name: "Không tìm thấy", href: "#" }]} />
                    </div>
                </div>
                <div className="max-w-[1280px] mx-auto px-4 py-8">
                    <Card className="p-10 text-center">
                        <p className="mb-2 text-lg font-bold">Không tìm thấy yêu cầu</p>
                        <Link href="/my-requests" className="text-sm font-semibold text-primary hover:underline">Quay lại danh sách</Link>
                    </Card>
                </div>
            </div>
        );
    }

    const status = getStatusMeta(request.status);
    const isOpen = request.status === "OPEN";
    const budgetStr = Number(request.from) === 0 && Number(request.to) === 0
        ? "Thỏa thuận"
        : `${fmtMoney(request.from)} – ${fmtMoney(request.to)}₫/${UNIT_MAP[request.unit] || request.unit}`;
    const topicsStr = request.topics?.map((t) => t.topic?.name || t.custom).filter(Boolean).join(", ") || "Chưa phân loại";
    const gradesStr = request.grades?.length ? `Lớp ${request.grades.join(", ")}` : "—";
    const daysStr = request.days?.length ? request.days.map((d) => DAY_MAP[d] || `T${d}`).join(", ") : "Linh hoạt";

    return (
        <div className="min-h-screen bg-transparent pb-24">
            {/* ═══ BREADCRUMB ═══ */}
            <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
                <div className="max-w-[1280px] mx-auto px-4 py-4">
                    <BreadcrumbComponent pathList={[
                        { name: "Trang chủ", href: "/" },
                        { name: "Yêu cầu của tôi", href: "/my-requests" },
                        { name: request.title, href: "#" },
                    ]} />
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 py-6 sm:py-8">
                {/* ═══ HEADER ═══ */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-row items-center gap-3">
                        <div className="h-7 w-1.5 shrink-0 rounded-full bg-primary sm:h-8" />
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none sm:text-3xl">
                            Chi tiết yêu cầu
                        </h1>
                    </div>
                </div>

                <div className="space-y-5 sm:space-y-6">
                    {/* ═══ MAIN INFO CARD ═══ */}
                    <div className="rounded-3xl border border-white/60 bg-white/55 p-4 shadow-lg shadow-slate-200/60 backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:p-6">
                        {/* Action Bar */}
                        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <Link href="/my-requests">
                                <Button variant="ghost" className="h-10 rounded-xl px-3 text-[13px] font-bold text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="h-4 w-4" />
                                    Quay lại
                                </Button>
                            </Link>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                                <Button
                                    onClick={() => toast.success("Tính năng mời gia sư sẽ sớm ra mắt!")}
                                    className="h-10 w-full rounded-xl px-4 text-[13px] font-bold sm:w-auto"
                                >
                                    <Send className="h-4 w-4" />
                                    Mời gia sư
                                </Button>
                                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:contents">
                                    <label
                                        className={Cn(
                                            "inline-flex h-10 min-w-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white/70 px-3 text-[13px] font-bold transition-colors dark:border-white/10 dark:bg-white/5 sm:justify-start sm:gap-3",
                                            isOpen
                                                ? "hover:border-rose-500/30"
                                                : "hover:border-primary/30",
                                            (togglingStatus || (request.status !== "OPEN" && request.status !== "HOLD")) &&
                                            "pointer-events-none opacity-60"
                                        )}
                                    >
                                        <span className="min-w-0 truncate text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                                            {isOpen ? "Đang nhận" : "Đã ngừng nhận"}
                                        </span>
                                        <Switch
                                            checked={isOpen}
                                            onCheckedChange={handleToggleStatus}
                                            disabled={togglingStatus || (request.status !== "OPEN" && request.status !== "HOLD")}
                                            aria-label={isOpen ? "Đang nhận ứng tuyển - tắt để ngừng" : "Đã ngừng nhận ứng tuyển - bật để nhận lại"}
                                        />
                                        {togglingStatus && (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                        )}
                                    </label>
                                    <Link href={`/requests/${request.id}`} className="w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            className="h-10 w-full rounded-xl border-slate-200 bg-white/70 px-4 text-[13px] font-bold hover:border-primary/30 dark:border-white/10 dark:bg-white/5"
                                        >
                                            Xem tin đăng
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    <Link href={`/client-post?edit=${request.id}`} className="w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            className="h-10 w-full rounded-xl border-slate-200 bg-white/70 px-4 text-[13px] font-bold hover:border-primary/30 dark:border-white/10 dark:bg-white/5 gap-2"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            Chỉnh sửa
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="h-10 w-full rounded-xl border-slate-200 bg-white/70 px-4 text-[13px] font-bold hover:border-rose-500/30 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 sm:w-auto"
                                    >
                                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Xoá yêu cầu
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-5">
                            <div className="space-y-3">
                                {/* Status badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={status.variant} className="gap-1.5">
                                        <span className={Cn("h-1.5 w-1.5 rounded-full", status.dotClass)} />
                                        {status.label}
                                    </Badge>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        Đăng {formatDate(request.created)}
                                    </span>
                                    {request.updated && request.updated !== request.created && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            Cập nhật {formatDate(request.updated)}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h2 className="m-0 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl break-words">
                                    {request.title}
                                </h2>
                            </div>

                            {/* Info tiles */}
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <InfoTile icon={BookOpen} label="Môn học" value={topicsStr} iconClassName="text-primary" />
                                <InfoTile icon={Banknote} label="Học phí" value={budgetStr} iconClassName="text-emerald-500" />
                                <InfoTile icon={GraduationCap} label="Cấp lớp" value={`${LEVEL_MAP[request.level] || request.level} · ${gradesStr}`} iconClassName="text-blue-500" />
                                <InfoTile
                                    icon={Monitor}
                                    label="Hình thức"
                                    value={MODE_MAP[request.mode] || request.mode}
                                    iconClassName="text-purple-500"
                                />
                            </div>

                            {/* Extra info */}
                            <div className="grid gap-3 sm:grid-cols-3">
                                {request.city && (
                                    <InfoTile icon={MapPin} label="Địa điểm" value={[request.ward, request.city].filter(Boolean).join(", ")} iconClassName="text-rose-500" />
                                )}
                                <InfoTile icon={Users} label="Số buổi / tuần" value={`${request.count} buổi/tuần`} iconClassName="text-indigo-500" />
                                {request.slot && (
                                    <InfoTile icon={Clock} label="Buổi học" value={SLOT_MAP[request.slot] || request.slot} iconClassName="text-orange-500" />
                                )}
                                {request.days && request.days.length > 0 && (
                                    <InfoTile icon={CalendarDays} label="Các ngày học" value={daysStr} iconClassName="text-teal-500" />
                                )}
                            </div>

                            {/* Description */}
                            {request.desc && (
                                <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowFullDesc((v) => !v)}
                                        className="mb-2 flex w-full items-center justify-between gap-2 text-[12px] font-black uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5" />
                                            Mô tả yêu cầu
                                        </span>
                                        <ChevronDown className={Cn("h-4 w-4 transition-transform duration-200", showFullDesc && "rotate-180")} />
                                    </button>
                                    <p className={Cn("m-0 whitespace-pre-wrap text-[14px] leading-6 text-foreground/85 break-words", !showFullDesc && "line-clamp-4")}>
                                        {request.desc}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ APPLICATIONS SECTION ═══ */}
                    <div className="space-y-3">
                        <h3 className="m-0 text-[13px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                            Hồ sơ ứng viên
                        </h3>

                        {/* Tabs */}
                        <div
                            role="tablist"
                            className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-slate-200/70 dark:border-white/10"
                        >
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const count = appGroups[tab.id].length;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={Cn(
                                            "relative flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer",
                                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <span className={Cn("h-2 w-2 shrink-0 rounded-full", tab.dot)} />
                                        {tab.label}
                                        <span
                                            className={Cn(
                                                "min-w-[24px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold tabular-nums",
                                                isActive ? "bg-primary/15 text-primary" : "bg-slate-200/70 dark:bg-white/10 text-muted-foreground"
                                            )}
                                        >
                                            {count}
                                        </span>
                                        {isActive && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Applications list */}
                        <div className="space-y-3 pt-2">
                            {appGroups[activeTab].length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-border/50 bg-white/10 dark:bg-black/10 p-12 text-center">
                                    <Users className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-40" />
                                    <p className="text-[15px] font-bold text-foreground mb-1">Chưa có ứng viên</p>
                                    <p className="text-[13px] text-muted-foreground">
                                        {activeTab === "pending" && "Khi gia sư ứng tuyển, hồ sơ sẽ xuất hiện ở đây."}
                                        {activeTab === "accepted" && "Chưa có ứng viên nào được chấp nhận."}
                                        {activeTab === "rejected" && "Chưa có ứng viên nào bị từ chối."}
                                    </p>
                                </div>
                            ) : (
                                appGroups[activeTab].map((app) => (
                                    <TutorAppCard
                                        key={app.id}
                                        app={app}
                                        onChat={() => {
                                            // Navigate to chat
                                        }}
                                        onAccept={() => {
                                            // Accept logic
                                        }}
                                        onReject={() => {
                                            // Reject logic
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
