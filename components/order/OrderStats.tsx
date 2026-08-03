import React from "react";
import {
  Package,
  TrendingUp,
  Hourglass,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Cn } from "@/lib/utils";
import { type Contract } from "@/lib/api/contract";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER STATS — Displays summary statistics for the contract list
// ─────────────────────────────────────────────────────────────────────────────

export function OrderStats({
  contracts,
  tab,
}: {
  contracts: Contract[];
  tab: "student" | "tutor";
}) {
  const total = contracts.length;
  const pending = contracts.filter((c) => c.status === "PENDING").length;
  const open = contracts.filter((c) => c.status === "OPEN").length;
  const active = contracts.filter((c) => c.status === "ACTIVE").length;
  const done = contracts.filter((c) => c.status === "DONE").length;
  const cancelled = contracts.filter((c) => c.status === "CANCEL").length;

  const isPurchase = tab === "student";

  const tiles = [
    {
      key: "total",
      label: "Tổng hợp đồng",
      value: total,
      subLabel: "Bao gồm mọi trạng thái",
      icon: isPurchase ? Package : TrendingUp,
      iconClass:
        "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10",
      valueClass: "text-slate-900 dark:text-white",
    },
    {
      key: "pending",
      label: "Chờ duyệt",
      value: pending,
      subLabel: "Chưa phản hồi hợp đồng",
      icon: Hourglass,
      iconClass:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      valueClass: "text-amber-600 dark:text-amber-400",
    },
    {
      key: "open",
      label: "Đang thực hiện",
      value: open + active,
      subLabel: "Đang học / đang chờ cọc",
      icon: Loader2,
      iconClass:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      valueClass: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "done",
      label: "Hoàn thành",
      value: done,
      subLabel: isPurchase ? "Đơn đã duyệt đã mua" : "Đơn đã hoàn thành",
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "cancelled",
      label: "Đã hủy",
      value: cancelled,
      subLabel: "Bởi bạn hoặc đối tác",
      icon: XCircle,
      iconClass:
        "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      valueClass: "text-slate-600 dark:text-slate-400",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <div
            key={t.key}
            className={Cn(
              "rounded-2xl border border-slate-200/70 dark:border-white/10",
              "bg-white/55 dark:bg-white/5 backdrop-blur-xl",
              "p-4 sm:p-5 shadow-sm",
              "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.12em] text-muted-foreground line-clamp-1">
                {t.label}
              </span>
              <div
                className={Cn(
                  "h-8 w-8 rounded-xl border flex items-center justify-center shrink-0",
                  t.iconClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div
              className={Cn(
                "mt-3 text-2xl sm:text-3xl font-black tabular-nums leading-none",
                t.valueClass
              )}
            >
              {t.value}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2 leading-snug">
              {t.subLabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
