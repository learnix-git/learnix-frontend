import React from "react";
import { Hourglass, CreditCard, BookOpen, CheckCircle2 } from "lucide-react";
import { Cn } from "@/lib/utils";
import { type ContractStatus } from "@/lib/api/contract";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER TIMELINE — Visualizes the progress of a contract
// ─────────────────────────────────────────────────────────────────────────────

const TIMELINE_STEPS: Array<{
  key: ContractStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "PENDING", label: "Chờ gia sư duyệt", icon: Hourglass },
  { key: "OPEN", label: "Chờ đặt cọc", icon: CreditCard },
  { key: "ACTIVE", label: "Đang học", icon: BookOpen },
  { key: "DONE", label: "Hoàn thành", icon: CheckCircle2 },
];

export function OrderTimeline({ status }: { status: ContractStatus }) {
  const cancelled = status === "CANCEL" || status === "HOLD";
  const steps = TIMELINE_STEPS;
  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div className="relative flex items-center justify-between gap-0">
      {steps.map((step, idx) => {
        const isActive = step.key === status;
        const isDone = !cancelled && currentIdx > idx;
        const isPending = !isDone && !isActive;

        return (
          <div
            key={step.key}
            className="flex flex-col items-center flex-1 relative"
          >
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={Cn(
                  "absolute top-4 left-1/2 w-full h-0.5 transition-all",
                  isDone ? "bg-primary" : "bg-border/60"
                )}
              />
            )}
            {/* Circle */}
            <div
              className={Cn(
                "relative z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all",
                isActive && !cancelled
                  ? "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                  : isDone
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-background text-muted-foreground"
              )}
            >
              <step.icon className="h-3.5 w-3.5" />
            </div>
            <div
              className={Cn(
                "mt-2 text-center text-[10px] font-semibold leading-tight max-w-[60px]",
                isActive
                  ? "text-primary"
                  : isDone
                  ? "text-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </div>
          </div>
        );
      })}

      {cancelled && (
        <div className="absolute inset-0 flex items-start justify-center pt-0">
          <span className="absolute top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500 dark:text-red-400 bg-background px-2">
            Đã hủy
          </span>
        </div>
      )}
    </div>
  );
}
