"use client";

import React, { 
  useCallback, 
  useEffect, 
  useMemo, 
  useState 
} from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock,
  ClipboardCheck,
  FileCheck2,
  Flag,
  GraduationCap,
  Handshake,
  Inbox,
  KeyRound,
  MessageCircle,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Cn, NormalizeString as BaseNormalizeString } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import TooltipHover from "@/components/ui/Tooltip";
import { useAuth } from "@/lib/stores/auth";
import { useNotifications } from "@/lib/stores/notifications";
import { ResolveNotificationRoute } from "@/lib/notifications/router";
import { FormatDate } from "@/lib/notifications/format";
import type { NotificationItem } from "@/lib/notifications/types";

// Chuẩn hóa chuỗi tìm kiếm an toàn
function NormalizeString(value: unknown): string {
  if (typeof value === "string") {
    return BaseNormalizeString ? BaseNormalizeString(value) : value.toLowerCase();
  }

  if (value == null) {
    return "";
  }

  return String(value).toLowerCase();
}

const TYPE_META: Record<
  string,
  { 
    icon: typeof Bell; 
    label: string; 
    accent: string; 
  }
> = {
  message: { 
    icon: MessageCircle, 
    label: "Tin nhắn mới", 
    accent: "primary", 
  },
  contract_requested: { 
    icon: Handshake, 
    label: "Yêu cầu nhận lớp mới", 
    accent: "violet", 
  },
  contract_accepted: { 
    icon: Handshake, 
    label: "Gia sư đã đồng ý nhận lớp", 
    accent: "violet", 
  },
  contract_declined: { 
    icon: XCircle, 
    label: "Gia sư đã từ chối nhận lớp", 
    accent: "rose", 
  },
  contract_cancelled_by_tutor: { 
    icon: CalendarX, 
    label: "Gia sư đã hủy lớp", 
    accent: "rose", 
  },
  contract_cancelled_by_student: { 
    icon: CalendarX, 
    label: "Học viên đã hủy lớp", 
    accent: "rose", 
  },
  contract_penalty_charged: { 
    icon: AlertTriangle, 
    label: "Đã hủy lớp - mất phí", 
    accent: "rose", 
  },
  contract_deposit_paid: { 
    icon: Receipt, 
    label: "Đã đóng cọc học phí", 
    accent: "primary", 
  },
  contract_payment_completed: { 
    icon: Receipt, 
    label: "Đã hoàn tất học phí tháng đầu", 
    accent: "primary", 
  },
  payout_success: { 
    icon: Wallet, 
    label: "Đã nhận thanh toán", 
    accent: "primary", 
  },
  contract_completed: { 
    icon: CheckCircle2, 
    label: "Hoàn tất tháng học đầu tiên", 
    accent: "amber", 
  },
};

const DEFAULT_TYPE_META = { 
  icon: Bell, 
  label: "Thông báo", 
  accent: "primary", 
};

// Lấy metadata hiển thị theo loại thông báo
function GetType(type: string) {
  return TYPE_META[type] ?? DEFAULT_TYPE_META;
}

const ACCENT_CLASS: Record<
  string,
  { 
    chip: string; 
    tile: string; 
    icon: string; 
    dot: string; 
  }
> = {
  primary: {
    chip: "from-primary/15 to-primary/5 border-primary/20 text-primary",
    tile: "from-primary/25 to-primary/5 border-primary/25",
    icon: "text-primary",
    dot: "bg-primary",
  },
  sky: {
    chip: "from-sky-500/15 to-sky-500/5 border-sky-500/20 text-sky-600 dark:text-sky-400",
    tile: "from-sky-500/25 to-sky-500/5 border-sky-500/25",
    icon: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
  },
  violet: {
    chip: "from-violet-500/15 to-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400",
    tile: "from-violet-500/25 to-violet-500/5 border-violet-500/25",
    icon: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  amber: {
    chip: "from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400",
    tile: "from-amber-500/25 to-amber-500/5 border-amber-500/25",
    icon: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  rose: {
    chip: "from-rose-500/15 to-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400",
    tile: "from-rose-500/25 to-rose-500/5 border-rose-500/25",
    icon: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  slate: {
    chip: "from-slate-500/15 to-slate-500/5 border-slate-500/20 text-slate-600 dark:text-slate-400",
    tile: "from-slate-500/25 to-slate-500/5 border-slate-500/25",
    icon: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-500",
  },
};

// Lấy style màu sắc theo mã màu
function Accenting(accent: string) {
  return ACCENT_CLASS[accent] ?? ACCENT_CLASS.primary;
}

// Tạo câu chào theo giờ trong ngày
function Greeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Chào buổi sáng";
  }

  if (currentHour < 18) {
    return "Chào buổi chiều";
  }

  return "Chào buổi tối";
}

interface NotifListProps {
  notif: NotificationItem;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

// Danh sách các thông báo
function NotifList({
  notif,
  isActive,
  index,
  onClick,
}: NotifListProps) {
  const meta = GetType(notif.type);
  const accent = Accenting(meta.accent);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      className={Cn(
        "group relative w-full text-left p-3.5 rounded-2xl border transition-[background-color,border-color,box-shadow,transform] duration-200 animate-fade-in",
        isActive
          ? "bg-gradient-to-br from-primary/[0.10] via-primary/[0.05] to-transparent border-primary/40 ring-1 ring-primary/25 shadow-lg shadow-primary/15 translate-y-0"
          : !notif.read
            ? "bg-white/40 dark:bg-white/[0.04] border-white/50 dark:border-white/10 hover:border-primary/30 hover:bg-white/65 dark:hover:bg-white/[0.07] hover:shadow-md hover:shadow-primary/5 hover:-translate-y-px active:translate-y-0"
            : "bg-white/15 dark:bg-white/[0.02] border-white/20 dark:border-white/5 hover:border-white/40 dark:hover:border-white/15 hover:bg-white/35 dark:hover:bg-white/[0.05] hover:shadow-sm hover:-translate-y-px active:translate-y-0",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={Cn(
            "shrink-0 w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 bg-gradient-to-br",
            !notif.read || isActive
              ? accent.tile
              : "from-white/60 to-white/60 dark:from-white/5 dark:to-white/5 border-white/40 dark:border-white/10 group-hover:border-primary/20",
          )}
        >
          <Icon
            className={Cn(
              "h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110",
              !notif.read ? accent.icon : "text-muted-foreground group-hover:text-primary",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            {/* Nhãn */}
            <span
              className={Cn(
                "text-[10px] font-bold shrink-0 tracking-wide",
                notif.read ? "text-muted-foreground" : accent.icon,
              )}
            >
              {meta.label}
            </span>

            {/* Thời gian */}
            <span className="text-[10px] text-muted-foreground shrink-0">
              {FormatDate(notif.created)}
            </span>
          </div>

          {/* Tiêu đề */}
          <h3
            className={Cn(
              "text-[13px] leading-snug line-clamp-2 transition-colors m-0",
              !notif.read ? "text-foreground font-bold" : "text-muted-foreground font-medium",
              !isActive && "group-hover:text-foreground",
            )}
          >
            {notif.title}
          </h3>
          
          {/* Nội dung */}
          {notif.content && (
            <p className="text-muted-foreground text-[11px] line-clamp-2 mt-1 leading-relaxed m-0">
              {notif.content}
            </p>
          )}
        </div>

        {/* Chấm báo trạng thái chưa đọc */}
        {!notif.read && !isActive && (
          <span className={Cn("shrink-0 mt-1.5 h-2 w-2 rounded-full shadow-sm animate-pulse", accent.dot)} />
        )}
      </div>
    </button>
  );
}

interface NotifDetailProps {
  notif: NotificationItem;
  onClose: () => void;
  onOpen: () => void;
}

// Chi tiết thông báo
function NotifDetail({
  notif,
  onClose,
  onOpen,
}: NotifDetailProps) {
  const meta = GetType(notif.type);
  const accent = Accenting(meta.accent);
  const Icon = meta.icon;

  const route = ResolveNotificationRoute(notif);
  const hasRoute = Boolean(route);

  return (
    <>
      {/* Thanh điều hướng quay lại */}
      <div className="md:hidden px-4 py-3 border-b border-white/40 dark:border-white/5 bg-white/30 dark:bg-white/[0.02] backdrop-blur-md flex items-center shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>

      <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-white/40 dark:border-white/5 shrink-0 overflow-hidden">
        {/* Hiệu ứng ánh sáng nền */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative flex gap-4">
          {/* Icon */}
          <div className={Cn("shrink-0 w-14 h-14 rounded-full bg-gradient-to-br border flex items-center justify-center shadow-lg", accent.tile)}>
            <Icon className={Cn("h-6 w-6", accent.icon)} />
          </div>

          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Nhãn */}
              <span className={Cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r border text-[10px] font-black", accent.chip)}>
                <span className={Cn("h-1.5 w-1.5 rounded-full", accent.dot)} />
                {meta.label}
              </span>

              {/* Thời gian */}
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" /> 
                {FormatDate(notif.created)}
              </span>
            </div>

            {/* Tiêu đề */}
            <h2 className="text-xl sm:text-2xl font-black text-foreground leading-tight tracking-tight m-0">
              {notif.title}
            </h2>
          </div>
        </div>
      </div>

      {/* Nội dung chi tiết thông báo */}
      <div className="flex-1 px-6 sm:px-8 py-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl">
          {notif.content && (
            <p className="text-[15px] leading-relaxed text-foreground m-0">
              {notif.content}
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 sm:px-8 py-4 border-t border-white/40 dark:border-white/5 bg-white/30 dark:bg-white/[0.02] backdrop-blur-md shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        {hasRoute && (
          <Button
            onClick={onOpen}
            className="rounded-2xl h-11 px-5 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Mở trang đích
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-2xl h-11 px-5 text-sm font-bold border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/60"
        >
          Đóng chi tiết
        </Button>
      </div>
    </>
  );
}

// Chi tiết thông báo rỗng
function NotifDetailEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5 border border-white/60 dark:border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
          <Inbox className="w-9 h-9 text-primary" />
        </div>
      </div>

      <h3 className="text-base font-black text-foreground mb-1.5 tracking-tight">
        Chọn một thông báo
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Nội dung chi tiết sẽ hiển thị tại đây khi bạn chọn một mục từ danh sách bên trái.
      </p>
    </div>
  );
}

// Khung xương trang thông báo
function NotificationsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((itemIndex) => (
        <div
          key={itemIndex}
          className="p-3.5 rounded-2xl border border-white/30 dark:border-white/5 bg-white/20 dark:bg-white/[0.02] animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-200/70 dark:bg-zinc-800 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-16 bg-slate-200/70 dark:bg-zinc-800 rounded" />
                <div className="h-2 w-12 bg-slate-100 dark:bg-zinc-800/60 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-slate-200/70 dark:bg-zinc-800 rounded" />
              <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800/50 rounded" />
              <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-zinc-800/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface NotificationsErrorProps {
  error: string;
  onRetry: () => void;
}

// Trạng thái trang thông báo lỗi
function NotificationsError({
  error,
  onRetry,
}: NotificationsErrorProps) {
  return (
    <div className="py-14 text-center px-4">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-3">
        <Bell className="h-6 w-6 text-destructive" />
      </div>

      <p className="font-bold text-foreground text-sm m-0">
        Không thể tải thông báo
      </p>
      <p className="text-xs mt-1 text-muted-foreground m-0 max-w-[240px] mx-auto">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 text-xs font-bold text-primary hover:underline cursor-pointer border-none bg-transparent"
      >
        Thử lại
      </button>
    </div>
  );
}

interface NotificationsEmptyProps {
  hasItems: boolean;
  activeFilter: "all" | "unread";
}

// Trạng thái trang thông báo rỗng
function NotificationsEmpty({
  hasItems,
  activeFilter,
}: NotificationsEmptyProps) {
  const isUnreadEmptyState = hasItems && activeFilter === "unread";

  return (
    <div className="text-center text-muted-foreground py-16 px-4">
      <div className="relative mx-auto w-16 h-16 mb-4">
        <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 flex items-center justify-center">
          <Inbox className="h-7 w-7 text-primary" />
        </div>
      </div>

      <p className="font-bold text-foreground text-sm m-0">
        {isUnreadEmptyState ? "Bạn đã đọc hết" : "Chưa có thông báo nào"}
      </p>
      <p className="text-xs mt-1.5 text-muted-foreground m-0 max-w-[240px] mx-auto leading-relaxed">
        {isUnreadEmptyState
          ? "Không có thông báo chưa đọc. Mọi cập nhật mới sẽ xuất hiện tại đây."
          : "Thử lại với từ khóa hoặc bộ lọc khác."}
      </p>
    </div>
  );
}

export default function NotificationPage() {
  const router = useRouter();

  const isAuthed = useAuth((s) => s.isAuthenticated);
  const loading = useAuth((s) => s.loading);

  const items = useNotifications((s) => s.items);
  const total = useNotifications((s) => s.total);
  const unreadCount = useNotifications((s) => s.unreadCount);
  const storeLoading = useNotifications((s) => s.loading);
  const refreshing = useNotifications((s) => s.refreshing);
  const hasMore = useNotifications((s) => s.hasMore);
  const initialized = useNotifications((s) => s.initialized);
  const error = useNotifications((s) => s.error);

  const fetchList = useNotifications((s) => s.fetchList);
  const refresh = useNotifications((s) => s.refresh);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);

  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState<boolean>(false);

  // Kiểm tra đăng nhập và tải danh sách ban đầu
  useEffect(() => {
    if (loading) return;

    if (!isAuthed) {
      router.replace("/signin?redirect=/notifications");
      return;
    }

    if (storeLoading) return;

    const needMore = items.length < 20 && hasMore;

    if (initialized && !needMore) return;

    fetchList({ 
      reset: true, 
      page: 1, 
      limit: 20, 
    });
  }, [loading, isAuthed, initialized, storeLoading, fetchList, router, items.length, hasMore]);

  // Lọc thông báo theo tab và từ khóa
  const filtered = useMemo<NotificationItem[]>(() => {
    const query = NormalizeString(searchQuery.trim());

    return items.filter((notif) => {
      if (activeFilter === "unread" && notif.read) {
        return false;
      }

      if (!query) {
        return true;
      }

      const titleNormalized = NormalizeString(notif.title);
      const contentNormalized = NormalizeString(notif.content);

      return titleNormalized.includes(query) || contentNormalized.includes(query);
    });
  }, [items, activeFilter, searchQuery]);

  // Khôi phục chỉ mục chọn khi danh sách lọc thay đổi
  useEffect(() => {
    if (items.length === 0) {
      setSelectedIndex(null);
      return;
    }

    if (selectedIndex === null) return;

    if (selectedIndex >= filtered.length) {
      setSelectedIndex(null);
    }
  }, [items.length, filtered.length, selectedIndex]);

  // Lấy chi tiết thông báo đang được chọn
  const selectedNotif = useMemo(() => {
    const isValidIndex = selectedIndex !== null && selectedIndex < filtered.length;

    if (!isValidIndex) {
      return null;
    }

    return filtered[selectedIndex];
  }, [filtered, selectedIndex]);

  // Đánh dấu chọn thông báo từ danh sách
  const handleItemClick = (notif: NotificationItem, index: number) => {
    setSelectedIndex(index);
    setIsMobileDetailView(true);

    if (!notif.read) {
      markRead(notif.id);
    }
  };

  // Đóng màn hình chi tiết trên mobile
  const handleCloseDetail = useCallback(() => {
    setSelectedIndex(null);
    setIsMobileDetailView(false);
  }, []);

  // Xử lý chuyển hướng đến trang đích của thông báo
  const handleOpenTarget = async (notif: NotificationItem) => {
    try {
      if (!notif.read) {
        await markRead(notif.id);
      }

      const targetRoute = ResolveNotificationRoute(notif);

      if (!targetRoute) {
        toast.info("Chưa có trang đích cho thông báo này");
        return;
      }

      router.push(targetRoute);
    } catch (err: unknown) {
      toast.error("Không thể xử lý hành động này");
    }
  };

  // Đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await markAllRead();
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (err: unknown) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  // Tải thêm dữ liệu trang tiếp theo
  const handleLoadMore = () => {
    fetchList({ 
      reset: false, 
      page: undefined, 
      limit: 20, 
    });
  };

  const breadcrumb = [
    { name: "Trang chủ", href: "/" },
    { name: "Thông báo", href: "/notifications" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Đang tải...
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* Thanh điều hướng Breadcrumb phía trên cùng */}
      <div className="bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/60 dark:border-white/5">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <BreadcrumbComponent pathList={breadcrumb} />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Nhóm tiêu đề và mô tả */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-[11px] font-bold text-primary tracking-wide">
                <GraduationCap className="h-3 w-3" />
                {Greeting()}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none m-0">
                Thông báo
              </h1>

              <p className="text-sm text-muted-foreground m-0 max-w-md leading-relaxed">
                Cập nhật về khoá học, lịch học với gia sư, đơn hàng và tài khoản của
                bạn sẽ xuất hiện tại đây.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 text-xs font-bold text-primary">
                <span className="relative flex h-2 w-2">
                  <span 
                    className={Cn(
                      "absolute inline-flex h-full w-full rounded-full bg-primary opacity-60", 
                      unreadCount > 0 && "animate-ping"
                    )} 
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                {unreadCount} chưa đọc
              </div>

              <TooltipHover content="Làm mới" side="left">
                <button
                  type="button"
                  onClick={() => refresh()}
                  disabled={refreshing}
                  className="cursor-pointer h-10 w-10 rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:border-primary/30 hover:text-primary hover:bg-primary/5 text-muted-foreground flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={Cn("h-4 w-4", refreshing && "animate-spin")} />
                </button>
              </TooltipHover>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="inline-flex p-1 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 gap-1 w-fit">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={Cn(
                  "flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
                  activeFilter === "all"
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5",
                )}
              >
                Tất cả
                <span 
                  className={Cn(
                    "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black",
                    activeFilter === "all" ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
                  )}
                >
                  {total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("unread")}
                className={Cn(
                  "flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
                  activeFilter === "unread"
                    ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5",
                )}
              >
                Chưa đọc
                <span 
                  className={Cn(
                    "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black",
                    activeFilter === "unread" ? "bg-white/20 text-white" : "bg-primary/15 text-primary"
                  )}
                >
                  {unreadCount}
                </span>
              </button>
            </div>

            {/* Ô nhập từ khóa tìm kiếm */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khoá học, lịch học, đơn hàng..."
                className="w-full h-10 pl-11 pr-10 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground text-foreground"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 shadow-2xl shadow-primary/5 backdrop-blur-2xl overflow-hidden flex h-[640px] relative">
          <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />

          {/* Cột trái: Danh sách các thông báo */}
          <div
            className={Cn(
              "w-full md:w-[360px] lg:w-[400px] shrink-0 border-r border-white/40 dark:border-white/5 flex flex-col h-full relative z-10",
              isMobileDetailView ? "hidden md:flex" : "flex",
            )}
          >
            {/* Khu vực cuộn danh sách */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {storeLoading && filtered.length === 0 ? (
                <NotificationsSkeleton />
              ) : error && filtered.length === 0 ? (
                <NotificationsError 
                  error={error} 
                  onRetry={refresh} 
                />
              ) : filtered.length === 0 ? (
                <NotificationsEmpty
                  hasItems={items.length > 0}
                  activeFilter={activeFilter}
                />
              ) : (
                filtered.map((notif, index) => {
                  const isActive = selectedIndex === index;

                  return (
                    <NotifList
                      key={notif.id}
                      notif={notif}
                      isActive={isActive}
                      index={index}
                      onClick={() => handleItemClick(notif, index)}
                    />
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-white/40 dark:border-white/5 bg-white/20 dark:bg-white/[0.02] backdrop-blur-md shrink-0 flex gap-2">
              {hasMore && filtered.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={storeLoading}
                  className="flex-1 text-xs font-bold rounded-xl h-9 hover:bg-white/40"
                >
                  {storeLoading ? "Đang tải..." : "Tải thêm"}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className={Cn(
                  "flex-1 text-xs font-bold rounded-xl h-9 transition-all",
                  unreadCount > 0
                    ? "border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                    : "opacity-50",
                )}
              >
                <CheckCheck className="h-4 w-4 mr-1.5" />
                Đã đọc tất cả
              </Button>
            </div>
          </div>

          {/* Cột phải: Nội dung chi tiết của thông báo */}
          <div
            className={Cn(
              "flex-1 flex flex-col overflow-hidden h-full relative z-10",
              isMobileDetailView ? "flex" : "hidden md:flex",
            )}
          >
            {selectedNotif ? (
              <NotifDetail
                notif={selectedNotif}
                onClose={handleCloseDetail}
                onOpen={() => handleOpenTarget(selectedNotif)}
              />
            ) : (
              <NotifDetailEmpty />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}