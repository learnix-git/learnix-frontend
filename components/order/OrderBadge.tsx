import React from "react";
import {
  Hourglass,
  CreditCard,
  BookOpen,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react";

import { Cn } from "@/lib/utils";
import { type ContractStatus, CONTRACT_STATUS_META } from "@/lib/api/contract";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER BADGE — Displays the status of a contract with its corresponding icon
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<
  ContractStatus,
  React.ComponentType<{ className?: string }>
> = {
  PENDING: Hourglass,
  OPEN: CreditCard,
  ACTIVE: BookOpen,
  DONE: CheckCircle2,
  CANCEL: XCircle,
  HOLD: PauseCircle,
};

export function OrderBadge({
  status,
  showIcon = true,
}: {
  status: ContractStatus;
  showIcon?: boolean;
}) {
  const meta = CONTRACT_STATUS_META[status];
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={Cn(
        "inline-flex items-center font-bold uppercase tracking-wider rounded-full border transition-all",
        showIcon ? "gap-1.5 px-3 py-1.5 text-sm" : "gap-1 text-[10px] px-2.5 py-1",
        meta.color,
        meta.bg,
        meta.border
      )}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      {meta.label}
    </span>
  );
}
