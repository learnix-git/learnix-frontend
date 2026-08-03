"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Hourglass,
  PauseCircle,
  CreditCard,
  Wallet,
  Calendar,
  Star,
  User,
  BookOpen,
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  FileText,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth";
import {
  getContractDetail,
  acceptContract,
  rejectContract,
  cancelContract,
  finishContract,
  type Contract,
  type ContractStatus,
  CONTRACT_STATUS_META,
} from "@/lib/api/contract";
import {
  studentDeposit,
  tutorDeposit,
  studentPayFinal,
  type PaymentBill,
  formatCurrency,
} from "@/lib/api/payment";
import { Cn } from "@/lib/utils";

import { OrderBadge } from "@/components/order/OrderBadge";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { OrderPayment } from "@/components/order/OrderPayment";
import { OrderAction } from "@/components/order/OrderAction";

// ─────────────────────────────────────────────────────────────────────────────
// ORDER DETAIL PAGE — Displays detailed information about a single contract
// ─────────────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const code = params?.code as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/signin?callbackUrl=/order/${code}`);
    }
  }, [authLoading, isAuthenticated, router, code]);

  const fetchContract = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getContractDetail(code);
      setContract(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể tải hợp đồng";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  // Xác định role của user hiện tại trong hợp đồng
  const myRole = contract
    ? contract.student.account.id === user?.id
      ? "student"
      : contract.teacher.account.id === user?.id
      ? "tutor"
      : "none"
    : "none";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Đang tải hợp đồng...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="font-bold text-lg text-foreground">Không tìm thấy hợp đồng</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const other =
    myRole === "student" ? contract.teacher.account : contract.student.account;
  const otherRole = myRole === "student" ? "Gia sư" : "Học sinh";

  return (
    <div className="min-h-screen pb-24">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] opacity-40 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-400/6 rounded-full blur-[100px] opacity-40 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/order"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đơn hàng
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-lg">
                #{contract.code}
              </span>
              <OrderBadge status={contract.status} showIcon />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
              {contract.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tạo ngày {new Date(contract.created).toLocaleDateString("vi-VN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>

          {/* Chat button */}
          <Link
            href={`/chat`}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-background/60 text-sm font-semibold text-foreground hover:bg-muted hover:text-primary transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            Nhắn tin
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left Column (main info) ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Timeline */}
            <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-6">
                Tiến độ
              </h3>
              <OrderTimeline status={contract.status} />

              {contract.reason && (
                <div className="mt-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                    Lý do hủy / từ chối:
                  </p>
                  <p className="text-sm text-foreground">{contract.reason}</p>
                </div>
              )}
            </div>

            {/* Contract Info */}
            <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5">
                Thông tin hợp đồng
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Học phí/tháng",
                    value: formatCurrency(Number(contract.total)),
                    icon: Wallet,
                    highlight: true,
                  },
                  {
                    label: "Cọc 30%",
                    value: formatCurrency(Number(contract.fee)),
                    icon: ShieldCheck,
                  },
                  {
                    label: "Số buổi/tháng",
                    value: `${contract.count} buổi`,
                    icon: Calendar,
                  },
                  ...(contract.teacher.rating
                    ? [
                        {
                          label: "Đánh giá gia sư",
                          value: `${Number(contract.teacher.rating).toFixed(1)} ★`,
                          icon: Star,
                        },
                      ]
                    : []),
                  ...(contract.request
                    ? [
                        {
                          label: "Yêu cầu gốc",
                          value: contract.request.title,
                          icon: FileText,
                        },
                      ]
                    : []),
                  ...(contract.class
                    ? [
                        {
                          label: "Bài đăng gia sư",
                          value: contract.class.title,
                          icon: BookOpen,
                        },
                      ]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className={Cn(
                      "p-3.5 rounded-xl border",
                      item.highlight
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/40 bg-background/50"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <item.icon className={Cn("h-3.5 w-3.5", item.highlight ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <p className={Cn("text-sm font-bold truncate", item.highlight ? "text-primary" : "text-foreground")}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider mb-4">
                Lịch sử giao dịch
              </h3>
              <OrderPayment bills={contract.bills || []} />
            </div>

            {/* Sessions if any */}
            {contract.items && contract.items.length > 0 && (
              <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  Lịch học ({contract.items.length} buổi)
                </h3>
                <div className="space-y-2">
                  {contract.items.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background/60 border border-border/40"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(session.start).toLocaleString("vi-VN")}
                          {" – "}
                          {new Date(session.end).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={Cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full",
                          session.status === "DONE"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : session.status === "CANCEL"
                            ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        )}
                      >
                        {session.status === "DONE"
                          ? "Hoàn thành"
                          : session.status === "CANCEL"
                          ? "Hủy"
                          : "Sắp diễn ra"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right Column ─── */}
          <div className="space-y-5">
            {/* Partner card */}
            <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                {otherRole}
              </h3>
              <div className="flex items-center gap-3">
                {other.avatar ? (
                  <img
                    src={other.avatar}
                    alt={other.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <span className="text-lg font-black text-primary">
                      {other.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-foreground">{other.name}</p>
                  {other.alias && (
                    <p className="text-xs text-muted-foreground">@{other.alias}</p>
                  )}
                  {myRole === "student" && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-foreground">
                        {Number(contract.teacher.rating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {other.alias && (
                <Link
                  href={myRole === "student" ? `/tutor/${other.alias}` : `/profile`}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border/60 text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                  Xem hồ sơ
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {/* Deposit status */}
            <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Trạng thái đặt cọc
              </h3>
              {(() => {
                const deposits = contract.bills?.filter(
                  (b) => b.type === "DEPOSIT" && b.status === "DONE"
                ) ?? [];
                const pct = Math.min((deposits.length / 2) * 100, 100);
                return (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Tiến độ</span>
                      <span className="text-foreground">{deposits.length}/2 bên</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { role: "Học sinh", user: contract.student.account, isTutor: false },
                        { role: "Gia sư",   user: contract.teacher.account, isTutor: true },
                      ].map((party, idx) => {
                        const deposited = deposits.length > idx;
                        return (
                          <div
                            key={party.role}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground">
                              {party.role}: {party.user.name}
                            </span>
                            <span
                              className={Cn(
                                "font-semibold",
                                deposited
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-500"
                              )}
                            >
                              {deposited ? "✓ Đã cọc" : "Chờ cọc"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <OrderAction
              contract={contract}
              role={myRole as "student" | "tutor" | "none"}
              onRefresh={fetchContract}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
