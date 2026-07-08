"use client";

import { IconMail, IconLock, IconEye, IconEyeOff, IconUser, IconGenderMale, IconGenderFemale, IconGenderHermaphrodite, IconSchool, IconChalkboard} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/stores/auth";
import { sign } from "@/lib/auth/oauth";

export default function SignupPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    role: "STUDENT",
    gender: 0,
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const register = useAuth((s) => s.register);
  const router = useRouter();

  const updateField = (field: keyof RegisterFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RegisterFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await register(result.data);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/signin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng ký thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof RegisterFormData) =>
    `w-full rounded-2xl border bg-white/30 dark:bg-white/10 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-foreground dark:text-white outline-none transition-all placeholder:text-muted-foreground/70 dark:placeholder:text-white/40 ${
      errors[field] ? "border-destructive/70 focus:border-destructive" : "border-white/40 dark:border-white/20 focus:border-primary"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* Left — Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" />
        <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="relative z-10 max-w-lg w-full text-center">
          <img
            src="/images/auth/signup-illustration.svg"
            alt="Learnix Teaching & Learning Platform"
            className="w-full max-w-sm mx-auto mb-8"
          />
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">Gia nhập cộng đồng dạy & học Learnix</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Nền tảng trực tuyến kết nối hàng ngàn giáo viên và học sinh. Khởi tạo lớp học của bạn hoặc tham gia học tập ngay hôm nay.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/images/logo/logo-light.png" alt="Learnix" className="h-10 w-auto block dark:hidden" />
              <img src="/images/logo/logo-dark.png" alt="Learnix" className="h-10 w-auto hidden dark:block" />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-foreground dark:text-white">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tham gia nền tảng dạy & học trực tuyến hàng đầu Việt Nam
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={sign}
            className="mt-6 w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/40 dark:border-white/20 bg-white/30 dark:bg-white/10 backdrop-blur-sm py-3.5 text-sm font-medium text-foreground dark:text-white hover:bg-white/50 dark:hover:bg-white/20 transition-all cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng ký với Google
          </button>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-muted-foreground dark:text-slate-400">hoặc đăng ký bằng email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <IconUser size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  maxLength={100}
                  className={inputClass("name")}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
                Vai trò
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "STUDENT",
                    label: "Học sinh",
                    icon: <IconSchool size={18} />,
                    activeClass: "border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 shadow-md shadow-primary/10",
                    inactiveClass: "border-white/40 dark:border-white/20 text-muted-foreground hover:border-primary/50",
                  },
                  {
                    value: "TEACHER",
                    label: "Giáo viên",
                    icon: <IconChalkboard size={18} />,
                    activeClass: "border-orange-500 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 shadow-md shadow-orange-500/10",
                    inactiveClass: "border-white/40 dark:border-white/20 text-muted-foreground hover:border-purple-500/50",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    onClick={() => updateField("role", opt.value)}
                    className={`flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === opt.value ? opt.activeClass : opt.inactiveClass
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      checked={formData.role === opt.value}
                      onChange={() => updateField("role", opt.value)}
                      className="sr-only"
                    />
                    <div className={`mb-1.5 ${formData.role === opt.value ? "scale-110 transition-transform" : "opacity-60"}`}>
                      {opt.icon}
                    </div>
                    <span className="text-sm font-bold leading-tight">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <div className="relative">
                <IconMail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@example.com"
                  maxLength={255}
                  className={inputClass("email")}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
                Giới tính
              </label>
              <div className="flex gap-3">
                {[
                  { value: 0, label: "Nam", icon: <IconGenderMale size={18} />, activeClass: "border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400", inactiveClass: "border-white/40 dark:border-white/20 text-muted-foreground hover:border-blue-500/50" },
                  { value: 1, label: "Nữ", icon: <IconGenderFemale size={18} />, activeClass: "border-pink-500 bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400", inactiveClass: "border-white/40 dark:border-white/20 text-muted-foreground hover:border-pink-500/50" },
                  { value: 2, label: "Khác", icon: <IconGenderHermaphrodite size={18} />, activeClass: "border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400", inactiveClass: "border-white/40 dark:border-white/20 text-muted-foreground hover:border-purple-500/50" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm cursor-pointer transition-all ${formData.gender === opt.value ? opt.activeClass : opt.inactiveClass}`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      checked={formData.gender === opt.value}
                      onChange={() => updateField("gender", opt.value)}
                      className="sr-only"
                    />
                    <span className={formData.gender === opt.value ? "text-current" : "text-current opacity-50"}>{opt.icon}</span>
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <IconLock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  maxLength={64}
                  className={`${inputClass("password")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff size={18} className="text-slate-500 dark:text-slate-400" /> : <IconEye size={18} className="text-slate-500 dark:text-slate-400" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <IconLock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  maxLength={64}
                  className={`${inputClass("confirmPassword")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirm ? <IconEyeOff size={18} className="text-slate-500 dark:text-slate-400" /> : <IconEye size={18} className="text-slate-500 dark:text-slate-400" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full rounded-2xl h-12 mt-6" loading={loading}>
              Tạo tài khoản
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link href="/dieu-khoan-dich-vu" className="text-primary hover:underline">Điều khoản Dịch vụ</Link>
            {" "}và{" "}
            <Link href="/chinh-sach-bao-mat" className="text-primary hover:underline">Chính sách Bảo mật</Link>
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground dark:text-slate-400">
            Đã có tài khoản?{" "}
            <Link href="/signin" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}