import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Wallet,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth";
import {
  acceptContract,
  rejectContract,
  cancelContract,
  finishContract,
  studentDeposit,
  tutorDeposit,
  studentPayFinal,
  type Contract,
  formatCurrency,
} from "@/lib/api/contract";
import { OrderModal } from "./OrderModal";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER ACTION — Action panel with relevant buttons based on role and status
// ─────────────────────────────────────────────────────────────────────────────

export function OrderAction({
  contract,
  role,
  onRefresh,
}: {
  contract: Contract;
  role: "student" | "tutor" | "none";
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reason, setReason] = useState("");

  const act = async (label: string, fn: () => Promise<any>) => {
    setLoading(label);
    try {
      await fn();
      toast.success(`${label} thành công!`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `${label} thất bại!`);
    } finally {
      setLoading(null);
    }
  };

  const userId = useAuth((s) => s.user?.id);
  const myDeposit = contract.bills?.find(
    (b) =>
      b.type === "DEPOSIT" &&
      b.status === "DONE" &&
      (role === "student"
        ? contract.student.account.id === userId
        : contract.teacher.account.id === userId)
  );
  
  const finalPaid = !!contract.bills?.find(
    (b) => b.type === "PAYMENT" && b.phase === "FINAL" && b.status === "DONE"
  );

  const { status } = contract;

  return (
    <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
        Hành động
      </h3>

      {/* TUTOR: duyệt/từ chối khi PENDING */}
      {role === "tutor" && status === "PENDING" && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => act("Đồng ý hợp đồng", () => acceptContract(contract.id))}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-60 transition-all cursor-pointer"
          >
            <BadgeCheck className="h-4 w-4" />
            {loading === "Đồng ý hợp đồng" ? "Đang xử lý..." : "Đồng ý nhận lớp"}
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-60 transition-all cursor-pointer"
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </button>
        </div>
      )}

      {/* Đặt cọc khi OPEN */}
      {status === "OPEN" && (
        <div className="space-y-2">
          {!myDeposit ? (
            <button
              onClick={() =>
                act(
                  "Đặt cọc",
                  role === "student"
                    ? () => studentDeposit(contract.id)
                    : () => tutorDeposit(contract.id)
                )
              }
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              <CreditCard className="h-4 w-4" />
              {loading === "Đặt cọc"
                ? "Đang xử lý..."
                : `Đặt cọc ${formatCurrency(Number(contract.fee))}`}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Bạn đã đặt cọc
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Cọc 30% = {formatCurrency(Number(contract.fee))} • Hoàn lại khi hoàn thành
          </p>
        </div>
      )}

      {/* Học sinh thanh toán 70% khi ACTIVE */}
      {role === "student" && status === "ACTIVE" && !finalPaid && (
        <button
          onClick={() => act("Thanh toán 70%", () => studentPayFinal(contract.id))}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all cursor-pointer shadow-md shadow-primary/20"
        >
          <Wallet className="h-4 w-4" />
          {loading === "Thanh toán 70%"
            ? "Đang xử lý..."
            : `Thanh toán ${formatCurrency(Number(contract.income))}`}
        </button>
      )}

      {/* Kết thúc hợp đồng khi ACTIVE và 70% đã trả */}
      {status === "ACTIVE" && finalPaid && (
        <button
          onClick={() => act("Kết thúc hợp đồng", () => finishContract(contract.id))}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 disabled:opacity-60 transition-all cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          {loading === "Kết thúc hợp đồng" ? "Đang xử lý..." : "Xác nhận hoàn thành"}
        </button>
      )}

      {/* Hủy hợp đồng */}
      {(status === "OPEN" || status === "ACTIVE") && (
        <button
          onClick={() => setShowCancelModal(true)}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border/60 bg-background/60 text-muted-foreground text-sm font-semibold hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 disabled:opacity-60 transition-all cursor-pointer"
        >
          <AlertTriangle className="h-4 w-4" />
          Hủy hợp đồng (mất cọc)
        </button>
      )}

      {/* Đã hoàn thành */}
      {status === "DONE" && (
        <div className="flex items-center justify-center gap-2 py-4 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          <CheckCircle2 className="h-5 w-5" />
          Hợp đồng đã hoàn thành
        </div>
      )}

      {/* Đã hủy */}
      {status === "CANCEL" && (
        <div className="flex items-center justify-center gap-2 py-4 text-red-500 font-semibold text-sm">
          <XCircle className="h-5 w-5" />
          Hợp đồng đã bị hủy
        </div>
      )}

      {/* Modals */}
      {showRejectModal && (
        <OrderModal
          title="Lý do từ chối"
          confirmLabel="Từ chối hợp đồng"
          confirmClass="bg-red-500 hover:bg-red-600 text-white"
          reason={reason}
          onReasonChange={setReason}
          loading={loading === "Từ chối"}
          onConfirm={() => {
            if (!reason.trim()) {
              toast.error("Vui lòng nhập lý do!");
              return;
            }
            act("Từ chối", () => rejectContract(contract.id, reason)).then(() =>
              setShowRejectModal(false)
            );
          }}
          onClose={() => {
            setShowRejectModal(false);
            setReason("");
          }}
        />
      )}
      {showCancelModal && (
        <OrderModal
          title="Hủy hợp đồng"
          confirmLabel="Xác nhận hủy (mất cọc)"
          confirmClass="bg-destructive hover:bg-destructive/90 text-white"
          reason={reason}
          onReasonChange={setReason}
          loading={loading === "Hủy hợp đồng"}
          onConfirm={() => {
            if (!reason.trim()) {
              toast.error("Vui lòng nhập lý do!");
              return;
            }
            act("Hủy hợp đồng", () => cancelContract(contract.id, reason)).then(
              () => setShowCancelModal(false)
            );
          }}
          onClose={() => {
            setShowCancelModal(false);
            setReason("");
          }}
        />
      )}
    </div>
  );
}
