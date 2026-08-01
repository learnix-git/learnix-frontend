"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconUser,
  IconGenderMale,
  IconGenderFemale,
  IconGenderHermaphrodite,
  IconSchool,
  IconChalkboard,
  IconCalendar,
  IconPhone,
} from "@tabler/icons-react";

import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/stores/auth";
import { sign } from "@/lib/auth/oauth";
import { Cn } from "@/lib/utils";

// Hằng số
const DEFAULT_FORM: RegisterFormData = {
  name: "",
  email: "",
  role: "STUDENT",
  gender: 0,
  dob: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 64;

const ROLE_OPTIONS = [
  {
    value: "STUDENT" as const,
    label: "Học sinh",
    icon: IconSchool,
    activeClass:
      "border-primary bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 shadow-md shadow-primary/10",
    inactiveClass:
      "border-white/40 dark:border-white/20 text-muted-foreground hover:border-primary/50",
  },
  {
    value: "TUTOR" as const,
    label: "Gia sư",
    icon: IconChalkboard,
    activeClass:
      "border-orange-500 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 shadow-md shadow-orange-500/10",
    inactiveClass:
      "border-white/40 dark:border-white/20 text-muted-foreground hover:border-purple-500/50",
  },
];

const GENDER_OPTIONS = [
  {
    value: 0,
    label: "Nam",
    icon: IconGenderMale,
    activeClass:
      "border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    inactiveClass:
      "border-white/40 dark:border-white/20 text-muted-foreground hover:border-blue-500/50",
  },
  {
    value: 1,
    label: "Nữ",
    icon: IconGenderFemale,
    activeClass:
      "border-pink-500 bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400",
    inactiveClass:
      "border-white/40 dark:border-white/20 text-muted-foreground hover:border-pink-500/50",
  },
  {
    value: 2,
    label: "Khác",
    icon: IconGenderHermaphrodite,
    activeClass:
      "border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
    inactiveClass:
      "border-white/40 dark:border-white/20 text-muted-foreground hover:border-purple-500/50",
  },
];

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

// Chuyển yyyy-mm-dd (lưu trong formData) sang Date
function ParseDob(value?: string): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// Chuyển Date sang yyyy-mm-dd (lưu trong formData)
function ToIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Chuyển yyyy-mm-dd sang dd/mm/yyyy (hiển thị)
function FormatDobDisplay(value?: string): string {
  const date = ParseDob(value);
  if (!date) return "";

  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

// Chuyển lỗi Zod sang object theo từng field
function ParseFieldErrors(
  result: ReturnType<typeof registerSchema.safeParse>
): FormErrors {
  if (result.success) return {};

  const fieldErrors: FormErrors = {};

  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof RegisterFormData;

    // Giữ lỗi đầu tiên của mỗi field
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

// Lấy className cho input, đổi màu border khi có lỗi
function GetInputClass(field: keyof RegisterFormData, errors: FormErrors, extra?: string) {
  return Cn(
    "w-full rounded-2xl border bg-white/30 dark:bg-white/10 backdrop-blur-sm pl-11 pr-4 py-3.5 text-sm text-foreground dark:text-white outline-none transition-all placeholder:text-muted-foreground/70 dark:placeholder:text-white/40",
    errors[field]
      ? "border-destructive/70 focus:border-destructive"
      : "border-white/40 dark:border-white/20 focus:border-primary",
    extra
  );
}

// Minh họa bên trái, chỉ hiển thị trên desktop
function SignUpIllustration() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl border-r border-white/40 dark:border-white/10 relative overflow-hidden items-center justify-center p-12">
      {/* Hiệu ứng nền */}
      <div className="absolute -top-1/2 -right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.15)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none" />
      <div
        className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_70%)] rounded-full animate-blob pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Ảnh minh họa */}
        <div className="relative w-full max-w-sm mx-auto mb-8 aspect-[4/3]">
          <Image
            src="/images/signup-illustration.svg"
            alt="Minh họa đăng ký Learnix"
            fill
            className="object-contain"
          />
        </div>

        <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">
          Gia nhập cộng đồng dạy & học Learnix
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          Nền tảng trực tuyến kết nối hàng ngàn giáo viên và học sinh. Khởi tạo lớp học của bạn hoặc tham gia học tập ngay hôm nay.
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

// Nút đăng ký bằng Google
function GoogleSignUpButton() {
  return (
    <button
      type="button"
      onClick={sign}
      className="mt-6 w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/40 dark:border-white/20 bg-white/30 dark:bg-white/10 backdrop-blur-sm py-3.5 text-sm font-medium text-foreground dark:text-white hover:bg-white/50 dark:hover:bg-white/20 transition-all cursor-pointer"
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
      Đăng ký với Google
    </button>
  );
}

// Đường phân cách giữa OAuth và form email
function AuthDivider({ label }: { label: string }) {
  return (
    <div className="mt-6 relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/30 dark:border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-transparent px-3 text-muted-foreground dark:text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

// Ô nhập họ tên
function NameField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errors: FormErrors = error ? { name: error } : {};

  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
        Họ và tên
      </label>

      <div className="relative">
        <IconUser
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10"
        />
        <input
          id="name"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nguyễn Văn A"
          maxLength={MAX_NAME_LENGTH}
          className={GetInputClass("name", errors)}
        />
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Chọn vai trò: học sinh hoặc gia sư
function RoleField({
  value,
  onChange,
}: {
  value: RegisterFormData["role"];
  onChange: (value: RegisterFormData["role"]) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
        Vai trò
      </label>

      <div className="grid grid-cols-2 gap-3">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.value;

          return (
            <label
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={Cn(
                "flex flex-col items-center justify-center text-center p-3.5 rounded-2xl border cursor-pointer transition-all",
                isActive ? opt.activeClass : opt.inactiveClass
              )}
            >
              <input
                type="radio"
                name="role"
                checked={isActive}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <div
                className={Cn(
                  "mb-1.5",
                  isActive ? "scale-110 transition-transform" : "opacity-60"
                )}
              >
                <Icon size={18} />
              </div>
              <span className="text-sm font-bold leading-tight">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Ô nhập email
function EmailField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errors: FormErrors = error ? { email: error } : {};

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
          className={GetInputClass("email", errors)}
        />
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Chọn giới tính
function GenderField({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
        Giới tính
      </label>

      <div className="flex gap-3">
        {GENDER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.value;

          return (
            <label
              key={opt.value}
              className={Cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm cursor-pointer transition-all",
                isActive ? opt.activeClass : opt.inactiveClass
              )}
            >
              <input
                type="radio"
                name="gender"
                checked={isActive}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span className={isActive ? "text-current" : "text-current opacity-50"}>
                <Icon size={18} />
              </span>
              {opt.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// Chọn ngày sinh bằng calendar
function DobField({
  value,
  error,
  open,
  onOpenChange,
  onChange,
}: {
  value: string;
  error?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
}) {
  const errors: FormErrors = error ? { dob: error } : {};

  return (
    <div>
      <label htmlFor="dob" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
        Ngày sinh
      </label>

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger
          type="button"
          id="dob"
          className={Cn("relative w-full text-left flex items-center", GetInputClass("dob", errors))}
        >
          <IconCalendar
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10"
          />
          <span className={value ? "" : "text-muted-foreground/70"}>
            {value ? FormatDobDisplay(value) : "dd/mm/yyyy"}
          </span>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0">
          <Calendar
            mode="single"
            selected={ParseDob(value)}
            defaultMonth={ParseDob(value)}
            onSelect={(date) => {
              // Nếu chưa chọn ngày thì không xử lý
              if (!date) return;

              onChange(ToIsoDate(date));
              onOpenChange(false);
            }}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Ô nhập số điện thoại
function PhoneField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errors: FormErrors = error ? { phone: error } : {};

  return (
    <div>
      <label htmlFor="phone" className="block text-sm font-medium text-foreground dark:text-white mb-1.5">
        Số điện thoại
      </label>

      <div className="relative">
        <IconPhone
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-white/80 z-10"
        />
        <input
          id="phone"
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0912345678"
          maxLength={MAX_PHONE_LENGTH}
          className={GetInputClass("phone", errors)}
        />
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
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
  id: "password" | "confirmPassword";
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
          className={GetInputClass(id, errors, "pr-10")}
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

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function SignUpPage() {
  const register = useAuth((s) => s.register);
  const router = useRouter();

  // Trạng thái form đăng ký
  const [formData, setFormData] = useState<RegisterFormData>(DEFAULT_FORM);

  // Trạng thái lỗi theo từng field
  const [errors, setErrors] = useState<FormErrors>({});

  // Trạng thái đang gửi form
  const [loading, setLoading] = useState(false);

  // Trạng thái hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Trạng thái mở calendar chọn ngày sinh
  const [dobOpen, setDobOpen] = useState(false);

  // Cập nhật 1 field và xóa lỗi tương ứng
  const updateField = useCallback(
    (field: keyof RegisterFormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      setErrors((prev) => {
        if (!prev[field]) return prev;
        return { ...prev, [field]: undefined };
      });
    },
    []
  );

  // Gửi form đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);

    // Nếu dữ liệu không hợp lệ thì hiển thị lỗi
    if (!result.success) {
      setErrors(ParseFieldErrors(result));
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

  return (
    <div className="min-h-screen flex">
      <SignUpIllustration />

      {/* Form đăng ký */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <MobileLogo />

          {/* Tiêu đề */}
          <h1 className="text-2xl font-bold text-foreground dark:text-white">
            Tạo tài khoản
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tham gia nền tảng dạy & học trực tuyến hàng đầu Việt Nam
          </p>

          <GoogleSignUpButton />
          <AuthDivider label="hoặc đăng ký bằng email" />

          {/* Form thông tin tài khoản */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <NameField
              value={formData.name}
              error={errors.name}
              onChange={(value) => updateField("name", value)}
            />

            <RoleField
              value={formData.role}
              onChange={(value) => updateField("role", value)}
            />

            <EmailField
              value={formData.email}
              error={errors.email}
              onChange={(value) => updateField("email", value)}
            />

            <GenderField
              value={formData.gender}
              onChange={(value) => updateField("gender", value)}
            />

            <DobField
              value={formData.dob ?? ""}
              error={errors.dob}
              open={dobOpen}
              onOpenChange={setDobOpen}
              onChange={(value) => updateField("dob", value)}
            />

            <PhoneField
              value={formData.phone ?? ""}
              error={errors.phone}
              onChange={(value) => updateField("phone", value)}
            />

            <PasswordField
              id="password"
              label="Mật khẩu"
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

            {/* Nút tạo tài khoản */}
            <Button type="submit" className="w-full rounded-2xl h-12 mt-6" loading={loading}>
              Tạo tài khoản
            </Button>
          </form>

          {/* Điều khoản và chính sách */}
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link href="/terms-of-service" className="text-primary hover:underline">
              Điều khoản Dịch vụ
            </Link>
            {" "}và{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Chính sách Bảo mật
            </Link>
          </p>

          {/* Liên kết sang trang đăng nhập */}
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
