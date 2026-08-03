import client from "./client";
import type { PaymentBill } from "./payment";

export type ContractStatus =
  | "PENDING"  // học sinh vừa tạo, chờ gia sư đồng ý
  | "OPEN"     // gia sư đồng ý, chờ cả 2 đặt cọc
  | "ACTIVE"   // cả 2 đã đặt cọc, lớp học đang diễn ra
  | "DONE"     // hoàn thành
  | "CANCEL"   // bị hủy
  | "HOLD";    // tạm dừng

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ContractUser {
  id: string;
  name: string;
  alias: string | null;
  avatar: string | null;
}

export interface ContractStudent {
  id: string;
  account: ContractUser;
}

export interface ContractTutor {
  id: string;
  rating: number;
  major?: string | null;
  account: ContractUser;
}

export interface ContractRef {
  id: string;
  alias: string | null;
  title: string;
}

export interface SessionItem {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  summary?: string | null;
  feedback?: string | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  content: string;
  created: string;
}

export interface Contract {
  id: string;
  code: string;
  title: string;
  total: number;
  fee: number;
  income: number;
  count: number;
  status: ContractStatus;
  escrow: string;
  reason: string | null;
  created: string;
  updated?: string;

  // Quan hệ
  student: ContractStudent;
  teacher: ContractTutor;
  request?: ContractRef | null;
  class?: ContractRef | null;
  bills?: PaymentBill[];
  items?: SessionItem[];
  reviews?: ReviewItem[];
}

export interface CreateContractPayload {
  tutorId: string;
  requestId?: string;
  postId?: string;
  title: string;
  total: number;
  count: number;
}

// ─── Contract API ────────────────────────────────────────────────────────────

// GET /contracts/my
export async function getStudentContracts(): Promise<Contract[]> {
  const res = await client.get<{ code: number; data: Contract[] }>(
    "/contracts/my"
  );
  return res.data.data;
}

// GET /contracts/tutor
export async function getTutorContracts(): Promise<Contract[]> {
  const res = await client.get<{ code: number; data: Contract[] }>(
    "/contracts/tutor"
  );
  return res.data.data;
}

// GET /contracts/code/:code
export async function getContractDetail(code: string): Promise<Contract> {
  const res = await client.get<{ code: number; data: Contract }>(
    `/contracts/code/${code}`
  );
  return res.data.data;
}

// POST /contracts
export async function createContract(
  payload: CreateContractPayload
): Promise<Contract> {
  const res = await client.post<{ code: number; data: Contract }>(
    "/contracts",
    payload
  );
  return res.data.data;
}

// PATCH /contracts/:id/accept
export async function acceptContract(contractId: string): Promise<Contract> {
  const res = await client.patch<{ code: number; data: Contract }>(
    `/contracts/${contractId}/accept`
  );
  return res.data.data;
}

// PATCH /contracts/:id/reject
export async function rejectContract(
  contractId: string,
  reason: string
): Promise<Contract> {
  const res = await client.patch<{ code: number; data: Contract }>(
    `/contracts/${contractId}/reject`,
    { reason }
  );
  return res.data.data;
}

// PATCH /contracts/:id/cancel
export async function cancelContract(
  contractId: string,
  reason: string
): Promise<Contract> {
  const res = await client.patch<{ code: number; data: Contract }>(
    `/contracts/${contractId}/cancel`,
    { reason }
  );
  return res.data.data;
}

// PATCH /contracts/:id/finish
export async function finishContract(contractId: string): Promise<Contract> {
  const res = await client.patch<{ code: number; data: Contract }>(
    `/contracts/${contractId}/finish`
  );
  return res.data.data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const CONTRACT_STATUS_META: Record<
  ContractStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Chờ gia sư duyệt",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
  },
  OPEN: {
    label: "Chờ đặt cọc",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
  },
  ACTIVE: {
    label: "Đang học",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
  DONE: {
    label: "Hoàn thành",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-500/10",
    border: "border-slate-200 dark:border-slate-500/20",
  },
  CANCEL: {
    label: "Đã hủy",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20",
  },
  HOLD: {
    label: "Tạm dừng",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-500/20",
  },
};
