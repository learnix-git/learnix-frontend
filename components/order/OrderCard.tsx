import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, CreditCard, Eye } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { OrderBadge } from "@/components/order/OrderBadge";
import { Cn } from "@/lib/utils";
import {
  studentDeposit,
  tutorDeposit,
  type Contract,
  formatCurrency,
} from "@/lib/api/contract";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CARD — Renders a single contract item in the list
// ─────────────────────────────────────────────────────────────────────────────

export function OrderCard({
  contract,
  role,
  onView,
  onRefresh,
}: {
  contract: Contract;
  role: "student" | "tutor";
  onView: (code: string) => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const [depositLoading, setDepositLoading] = useState(false);

  const isStudent = role === "student";
  const partner = isStudent ? contract.teacher.account : contract.student.account;
  const partnerRole = isStudent ? "Gia sư giảng dạy" : "Học sinh thuê";

  const showDepositCta =
    contract.status === "OPEN" &&
    !contract.bills?.some((b) => b.type === "DEPOSIT" && b.status === "DONE");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const handleDeposit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDepositLoading(true);
    try {
      if (role === "student") await studentDeposit(contract.id);
      else await tutorDeposit(contract.id);
      toast.success("Đặt cọc thành công!");
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đặt cọc thất bại!");
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(contract.code)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onView(contract.code);
        }
      }}
      onMouseMove={handleMouseMove}
      aria-label={`Hợp đồng ${contract.code}`}
      className={Cn(
        "group relative overflow-hidden border border-white/60 dark:border-white/5",
        "bg-white/30 dark:bg-slate-900/40 backdrop-blur-2xl",
        "rounded-3xl p-5 sm:p-6 pl-7 sm:pl-8 shadow-sm transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
        "cursor-pointer active:scale-[0.985]",
        isStudent
          ? "hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5"
          : "hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5"
      )}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(350px_circle_at_var(--x,0px)_var(--y,0px),var(--spotlight-color),transparent_80%)]"
        style={
          {
            "--spotlight-color": isStudent
              ? "rgba(59,130,246,0.05)"
              : "rgba(139,92,246,0.05)",
          } as React.CSSProperties
        }
      />

      {/* Role accent bar */}
      <div
        className={Cn(
          "absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-300 group-hover:w-1.5",
          isStudent
            ? "bg-gradient-to-b from-blue-400 to-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            : "bg-gradient-to-b from-violet-400 to-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
        )}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        {/* ── Left ── */}
        <div className="space-y-3 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Role badge */}
            <span
              className={Cn(
                "inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-md transition-all duration-300",
                isStudent
                  ? "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 group-hover:bg-blue-500/10"
                  : "bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20 group-hover:bg-violet-500/10"
              )}
            >
              <span
                className={Cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  isStudent ? "bg-blue-500" : "bg-violet-500"
                )}
              />
              {isStudent ? "Đơn thuê" : "Đơn nhận"}
            </span>

            {/* Code */}
            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800/40 rounded-md border border-slate-200/40 dark:border-white/5">
              #{contract.code}
            </span>

            {/* Created date */}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(contract.created).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>

            <OrderBadge status={contract.status} />
          </div>

          {/* Title */}
          <h3
            className={Cn(
              "text-base font-black text-slate-800 dark:text-white tracking-tight line-clamp-2 transition-colors m-0 leading-snug",
              isStudent
                ? "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                : "group-hover:text-violet-600 dark:group-hover:text-violet-400"
            )}
          >
            {contract.title}
          </h3>

          {/* Partner + price */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 bg-slate-500/5 dark:bg-white/3 pl-2.5 pr-4 py-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-slate-500/10 dark:hover:bg-white/5">
              <Avatar
                src={partner.avatar || ""}
                alt={partner.name}
                size="sm"
                className="h-7 w-7 rounded-xl border border-white/20"
              />
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-none">
                  {partner.name}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {partnerRole}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200/60 dark:bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="text-xs text-muted-foreground">Học phí:</span>
              <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                {formatCurrency(Number(contract.total))}
              </span>
              <span className="text-xs text-muted-foreground">/tháng</span>
            </div>
          </div>
        </div>

        {/* ── Right: actions ── */}
        <div className="shrink-0 flex items-center justify-end gap-2">
          {/* Chat button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/chat`);
            }}
            aria-label="Nhắn tin"
            className={Cn(
              "h-10 w-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-white/5 text-slate-500 dark:text-slate-400 transition-all active:scale-[0.93] cursor-pointer",
              isStudent
                ? "hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5"
                : "hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/5"
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Deposit CTA */}
          {showDepositCta ? (
            <button
              onClick={handleDeposit}
              disabled={depositLoading}
              className="h-10 rounded-2xl px-5 font-bold text-[11px] tracking-widest bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition-all gap-1.5 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {depositLoading ? "XỬ LÝ..." : "ĐẶT CỌC"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(contract.code);
              }}
              className={Cn(
                "h-10 rounded-2xl px-5 font-bold text-[11px] tracking-wider border border-slate-200 dark:border-white/10 transition-all gap-1.5 active:scale-[0.96] bg-white/40 dark:bg-white/5 flex items-center gap-1.5 cursor-pointer",
                isStudent
                  ? "hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/5"
                  : "hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-500/5"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              XEM CHI TIẾT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
