import { Cn } from "@/lib/utils";

// ! Các biến thể màu sắc của Badge
type Variants =
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "warning"
  | "info"
  | "success"
  | "outline";

// ! Khai báo style tương ứng cho từng Variants
const Styles: Record<Variants, string> = {
  default:
    "bg-muted text-muted-foreground",

  primary:
    "bg-primary/20 text-primary dark:text-primary-foreground border border-primary/30",

  secondary:
    "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors",

  accent:
    "bg-accent/10 text-accent",

  warning:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",

  info:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",

  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",

  outline:
    "bg-transparent border border-border text-foreground",
};

// ! Định nghĩa Props của Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: Variants;
  className?: string;
}

// ! Badge dùng để hiển thị nhãn trạng thái hoặc phân loại
export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={Cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        Styles[variant],
        className,
      )}
    >
      {/* Nội dung của Badge */}
      {children}
    </span>
  );
}