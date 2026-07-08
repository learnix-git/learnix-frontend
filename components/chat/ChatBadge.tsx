"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import type { ChatOrderRef } from "@/lib/chat/types";
import { Cn } from "@/lib/utils";

export interface ChatOrderBadgeProps {
  order: ChatOrderRef;
  /** "compact" cho list item, "header" cho chat header (to + nhiều padding). */
  size?: "compact" | "header";
  className?: string;
}

interface BadgeStyle {
  wrap: string;
  icon: string;
}

function styleForStatus(status: number | null): BadgeStyle {
  if (status == null) {
    return {
      wrap: "bg-slate-500/10 border-slate-500/25 text-slate-700 dark:text-slate-300",
      icon: "text-slate-500",
    };
  }
  switch (status) {
    case ORDER_STATUS.PENDING_START:
      return {
        wrap: "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300",
        icon: "text-amber-500",
      };
    case ORDER_STATUS.IN_PROGRESS:
      return {
        wrap: "bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-300",
        icon: "text-blue-500",
      };
    case ORDER_STATUS.SUBMITTED:
      return {
        wrap: "bg-violet-500/10 border-violet-500/25 text-violet-700 dark:text-violet-300",
        icon: "text-violet-500",
      };
    case ORDER_STATUS.COMPLETED:
      return {
        wrap: "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300",
        icon: "text-emerald-500",
      };
    case ORDER_STATUS.REVISION_REQUESTED:
      return {
        wrap: "bg-orange-500/10 border-orange-500/25 text-orange-700 dark:text-orange-300",
        icon: "text-orange-500",
      };
    case ORDER_STATUS.DISPUTED:
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.REJECTED:
    case ORDER_STATUS.REFUNDED:
      return {
        wrap: "bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-300",
        icon: "text-rose-500",
      };
    default:
      return {
        wrap: "bg-slate-500/10 border-slate-500/25 text-slate-700 dark:text-slate-300",
        icon: "text-slate-500",
      };
  }
}

export function ChatOrderBadge({
  order,
  size = "compact",
  className,
}: ChatOrderBadgeProps) {
  if (!order?.code) return null;

  const styles = styleForStatus(order.status);
  const isHeader = size === "header";

  return (
    <Link
      href={`/don-hang/${order.code}`}
      onClick={(e) => e.stopPropagation()}
      title={`Đơn hàng ${order.code} • ${order.statusTitle ?? "—"}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer",
        styles.wrap,
        isHeader
          ? "h-8 px-3 text-[11px] font-bold"
          : "h-6 px-2 text-[9.5px] font-black uppercase tracking-wider",
        className,
      )}
    >
      <Receipt className={cn(isHeader ? "h-3.5 w-3.5" : "h-2.5 w-2.5", styles.icon)} />
      <span className={isHeader ? "" : "truncate max-w-[110px]"}>
        {order.code}
        {order.statusTitle && (
          <>
            <span className="opacity-60 mx-1">•</span>
            <span className={isHeader ? "" : "normal-case font-bold tracking-normal"}>
              {order.statusTitle}
            </span>
          </>
        )}
      </span>
    </Link>
  );
}
