import client from "./client";

export type PaymentType =
  | "DEPOSIT"  // đặt cọc
  | "PAYMENT"  // thanh toán
  | "PAYOUT"   // chuyển tiền cho gia sư
  | "PENALTY"  // phạt hủy
  | "REFUND";  // hoàn tiền

export type PaymentPhase = "FIRST" | "FINAL" | null;

export type PaymentStatus = "PENDING" | "DONE" | "FAILED" | "REFUNDED";

export interface PaymentBill {
  id: string;
  type: PaymentType;
  phase: PaymentPhase;
  amount: number;
  status: PaymentStatus;
  desc?: string;
  created: string;
  bank?: { id: string; name: string; number: string; holder: string } | null;
}

// POST /payments/contracts/:id/student-deposit
export async function studentDeposit(contractId: string): Promise<PaymentBill> {
  const res = await client.post<{ code: number; data: PaymentBill }>(
    `/payments/contracts/${contractId}/student-deposit`
  );
  return res.data.data;
}

// POST /payments/contracts/:id/tutor-deposit
export async function tutorDeposit(contractId: string): Promise<PaymentBill> {
  const res = await client.post<{ code: number; data: PaymentBill }>(
    `/payments/contracts/${contractId}/tutor-deposit`
  );
  return res.data.data;
}

// POST /payments/contracts/:id/pay-final
export async function studentPayFinal(contractId: string): Promise<PaymentBill> {
  const res = await client.post<{ code: number; data: PaymentBill }>(
    `/payments/contracts/${contractId}/pay-final`
  );
  return res.data.data;
}

// GET /payments/my
export async function getMyPayments(): Promise<PaymentBill[]> {
  const res = await client.get<{ code: number; data: PaymentBill[] }>(
    "/payments/my"
  );
  return res.data.data;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
