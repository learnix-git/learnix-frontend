import React from "react";
import { type PaymentBill, formatCurrency } from "@/lib/api/payment";
import { Cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER PAYMENT — Displays the payment history and bills of a contract
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_TYPE_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  DEPOSIT: { label: "Đặt cọc", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  PAYMENT: { label: "Thanh toán", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  PAYOUT: { label: "Chuyển tiền", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
  PENALTY: { label: "Phạt hủy", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  REFUND: { label: "Hoàn tiền", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
};

export function OrderPayment({ bills }: { bills: PaymentBill[] }) {
  if (!bills || bills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Chưa có giao dịch nào
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {bills.map((bill) => {
        const meta = PAYMENT_TYPE_META[bill.type] ?? {
          label: bill.type,
          color: "text-foreground",
          bg: "bg-muted",
        };
        return (
          <div
            key={bill.id}
            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-background/60 border border-border/40"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={Cn(
                  "shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold",
                  meta.color,
                  meta.bg
                )}
              >
                {meta.label}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {formatCurrency(Number(bill.amount))}
                </p>
                {bill.desc && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {bill.desc}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className={Cn(
                  "text-xs font-semibold",
                  bill.status === "DONE"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : bill.status === "FAILED"
                    ? "text-red-500"
                    : "text-amber-500"
                )}
              >
                {bill.status === "DONE"
                  ? "✓ Thành công"
                  : bill.status === "FAILED"
                  ? "✗ Thất bại"
                  : "Đang xử lý"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {new Date(bill.created).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
