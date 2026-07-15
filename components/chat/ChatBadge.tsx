"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { Cn } from "@/lib/utils";

export interface ChatEnrollmentBadgeProps {
  enrollment: {
    code: string;
    status: "PENDING" | "PAID" | "CANCELLED" | string;
    statusTitle?: string | null;
  };
  size?: "compact" | "header";
  className?: string;
}

interface BadgeStyle {
  wrap: string;
  icon: string;
}

function styleForStatus(status: string): BadgeStyle {
  switch (status) {
    case "PENDING":
      return {
        wrap: "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300",
        icon: "text-amber-500",
      };
    case "PAID":
      return {
        wrap: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300",
        icon: "text-emerald-500",
      };
    case "CANCELLED":
    default:
      return {
        wrap: "bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300",
        icon: "text-rose-500",
      };
  }
}

export function ChatEnrollmentBadge({
  enrollment,
  size = "compact",
  className,
}: ChatEnrollmentBadgeProps) {
  if (!enrollment?.code) return null;

  const styles = styleForStatus(enrollment.status);
  const isHeader = size === "header";

  return (
    <Link
      href={`/invoices/${enrollment.code}`}
      onClick={(e) => e.stopPropagation()}
      title={`Hóa đơn ${enrollment.code} • ${enrollment.statusTitle ?? "—"}`}
      className={Cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer",
        styles.wrap,
        isHeader
          ? "h-8 px-3 text-[11px] font-bold"
          : "h-6 px-2 text-[9.5px] font-black uppercase tracking-wider",
        className
      )}
    >
      <Receipt className={Cn(isHeader ? "h-3.5 w-3.5" : "h-2.5 w-2.5", styles.icon)} />
      <span className={isHeader ? "" : "truncate max-w-[110px]"}>
        {enrollment.code}
        {enrollment.statusTitle && (
          <>
            <span className="opacity-60 mx-1">•</span>
            <span className={isHeader ? "" : "normal-case font-bold tracking-normal"}>
              {enrollment.statusTitle}
            </span>
          </>
        )}
      </span>
    </Link>
  );
}