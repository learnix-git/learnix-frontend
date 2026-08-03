import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SKELETON — Loading placeholder for the contract card
// ─────────────────────────────────────────────────────────────────────────────

export function OrderSkeleton() {
  return (
    <div className="rounded-3xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-[70%] rounded-full bg-slate-200/80 dark:bg-white/5" />
          <div className="h-3 w-48 rounded-full bg-slate-200/50 dark:bg-white/5" />
        </div>
        <div className="h-10 w-28 rounded-2xl bg-slate-200/80 dark:bg-white/10 shrink-0" />
      </div>
    </div>
  );
}
