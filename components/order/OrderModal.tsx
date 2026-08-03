import React from "react";
import { Cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER MODAL — Reusable reason modal for rejecting or cancelling a contract
// ─────────────────────────────────────────────────────────────────────────────

export function OrderModal({
  title,
  confirmLabel,
  confirmClass,
  reason,
  onReasonChange,
  loading,
  onConfirm,
  onClose,
}: {
  title: string;
  confirmLabel: string;
  confirmClass: string;
  reason: string;
  onReasonChange: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-card border border-border p-6 shadow-2xl">
        <h3 className="font-bold text-lg text-foreground mb-4">{title}</h3>
        <textarea
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          rows={4}
          placeholder="Nhập lý do..."
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={Cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 cursor-pointer transition-all",
              confirmClass
            )}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
