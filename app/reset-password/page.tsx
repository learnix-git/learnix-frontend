"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LOGIN_PATH } from "@/lib/auth/session";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/api/auth";
import { resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { IconLock, IconEye, IconEyeOff, IconCheck, IconArrowLeft } from "@tabler/icons-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [form, setForm] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Cập nhật dữ liệu form và reset trạng thái lỗi
  const field = (field: "password" | "confirmPassword", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) setError("");
  };

  // Tạo class Tailwind cho input với kiểu hiển thị tương ứng khi có hoặc không có lỗi
  const input = (hasError?: string) =>
  `w-full rounded-2xl border bg-white/30 dark:bg-white/10 pl-10 pr-10 py-3 text-sm text-foreground dark:text-white outline-none transition-colors placeholder:text-muted-foreground/60 dark:placeholder:text-white/40 focus:border-primary ${
    hasError ? "border-destructive/70 focus:border-destructive" : "border-white/40 dark:border-white/20"
  }`;

  // Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrors({});

    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ");
      return;
    }

    // Kiểm tra mật khẩu có chuẩn không
    const result = resetPasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "password" | "confirmPassword";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Gọi API
      const res = await resetPassword(
        token,
        result.data.password,
        result.data.confirmPassword
      );

      if (res.code === 200) {
        const message = res.message?.trim();
        if (message) {
          setResponse(message);
          toast.success(message);
        } else {
          toast.success("Đặt lại mật khẩu thành công!");
        }
        setSuccess(true);
      } else {
        setError(res.message || "Đặt lại mật khẩu thất bại");
      }
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
          <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-lg w-full text-center">
            <div className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <svg className="h-6 w-6 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-foreground dark:text-white">Learnix</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[420px] text-center">
            <div className="lg:hidden mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <svg className="h-6 w-6 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-foreground">Learnix</span>
              </Link>
            </div>
            <div className="rounded-3xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-2xl shadow-lg shadow-slate-200/50 dark:shadow-none p-8">
              <h1 className="text-lg font-bold text-foreground mb-2">Link không hợp lệ</h1>
              <p className="whitespace-nowrap text-sm text-muted-foreground mb-6">
                Link đặt lại mật khẩu đã hết hạn hoặc không tồn tại.
              </p>
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Yêu cầu link mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-lg w-full text-center">
          <img
            src="/images/auth/reset-password-illustration.svg"
            alt="Minh họa bảo mật tài khoản Learnix"
            className="w-full max-w-sm mx-auto mb-8"
          />
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg className="h-6 w-6 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground dark:text-white">Learnix</span>
          </div>
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">Bảo mật tài khoản</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Đặt mật khẩu mới để bảo vệ tài khoản của bạn trên hệ thống.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <svg className="h-6 w-6 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-foreground">Learnix</span>
            </Link>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <IconCheck size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Đặt lại mật khẩu thành công!</h1>
              {response && (
                <p className="text-sm font-medium text-foreground rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 mb-6 backdrop-blur-sm">
                  {response}
                </p>
              )}
              <Button onClick={() => router.push(LOGIN_PATH)} className="rounded-xl w-full" size="lg">
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">Đặt lại mật khẩu</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <IconLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 dark:text-white/40" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => field("password", e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className={input(errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-xs text-destructive mt-1.5">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <IconLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 dark:text-white/40" />
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => field("confirmPassword", e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      className={input(errors.confirmPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirmPassword-error" className="text-xs text-destructive mt-1.5">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-destructive" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full rounded-xl" size="lg" loading={loading}>
                  Đặt lại mật khẩu
                </Button>
              </form>

              <p className="mt-8 text-center">
                <Link
                  href={LOGIN_PATH}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <IconArrowLeft size={16} />
                  Quay lại đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}