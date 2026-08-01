"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconMail,
  IconArrowLeft,
  IconSend,
  IconAlertCircle,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/Button";
import { forgotPassword } from "@/lib/api/auth";
import { sign } from "@/lib/auth/oauth";
import { LOGIN_PATH } from "@/lib/auth/session";
import { Cn } from "@/lib/utils";

// Hằng số
const MAX_EMAIL_LENGTH = 255;

const SOCIAL_LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
  github: "GitHub",
};

// Lấy tên hiển thị của nhà cung cấp OAuth
function FormatSocialProvider(provider: string): string {
  return SOCIAL_LABELS[provider.toLowerCase()] ?? provider;
}

// Lấy className cho input email
function GetInputClass(hasError: boolean) {
  return Cn(
    "w-full rounded-2xl border bg-white/30 dark:bg-white/10 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-foreground dark:text-white outline-none transition-all placeholder:text-muted-foreground/60 dark:placeholder:text-white/40",
    hasError
      ? "border-destructive/70 focus:border-destructive"
      : "border-white/40 dark:border-white/20 focus:border-primary"
  );
}

// Minh họa bên trái, chỉ hiển thị trên desktop
function ForgotPasswordIllustration() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
      {/* Hiệu ứng nền */}
      <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" />
      <div
        className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Ảnh minh họa */}
        <div className="relative w-full max-w-sm mx-auto mb-8 aspect-square">
          <Image
            src="/images/forgot-password-illustration.svg"
            alt="Minh họa khôi phục mật khẩu Learnix"
            fill
            className="object-contain"
          />
        </div>

        <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">
          Khôi phục mật khẩu
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          Đừng lo lắng, chúng tôi sẽ gửi link đặt lại mật khẩu đến email của bạn.
        </p>
      </div>
    </div>
  );
}

// Logo Learnix trên mobile
function MobileLogo() {
  return (
    <div className="lg:hidden text-center mb-8">
      <Link href="/" className="inline-flex items-center gap-2">
        <img
          src="/images/logo/logo-light.png"
          alt="Learnix"
          className="h-10 w-auto block dark:hidden"
        />
        <img
          src="/images/logo/logo-dark.png"
          alt="Learnix"
          className="h-10 w-auto hidden dark:block"
        />
      </Link>
    </div>
  );
}

// Nút đăng nhập bằng Google khi tài khoản là social
function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={sign}
      className="mt-4 w-full inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/40 dark:border-white/20 bg-white/40 dark:bg-white/10 backdrop-blur-sm py-3 text-sm font-bold text-foreground dark:text-white hover:bg-white/60 dark:hover:bg-white/20 transition-all cursor-pointer"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Đăng nhập bằng Google
    </button>
  );
}

// Ô nhập email
function EmailField({
  value,
  error,
  socialProvider,
  onChange,
}: {
  value: string;
  error: string | null;
  socialProvider: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
        Email
      </label>

      <div className="relative">
        <IconMail
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10"
        />
        <input
          id="email"
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="name@example.com"
          maxLength={MAX_EMAIL_LENGTH}
          required
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : undefined}
          className={GetInputClass(!!error)}
        />
      </div>

      {error && (
        <div
          id="email-error"
          role="alert"
          className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex items-start gap-2">
            <IconAlertCircle size={18} className="mt-0.5 shrink-0 text-destructive" />
            <p className="text-sm font-medium text-foreground dark:text-white">{error}</p>
          </div>

          {/* Nếu tài khoản đăng ký qua Google thì gợi ý đăng nhập OAuth */}
          {socialProvider === "google" && <GoogleSignInButton />}

          {/* Nếu là nhà cung cấp khác thì hướng dẫn quay lại trang đăng nhập */}
          {socialProvider && socialProvider !== "google" && (
            <p className="mt-3 text-xs text-muted-foreground">
              Tài khoản này đăng ký qua{" "}
              <strong>{FormatSocialProvider(socialProvider)}</strong>. Vui lòng sử dụng nút đăng nhập tương ứng tại trang đăng nhập.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Màn hình sau khi gửi email thành công
function SentSuccessView({
  email,
  response,
}: {
  email: string;
  response: string | null;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 backdrop-blur-xl">
        <IconSend size={32} className="text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
        Kiểm tra email của bạn
      </h1>

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
        href={LOGIN_PATH}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <IconArrowLeft size={16} />
        Quay lại đăng nhập
      </Link>
    </div>
  );
}

// Link quay lại trang đăng nhập
function BackToSignInLink() {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground dark:text-slate-400">
      <Link
        href={LOGIN_PATH}
        className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
      >
        <IconArrowLeft size={16} />
        Quay lại đăng nhập
      </Link>
    </p>
  );
}

export default function ForgotPasswordPage() {
  // Trạng thái email người dùng nhập
  const [email, setEmail] = useState("");

  // Trạng thái đang gửi form
  const [loading, setLoading] = useState(false);

  // Trạng thái đã gửi email thành công
  const [sent, setSent] = useState(false);

  // Thông báo phản hồi từ server
  const [response, setResponse] = useState<string | null>(null);

  // Lỗi khi gửi email
  const [error, setError] = useState<string | null>(null);

  // Nhà cung cấp OAuth nếu tài khoản không dùng email/password
  const [socialProvider, setSocialProvider] = useState<string | null>(null);

  // Cập nhật email và xóa lỗi cũ
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);

    if (error) setError(null);
    if (socialProvider) setSocialProvider(null);
  }, [error, socialProvider]);

  // Gửi yêu cầu đặt lại mật khẩu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nếu chưa nhập email thì không xử lý
    if (!email) return;

    setLoading(true);

    try {
      const res = await forgotPassword(email);

      if (res.code === 200) {
        const message = res.message?.trim();

        if (message) {
          setResponse(message);
          toast.success(message);
        } else {
          toast.success("Đã gửi email đặt lại mật khẩu!");
        }

        setSent(true);
        return;
      }

      setError(res.message || "Gửi email thất bại");
    } catch (err: unknown) {
      // Lấy thông báo lỗi từ response API
      const data =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
          ? (err.response as { data?: { message?: string; data?: { provider?: string } } }).data
          : undefined;

      setError(data?.message || "Có lỗi xảy ra, vui lòng thử lại");

      // Kiểm tra tài khoản có đăng ký qua Google không
      if (data?.data?.provider === "google") {
        setSocialProvider("google");
      } else if (data?.data?.provider) {
        setSocialProvider(data.data.provider);
      } else {
        setSocialProvider(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <ForgotPasswordIllustration />

      {/* Form quên mật khẩu */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <MobileLogo />

          {sent ? (
            <SentSuccessView email={email} response={response} />
          ) : (
            <>
              {/* Tiêu đề */}
              <h1 className="text-2xl font-bold text-foreground dark:text-white">
                Quên mật khẩu?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>

              {/* Form nhập email */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <EmailField
                  value={email}
                  error={error}
                  socialProvider={socialProvider}
                  onChange={handleEmailChange}
                />

                {/* Nút gửi link */}
                <Button type="submit" className="w-full rounded-2xl h-12 mt-6" loading={loading}>
                  Gửi link đặt lại mật khẩu
                </Button>
              </form>

              <BackToSignInLink />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
