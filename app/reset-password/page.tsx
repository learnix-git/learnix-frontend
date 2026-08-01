"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconArrowLeft,
} from "@tabler/icons-react";

import { LOGIN_PATH } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/api/auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import { Cn } from "@/lib/utils";

// Hằng số
const DEFAULT_FORM: ResetPasswordFormData = {
  password: "",
  confirmPassword: "",
};

const MAX_PASSWORD_LENGTH = 64;

type FormErrors = Partial<Record<keyof ResetPasswordFormData, string>>;

// Chuyển lỗi Zod sang object theo từng field
function ParseFieldErrors(
  result: ReturnType<typeof resetPasswordSchema.safeParse>
): FormErrors {
  if (result.success) return {};

  const fieldErrors: FormErrors = {};

  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ResetPasswordFormData;

    // Giữ lỗi đầu tiên của mỗi field
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

// Lấy className cho input mật khẩu
function GetInputClass(field: keyof ResetPasswordFormData, errors: FormErrors, extra?: string) {
  return Cn(
    "w-full rounded-2xl border bg-white/30 dark:bg-white/10 backdrop-blur-sm pl-11 pr-10 py-3.5 text-sm text-foreground dark:text-white outline-none transition-all placeholder:text-muted-foreground/70 dark:placeholder:text-white/40",
    errors[field]
      ? "border-destructive/70 focus:border-destructive"
      : "border-white/40 dark:border-white/20 focus:border-primary",
    extra
  );
}

// Logo Learnix dùng khi không có minh họa
function LearnixBrand() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
        <svg
          className="h-6 w-6 text-on-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold text-foreground dark:text-white">Learnix</span>
    </div>
  );
}

// Minh họa bên trái khi token hợp lệ
function ResetPasswordIllustration() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
      {/* Hiệu ứng nền */}
      <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Ảnh minh họa */}
        <div className="relative w-full max-w-sm mx-auto h-64 mb-8">
          <Image
            src="/images/reset-password-illustration.svg"
            alt="Minh họa bảo mật tài khoản Learnix"
            fill
            className="object-contain"
          />
        </div>

        <div className="mb-4 flex justify-center">
          <LearnixBrand />
        </div>

        <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">
          Bảo mật tài khoản
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          Đặt mật khẩu mới để bảo vệ tài khoản của bạn trên hệ thống.
        </p>
      </div>
    </div>
  );
}

// Panel trái khi token không hợp lệ
function InvalidTokenIllustration() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
      <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(34,211,238,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        <LearnixBrand />
      </div>
    </div>
  );
}

// Logo Learnix trên mobile
function MobileLogo() {
  return (
    <div className="lg:hidden text-center mb-8">
      <Link href="/" className="inline-flex items-center gap-2">
        <LearnixBrand />
      </Link>
    </div>
  );
}

// Ô nhập mật khẩu, có nút hiện/ẩn
function PasswordField({
  id,
  label,
  value,
  error,
  placeholder,
  showPassword,
  onChange,
  onToggleVisibility,
}: {
  id: keyof ResetPasswordFormData;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  const errors: FormErrors = error ? { [id]: error } : {};

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
        {label}
      </label>

      <div className="relative">
        <IconLock
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10"
        />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={MAX_PASSWORD_LENGTH}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={GetInputClass(id, errors)}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? (
            <IconEyeOff size={18} className="text-muted-foreground dark:text-white/80" />
          ) : (
            <IconEye size={18} className="text-muted-foreground dark:text-white/80" />
          )}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// Màn hình khi token không hợp lệ
function InvalidTokenView() {
  return (
    <div className="min-h-screen flex">
      <InvalidTokenIllustration />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] text-center">
          <MobileLogo />

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

// Màn hình sau khi đặt lại mật khẩu thành công
function ResetSuccessView({
  response,
  onSignIn,
}: {
  response: string | null;
  onSignIn: () => void;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <IconCheck size={32} className="text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
        Đặt lại mật khẩu thành công!
      </h1>

      {response && (
        <p className="text-sm font-medium text-foreground dark:text-white rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 mb-6 backdrop-blur-sm">
          {response}
        </p>
      )}

      <Button onClick={onSignIn} className="rounded-2xl w-full h-12">
        Đăng nhập ngay
      </Button>
    </div>
  );
}

// Link quay lại trang đăng nhập
function BackToSignInLink() {
  return (
    <p className="mt-8 text-center">
      <Link
        href={LOGIN_PATH}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <IconArrowLeft size={16} />
        Quay lại đăng nhập
      </Link>
    </p>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  // Trạng thái form mật khẩu mới
  const [formData, setFormData] = useState<ResetPasswordFormData>(DEFAULT_FORM);

  // Trạng thái lỗi theo từng field
  const [errors, setErrors] = useState<FormErrors>({});

  // Trạng thái đang gửi form
  const [loading, setLoading] = useState(false);

  // Trạng thái hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Trạng thái đặt lại thành công
  const [success, setSuccess] = useState(false);

  // Thông báo phản hồi từ server
  const [response, setResponse] = useState<string | null>(null);

  // Lỗi chung khi gọi API
  const [error, setError] = useState("");

  // Cập nhật 1 field và xóa lỗi tương ứng
  const updateField = useCallback(
    (field: keyof ResetPasswordFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      setErrors((prev) => {
        if (!prev[field]) return prev;
        return { ...prev, [field]: undefined };
      });

      if (error) setError("");
    },
    [error]
  );

  // Gửi form đặt lại mật khẩu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setErrors({});

    // Nếu không có token thì báo lỗi
    if (!token) {
      setError("Link đặt lại mật khẩu không hợp lệ");
      return;
    }

    const result = resetPasswordSchema.safeParse(formData);

    // Nếu dữ liệu không hợp lệ thì hiển thị lỗi
    if (!result.success) {
      setErrors(ParseFieldErrors(result));
      return;
    }

    setLoading(true);

    try {
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
        return;
      }

      setError(res.message || "Đặt lại mật khẩu thất bại");
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  // Nếu thiếu token thì hiển thị màn hình lỗi
  if (!token) {
    return <InvalidTokenView />;
  }

  return (
    <div className="min-h-screen flex">
      <ResetPasswordIllustration />

      {/* Form đặt lại mật khẩu */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <MobileLogo />

          {success ? (
            <ResetSuccessView
              response={response}
              onSignIn={() => router.push(LOGIN_PATH)}
            />
          ) : (
            <>
              {/* Tiêu đề */}
              <h1 className="text-2xl font-bold text-foreground dark:text-white">
                Đặt lại mật khẩu
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>

              {/* Form mật khẩu mới */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <PasswordField
                  id="password"
                  label="Mật khẩu mới"
                  value={formData.password}
                  error={errors.password}
                  placeholder="Tối thiểu 8 ký tự"
                  showPassword={showPassword}
                  onChange={(value) => updateField("password", value)}
                  onToggleVisibility={() => setShowPassword((prev) => !prev)}
                />

                <PasswordField
                  id="confirmPassword"
                  label="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  error={errors.confirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  showPassword={showConfirm}
                  onChange={(value) => updateField("confirmPassword", value)}
                  onToggleVisibility={() => setShowConfirm((prev) => !prev)}
                />

                {error && (
                  <p className="text-xs text-destructive" role="alert">
                    {error}
                  </p>
                )}

                {/* Nút đặt lại mật khẩu */}
                <Button type="submit" className="w-full rounded-2xl h-12" loading={loading}>
                  Đặt lại mật khẩu
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
