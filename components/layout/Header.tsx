"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";

import { toast } from "sonner";

import { useNotificationActions } from "@/hooks/notifications/useNotificationActions";
import { resolveNotificationRoute } from "@/lib/notifications/router";
import { formatTimeAgo } from "@/lib/notifications/format";
import { useNotifications } from "@/lib/stores/notifications";
import { IsGoogleUser, LOGIN_PATH } from "@/lib/auth/session";
import { useChatStore } from "@/lib/stores/chat";
import { useAuth } from "@/lib/stores/auth";
import { Cn } from "@/lib/utils";

import { Drawer, DrawerClose, DrawerContent, DrawerTitle } from "@/components/ui/Drawer";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import Tooltip from "@/components/ui/Tooltip";

import {
  GraduationCap,
  ChevronDown,
  Bookmark,
  Sparkles,
  FileText,
  Settings,
  BookOpen,
  Monitor,
  LogOut,
  Shield,
  Users,
  Check,
  Bell,
  User,
  Moon,
  Sun,
} from "lucide-react";

function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const items = useNotifications((s) => s.items);
  const unreadCount = useNotifications((s) => s.unreadCount);
  const loading = useNotifications((s) => s.loading);
  const initialized = useNotifications((s) => s.initialized);
  const fetchList = useNotifications((s) => s.fetchList);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const isAuthed = useAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthed) return;
    if (initialized || loading) return;
    fetchList({ reset: true, page: 1, limit: 10 });
  }, [isAuthed, initialized, loading, fetchList]);

  const preview = useMemo(() => {
    const unread = items.filter((n) => !n.isRead).slice(0, 5);
    if (unread.length === 5) return unread;
    const fill = items.filter((n) => n.isRead).slice(0, 5 - unread.length);
    return [...unread, ...fill];
  }, [items]);

  const { open: openNotification } = useNotificationActions();

  const handleItemClick = async (n: (typeof items)[number]) => {
    if (n.isRead) {
      const route = resolveNotificationRoute(n);
      if (route?.href && route.href !== pathname) router.push(route.href);
      return;
    }
    await openNotification(n);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted transition-all duration-200 cursor-pointer"
            aria-label="Thông báo"
          >
            <Bell className={Cn("h-5 w-5 transition-transform", unreadCount > 0 && "animate-bounce")} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60 opacity-75" />
                <span className={Cn(
                  "relative flex h-5 w-5 aspect-square items-center justify-center rounded-full bg-destructive text-white border-2 border-background box-content font-bold",
                  unreadCount > 99 ? "w-auto px-1.5 text-[8.5px]" : unreadCount > 9 ? "text-[9px]" : "text-[10px]"
                )}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={11}
        className="w-80 p-0 overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Thông báo</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
              <Check className="h-3 w-3" /> Đánh dấu đã đọc
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!isAuthed ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <p className="m-0">Vui lòng đăng nhập để xem thông báo</p>
              <Link href={LOGIN_PATH} className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          ) : loading && preview.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Đang tải...</div>
          ) : preview.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Không có thông báo nào</div>
          ) : (
            preview.map((n, index) => (
              <button
                type="button"
                key={n.groupKey || `notif-${index}`}
                onClick={() => handleItemClick(n)}
                className={`group flex w-full gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer text-left border-none bg-transparent ${!n.isRead ? "bg-primary/5" : ""}`}
              >
                <span className={Cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", !n.isRead ? "bg-primary animate-pulse" : "bg-transparent")} />
                <div className="min-w-0 flex-1">
                  <p className={Cn("text-sm truncate m-0", !n.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 m-0">{n.summary || n.content}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/80 font-semibold m-0">{formatTimeAgo(n.latestAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-border p-2">
          <Link href="/thong-bao" className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors">
            Xem tất cả thông báo
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UserAvatar({ src, name, size = "sm" }: { src?: string | null; name: string; size?: "sm" | "lg" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const [error, setError] = useState(false);
  const s = size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  
  return src && !error ? (
    <img src={src} alt={name} className={`${s} rounded-full object-cover border border-border`} onError={() => setError(true)} />
  ) : (
    <div className={`flex ${s} items-center justify-center rounded-full bg-primary font-bold text-white shadow-sm`}>
      {initials}
    </div>
  );
}

function ThemeSection({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themeOptions = [
    { value: "system", label: "Theo hệ thống", Icon: Monitor },
    { value: "light", label: "Sáng", Icon: Sun },
    { value: "dark", label: "Tối", Icon: Moon },
  ];

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className={Cn(
          "flex w-full items-center gap-3 px-4 py-4 text-[15px] font-semibold text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-border dark:border-white/10",
          open && "bg-muted/30 dark:bg-white/10"
        )}
      >
        <div className="text-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        </div>
        <span className="flex-1 text-left">Giao diện</span>
        <svg className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="flex flex-col bg-transparent">
          {themeOptions.map((opt) => {
              const IconComponent = opt["Icon"];
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    onClose?.();
                  }}
                  className={Cn(
                    "flex items-center gap-3 px-4 py-3.5 text-[15px] transition-colors border-b border-border/60 dark:border-white/5 text-left cursor-pointer",
                    theme === opt.value
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-white/5"
                  )}
                >
                  <IconComponent size={18} className="text-primary" />
                  <span>{opt.label}</span>
                  {theme === opt.value && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}

function UserMenu({ user, onLogout, onClose }: { user: any; onLogout: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isGoogle = IsGoogleUser(user);
  const isTeacher = user.role === "TEACHER";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-72 z-[60]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-2 border-b border-border px-4 py-5 bg-muted/30">
          <UserAvatar src={user.avatar} name={user.name} size="lg" />
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <span className={Cn(
              "mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
              isTeacher ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
            )}>
              {isTeacher ? "Giáo viên" : "Học sinh"}
            </span>
          </div>
        </div>

        {/* Menu Links */}
        <div className="p-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
          
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {isTeacher ? "Quản lý giảng dạy" : "Góc học tập"}
          </div>
          
          <Link href={isTeacher ? "/dashboard/teacher" : "/dashboard/student"} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{isTeacher ? "Lớp học của tôi" : "Lớp đang tham gia"}</span>
          </Link>

          <Link href="/classes/saved" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors">
            <Bookmark className="h-4 w-4 text-primary" />
            <span>Lớp học yêu thích</span>
          </Link>

          <Link href={isTeacher ? "/exams/manage" : "/exams/history"} onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors">
            <FileText className="h-4 w-4 text-primary" />
            <span>{isTeacher ? "Ngân hàng đề thi" : "Lịch sử làm bài"}</span>
          </Link>

          <div className="border-t border-border/60 my-1 pt-1" />
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tài khoản</div>

          <Link href="/profile" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Hồ sơ cá nhân</span>
          </Link>

          <Link href="/settings" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Cài đặt hệ thống</span>
          </Link>

          {!isGoogle && (
            <Link href="/settings/password" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground rounded-xl hover:bg-muted transition-colors">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span>Đổi mật khẩu</span>
            </Link>
          )}

          <ThemeSection onClose={onClose} />
        </div>

        {/* Logout Button */}
        <div className="border-t border-border p-2 bg-muted/20">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [classesDropdown, setClassesDropdown] = useState(false);
  const [teachersDropdown, setTeachersDropdown] = useState(false);
  const [examsDropdown, setExamsDropdown] = useState(false);
  const [desktopUserMenuOpen, setDesktopUserMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const chatUnreadCount = useChatStore((s) => s.unreadCount);

  useEffect(() => {
    setMobileOpen(false);
    setClassesDropdown(false);
    setTeachersDropdown(false);
    setExamsDropdown(false);
    setDesktopUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);
    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);
    return () => mediaQuery.removeEventListener("change", updateIsDesktop);
  }, []);

  const handleLogout = () => {
    logout();
    setDesktopUserMenuOpen(false);
    setMobileOpen(false);
    toast.success("Đăng xuất thành công!");
  };

  const isClassesActive = pathname?.startsWith("/classes") || pathname?.startsWith("/lop-hoc");
  const isTeachersActive = pathname?.startsWith("/teachers") || pathname?.startsWith("/giao-vien");
  const isExamsActive = pathname?.startsWith("/exams") || pathname?.startsWith("/de-thi");

  return (
    <header className="sticky top-0 z-50 w-full transition-colors bg-background/80 backdrop-blur-2xl border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Mobile: Hamburger Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2 ml-2 font-black text-xl tracking-tight text-primary">
            <img src="/images/logo/logo-header-light.png" alt="Learnix Logo" className="h-[150px] w-auto block dark:hidden" />
            <img src="/images/logo/logo-header-dark.png" alt="Learnix Logo" className="h-[150px] w-auto hidden dark:block" />
          </Link>
        </div>

        {/* Desktop Logo */}
        <Link href="/" className="hidden lg:flex items-center gap-2 font-black text-2xl tracking-tighter text-primary shrink-0">
           <img src="/images/logo/logo-header-light.png" alt="Learnix Logo" className="h-[150px] w-auto block dark:hidden" />
           <img src="/images/logo/logo-header-dark.png" alt="Learnix Logo" className="h-[150px] w-auto hidden dark:block" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 h-full">
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setClassesDropdown(true)}
            onMouseLeave={() => setClassesDropdown(false)}
            onClick={() => setClassesDropdown(false)}
          >
            <Link
              href="/classes"
              className={Cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-xl",
                isClassesActive ? "text-primary font-bold bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              )}
            >
              Lớp học
              <ChevronDown className={Cn("h-4 w-4 text-muted-foreground transition-transform duration-200", classesDropdown && "rotate-180")} />
            </Link>

            {classesDropdown && (
              <div className="fixed left-0 right-0 top-16 z-[60] flex justify-center cursor-default pointer-events-none">
                <div className="w-fit mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="w-full rounded-3xl bg-card/95 backdrop-blur-2xl shadow-2xl border border-border p-8 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="grid grid-cols-[260px_300px_260px] gap-2 relative z-10">
                      
                      {/* ACTION CHÍNH */}
                      <div className="space-y-8 pr-8 border-r border-border/50">
                        <div>
                          <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Khám phá</h3>
                          <div className="space-y-4">
                            <Link href="/classes" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <BookOpen className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Tất cả lớp học
                            </Link>
                            <Link href="/classes?type=live" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <Monitor className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Lớp trực tuyến
                            </Link>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Lớp học</h3>
                          <div className="space-y-4">
                            <Link href="/dashboard/student" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <Users className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Lớp học của tôi
                            </Link>
                            <Link href="/classes/saved" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <Bookmark className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Lớp học đã lưu
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* MÔN HỌC */}
                      <div className="min-w-0 px-8 border-r border-border/50">
                        <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Môn học</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {["Toán học", "Vật lý", "Hóa học", "Tiếng Anh", "Ngữ văn", "Tin học", "Sinh học", "Lịch sử", "Địa lý", "IELTS / TOEIC"].map((sub) => (
                            <Link key={sub} href={`/classes?subject=${sub}`} className="block truncate text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* CẤP HỌC */}
                      <div className="min-w-0 pl-8">
                        <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Cấp học</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12", "Đại học"].map((lvl) => (
                            <Link key={lvl} href={`/classes?level=${lvl}`} className="block truncate text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              {lvl}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setTeachersDropdown(true)}
            onMouseLeave={() => setTeachersDropdown(false)}
            onClick={() => setTeachersDropdown(false)}
          >
            <Link
              href="/teachers"
              className={Cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-xl",
                isTeachersActive ? "text-primary font-bold bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              )}
            >
              Giáo viên
              <ChevronDown className={Cn("h-4 w-4 text-muted-foreground transition-transform duration-200", teachersDropdown && "rotate-180")} />
            </Link>

            {teachersDropdown && (
              <div className="fixed left-1/2 -translate-x-1/2 top-16 z-[60] cursor-default pointer-events-none">
                <div className="w-fit mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="w-full rounded-3xl bg-card/95 backdrop-blur-2xl shadow-2xl border border-border p-8 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150"> 
                    <div className="grid grid-cols-[260px_300px_260px] gap-2 relative z-10">
                      
                      <div className="space-y-8 pr-8 border-r border-border/50">
                        <div>
                          <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Khám phá</h3>
                          <div className="space-y-4">
                            <Link href="/teachers" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <Users className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Tất cả giáo viên
                            </Link>
                            <Link href="/teachers?type=featured" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <GraduationCap className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Giáo viên nổi bật
                            </Link>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Giáo viên</h3>
                          <div className="space-y-4">
                            <Link href="/dashboard/student/teachers" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <Users className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Giáo viên của tôi
                            </Link>
                            <Link href="/teachers/saved" className="flex items-center gap-3 text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              <Bookmark className="h-5 w-5 text-primary/80" strokeWidth={1.5} /> Giáo viên đã lưu
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 px-8 border-r border-border/50">
                        <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Môn giảng dạy</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {["Toán học", "Vật lý", "Hóa học", "Tiếng Anh", "Ngữ văn", "Tin học", "Sinh học", "Lịch sử", "Địa lý", "IELTS / TOEIC"].map((sub) => (
                            <Link key={sub} href={`/teachers?subject=${sub}`} className="block truncate text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-0 pl-8 space-y-8">
                        <div>
                          <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Hình thức học</h3>
                          <div className="space-y-4">
                            {["Online", "Offline"].map((crit) => (
                              <Link key={crit} href={`/teachers?filter=${crit}`} className="block truncate text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                                {crit}
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Hình thức dạy</h3>
                          <div className="space-y-4">
                            {["Gia sư", "Giáo viên"].map((crit) => (
                              <Link key={crit} href={`/teachers?filter=${crit}`} className="block truncate text-[15px] text-foreground hover:text-primary transition-colors font-medium">
                                {crit}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setExamsDropdown(true)}
            onMouseLeave={() => setExamsDropdown(false)}
            onClick={() => setExamsDropdown(false)}
          >
            <Link
              href="/exams"
              className={Cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-xl",
                isExamsActive ? "text-primary font-bold bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              )}
            >
              Đề thi & Tài liệu
              <ChevronDown className={Cn("h-4 w-4 text-muted-foreground transition-transform duration-200", examsDropdown && "rotate-180")} />
            </Link>

            {examsDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 top-16 z-[60] cursor-default pointer-events-none">
                <div className="w-[540px] px-4">
                  <div className="w-full rounded-3xl bg-card/95 backdrop-blur-2xl shadow-2xl border border-border p-5 pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-150"> 
                    <div className="flex flex-col gap-3 relative z-10">
                      
                      <Link href="/exams" className="group flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">Ngân hàng đề thi</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">Khám phá hàng nghìn đề thi, đề kiểm tra được biên soạn theo từng môn học, cấp học.</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0 ml-4 group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </Link>

                      <Link href="/materials" className="group flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 shrink-0 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">Thư viện tài liệu</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2"> Tiếp cận kho tài liệu chất lượng với giáo trình, bài giảng được chọn lọc dành cho mọi cấp học.</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0 ml-4 group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </Link>

                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about-us"
            className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-xl hover:bg-muted"
          >
            Vì sao chọn Learnix
          </Link>
        </nav>

        {/* Right Actions: Notifications, Messages, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <Tooltip content="Thông báo" side="bottom">
            <NotificationBell />
          </Tooltip>

          {isAuthenticated && user ? (
            <>
              <Tooltip content="Tin nhắn" side="bottom">
                <Link
                  href="/tin-nhan"
                  className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted transition-all duration-200"
                  aria-label="Tin nhắn"
                >
                  <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 pointer-events-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/60 opacity-75" />
                      <span className="relative flex h-5 w-5 aspect-square items-center justify-center rounded-full bg-destructive text-white border-2 border-background box-content font-bold text-[9px]">
                        {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                      </span>
                    </span>
                  )}
                </Link>
              </Tooltip>

              {/* Desktop User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDesktopUserMenuOpen(!desktopUserMenuOpen)}
                  className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-secondary hover:ring-2 hover:ring-primary/40 transition-all duration-200 cursor-pointer overflow-hidden border border-border"
                >
                  <UserAvatar src={user.avatar} name={user.name} size="lg" />
                </button>

                {desktopUserMenuOpen && (
                  <UserMenu user={user} onLogout={handleLogout} onClose={() => setDesktopUserMenuOpen(false)} />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MOBILE DRAWER ═══ */}
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} direction="left">
        <DrawerContent className="flex flex-col w-4/5 max-w-sm h-full rounded-none">
          <DrawerTitle className="sr-only">Menu Learnix</DrawerTitle>
          
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" onClick={() => setMobileOpen(false)} className="font-black text-xl tracking-tight text-primary flex items-center gap-2">
              <GraduationCap className="h-7 w-7" /> LEARNIX
            </Link>
            <DrawerClose className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <span className="sr-only">Đóng</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </DrawerClose>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Lớp học */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2 px-2">Lớp học trực tuyến</p>
              <div className="space-y-1">
                <Link href="/classes" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl font-bold text-primary bg-primary/10">
                  Tất cả lớp học
                </Link>
                <Link href="/classes?type=live" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                  Lớp học tương tác (Live)
                </Link>
                <Link href="/classes/saved" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                  Lớp học yêu thích
                </Link>
              </div>
            </div>

            {/* Giáo viên */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2 px-2">Đội ngũ Giảng viên</p>
              <div className="space-y-1">
                <Link href="/teachers" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-bold text-foreground hover:bg-muted">
                  Danh sách Giáo viên
                </Link>
                <Link href="/teachers?level=ielts" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                  Giảng viên IELTS 8.0+
                </Link>
              </div>
            </div>

            {/* Đề thi & Tài liệu */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-2 px-2">Ôn thi & Luyện đề</p>
              <div className="space-y-1">
                <Link href="/exams" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                  Ngân hàng đề thi trắc nghiệm
                </Link>
                <Link href="/materials" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted">
                  Tài liệu PDF / Word miễn phí
                </Link>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <Link href="/about-us" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 font-bold text-sm text-foreground hover:text-primary">
                <Sparkles className="h-4 w-4 text-primary" /> Vì sao chọn Learnix
              </Link>
            </div>
          </div>

          {/* Footer Drawer */}
          <div className="p-4 border-t border-border bg-muted/20">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/signin" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-11 rounded-xl border border-border font-bold text-sm bg-card hover:bg-muted">
                  Đăng nhập
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-md">
                  Đăng ký
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 h-11 rounded-xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-colors">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
}