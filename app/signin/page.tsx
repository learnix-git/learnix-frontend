"use client";

import { IconMail, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/stores/auth";
import { sign } from "@/lib/auth/oauth";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuth((s) => s.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const updateField = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LoginFormData;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await login(result.data);
      toast.success("Đăng nhập thành công!");
      router.push(callbackUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof LoginFormData) =>
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
            src="/images/auth/signin-illustration.svg"
            alt="Learnix Learning Platform"
            className="w-full max-w-sm mx-auto mb-8"
          />
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">Nền tảng dạy và học trực tuyến</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Kết nối giáo viên và học sinh. Hàng ngàn lớp học, khóa học và ngân hàng câu hỏi phong phú đang chờ bạn khám phá.
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

          <h1 className="text-2xl font-bold text-foreground dark:text-white">Chào mừng trở lại</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đăng nhập vào Learnix để tiếp tục
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
            Đăng nhập với Google
          </button>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-3 text-muted-foreground dark:text-slate-400">hoặc đăng nhập bằng email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                Email
              </label>
              <div className="relative">
                <IconMail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 z-10" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  maxLength={255}
                  placeholder="name@example.com"
                  className={inputClass("email")}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground dark:text-white">
                  Mật khẩu
                </label>
                <Link href="/quen-mat-khau" className="text-xs font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <IconLock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 z-10" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  maxLength={64}
                  placeholder="Nhập mật khẩu"
                  className={`${inputClass("password")} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <IconEyeOff size={20} className="text-white/80 z-10" /> : <IconEye size={20} className="text-white/80 z-10" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full rounded-2xl h-12 mt-6" loading={loading}>
              Đăng nhập
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground dark:text-slate-400">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}