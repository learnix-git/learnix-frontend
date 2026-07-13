"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { forgotPassword } from "@/lib/api/auth";
import { sign } from "@/lib/auth/oauth";
import {
  IconMail,
  IconArrowLeft,
  IconSend,
  IconAlertCircle,
} from "@tabler/icons-react";

const LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
  github: "GitHub",
};

function social(provider: string): string {
  const key = provider.toLowerCase();
  return LABELS[key] ?? provider;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  const emailChange = (value: string) => {
    setEmail(value);
    if (error) 
      setError(null);
    if (socialProvider) 
      setSocialProvider(null);
  };

  // Gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success === true) {
        const message = res.message?.trim();
        if (message) {
          setResponse(message);
          toast.success(message);
        } else {
          toast.success("Đã gửi email đặt lại mật khẩu!");
        }
        setSent(true);
      } else {
        setError(res.message || "Gửi email thất bại");
      }
    } catch(err : any) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
      // Kiểm tra có phải tài khoản google không
      const data = err.response?.data;
      
      setError(data?.message || "Có lỗi xảy ra, vui lòng thử lại");
      
      if (data?.data?.provider === "google") {
        setSocialProvider("google");
      } else {
        setSocialProvider(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" />
        <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" style={{ animationDelay: "2s" }} />
        <div className="relative z-10 max-w-lg w-full text-center">
          <img
            src="/images/auth/forgot-password-illustration.svg"
            alt="Minh họa khôi phục mật khẩu Learnix"
            className="w-full max-w-sm mx-auto mb-8"
          />
          <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">Khôi phục mật khẩu</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Đừng lo lắng, chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.
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

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 backdrop-blur-xl">
                <IconSend size={32} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Kiểm tra email của bạn</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                <span className="font-semibold text-foreground dark:text-white whitespace-nowrap">
                  {email}
                </span>
              </p>
              {response && (
                <p className="text-sm font-medium text-foreground dark:text-white mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 backdrop-blur-sm whitespace-nowrap">
                  {response}
                </p>
              )}
              <p className="text-xs text-muted-foreground mb-8 whitespace-nowrap">
                Không nhận được email? Kiểm tra thư mục spam hoặc thử lại với email khác.
              </p>
              <Link
                href="/dang-nhap"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <IconArrowLeft size={16} />
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground dark:text-white">Quên mật khẩu?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <IconMail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 dark:text-white/40 z-10" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => emailChange(e.target.value)}
                      placeholder="name@example.com"
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "email-error" : undefined}
                      className={`w-full rounded-2xl border bg-white/30 dark:bg-white/10 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-foreground dark:text-white outline-none transition-all placeholder:text-muted-foreground/60 dark:placeholder:text-white/40 ${
                        error
                          ? "border-destructive/70 focus:border-destructive"
                          : "border-white/40 dark:border-white/20 focus:border-primary"
                      }`}
                    />
                  </div>

                  {error && (
                    <div
                      id="email-error"
                      role="alert"
                      className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-2">
                        <IconAlertCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-destructive"
                        />
                        <p className="text-sm font-medium text-foreground dark:text-white">
                          {error}
                        </p>
                      </div>

                      {socialProvider === "google" && (
                        <button
                          type="button"
                          onClick={sign}
                          className="mt-4 w-full inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/40 dark:border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur-sm py-3 text-sm font-bold text-foreground dark:text-white hover:bg-white/60 dark:hover:bg-white/20 transition-all cursor-pointer"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          Đăng nhập bằng Google
                        </button>
                      )}
                      {socialProvider && socialProvider !== "google" && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Tài khoản này đăng ký qua <strong>{social(socialProvider)}</strong>.
                          Vui lòng sử dụng nút đăng nhập tương ứng tại trang đăng nhập.
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full rounded-2xl h-12 mt-6" loading={loading}>
                  Gửi link đặt lại mật khẩu
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground dark:text-slate-400">
                <Link
                  href="/dang-nhap"
                  className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
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