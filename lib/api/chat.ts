import client from "./client";
import type { ApiResponse } from "./types";
import type {
  ChatConversation,
  ChatMessage,
  ChatOrderRef,
  ChatProjectRef,
  ChatServiceRef,
  ChatStatus,
  ChatUser,
  SendMessagePayload,
} from "@/lib/chat/types";

export type UpsertConversationInput =
  | { peerId: number; projectId?: number }
  | { peerCreatorId: number; projectId?: number }
  | { serviceId: number };

export type ListConversationsFilter = {
  type?: "direct" | "project" | "service";
};

type RawChatUser = {
  id?: unknown;
  name?: unknown;
  avatar?: unknown;
  alias?: unknown;
};

type RawStatus = {
  status?: unknown;
  statusTitle?: unknown;
  statusTitles?: unknown;
};

type RawProject = {
  id?: unknown;
  name?: unknown;
  alias?: unknown;
  status?: unknown;
  statusTitle?: unknown;
  statusTitles?: unknown;
};

type RawService = {
  id?: unknown;
  title?: unknown;
  thumbnail?: unknown;
  price?: unknown;
  priceUnit?: unknown;
  alias?: unknown;
};

type RawOrder = {
  id?: unknown;
  code?: unknown;
  status?: unknown;
  statusTitle?: unknown;
  statusTitles?: unknown;
  type?: unknown;
};

type RawConversation = {
  id?: unknown;
  type?: unknown;
  project?: unknown;
  service?: unknown;
  order?: unknown;
  status?: unknown;
  statusTitle?: unknown;
  statusTitles?: unknown;
  projectId?: unknown;
  projectName?: unknown;
  serviceId?: unknown;
  serviceName?: unknown;
  peer?: unknown;
  lastMessageAt?: unknown;
  lastMessagePreview?: unknown;
  unreadCount?: unknown;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value == null) return null;
  return String(value);
}

function asStatusTitles(value: unknown): { vi?: string; en?: string } | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { vi?: unknown; en?: unknown };
  const out: { vi?: string; en?: string } = {};
  if (typeof v.vi === "string") out.vi = v.vi;
  if (typeof v.en === "string") out.en = v.en;
  return Object.keys(out).length > 0 ? out : null;
}

function normalizePeer(raw: unknown): ChatUser | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawChatUser;
  const id = asNumber(r.id);
  if (id == null) return null;
  return {
    id,
    name: asString(r.name) ?? "Người dùng",
    avatar: asString(r.avatar),
    alias: asString(r.alias),
  };
}

function normalizeStatus(raw: unknown): ChatStatus {
  if (!raw || typeof raw !== "object") {
    return { status: null, statusTitle: null, statusTitles: null };
  }
  const r = raw as RawStatus;
  return {
    status: asNumber(r.status),
    statusTitle: asString(r.statusTitle),
    statusTitles: asStatusTitles(r.statusTitles),
  };
}

function normalizeProject(raw: unknown): ChatProjectRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawProject;
  const id = asNumber(r.id);
  if (id == null) return null;
  return {
    id,
    name: asString(r.name) ?? "",
    alias: asString(r.alias),
    status: asNumber(r.status),
    statusTitle: asString(r.statusTitle),
    statusTitles: asStatusTitles(r.statusTitles),
  };
}

function normalizeService(raw: unknown): ChatServiceRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawService;
  const id = asNumber(r.id);
  if (id == null) return null;
  return {
    id,
    title: asString(r.title) ?? "",
    thumbnail: asString(r.thumbnail),
    price: asNumber(r.price),
    priceUnit: asString(r.priceUnit),
    alias: asString(r.alias),
  };
}

function normalizeOrder(raw: unknown): ChatOrderRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawOrder;
  const id = asNumber(r.id);
  if (id == null) return null;
  // Order type — service | project | legacy (V2 §6.1 getOrderType())
  const rawType = asString(r.type);
  const orderType: ChatOrderRef["type"] =
    rawType === "service" || rawType === "project" || rawType === "legacy"
      ? rawType
      : null;
  return {
    id,
    code: asString(r.code),
    status: asNumber(r.status),
    statusTitle: asString(r.statusTitle),
    statusTitles: asStatusTitles(r.statusTitles),
    type: orderType,
  };
}

/**
 * Map raw API conversation → `ChatConversation` chuẩn hoá.
 *
 * Backend trả về shape mới (nested `project`/`service`/`order` + status bậc
 * conversation). Hàm này derive các field flat `projectId`/`projectName`/
 * `serviceId`/`serviceName` để code consumer cũ (ChatList, ChatWindow,
 * useConversations) vẫn đọc được mà không phải refactor rộng.
 */
export function normalizeConversation(raw: unknown): ChatConversation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawConversation;

  const id = asNumber(r.id);
  if (id == null) return null;

  const typeRaw = asString(r.type);
  const type: ChatConversation["type"] =
    typeRaw === "project" || typeRaw === "service" ? typeRaw : "direct";

  const project = type === "project" ? normalizeProject(r.project) : null;
  const service = type === "service" ? normalizeService(r.service) : null;
  /**
   * V2 §18.1: service conversation CŨNG có thể có order (sau khi buyer mua
   * hoặc accept offer). Project conversation vẫn lấy order bình thường.
   * Direct conversation: order = null.
   */
  const order =
    type === "project" || type === "service"
      ? normalizeOrder(r.order)
      : null;

  // Conversation status = order.status (ưu tiên) → fallback project.status.
  // Service conversations: status lấy từ order (V2 §18.1) nếu có.
  let status: ChatStatus;
  if (order && order.status != null) {
    status = {
      status: order.status,
      statusTitle: order.statusTitle,
      statusTitles: order.statusTitles,
    };
  } else if (type === "service") {
    status = { status: null, statusTitle: null, statusTitles: null };
  } else if (project) {
    status = {
      status: project.status,
      statusTitle: project.statusTitle,
      statusTitles: project.statusTitles,
    };
  } else {
    // Fallback: dùng status ở top-level nếu BE có đặt (back-compat cũ).
    status = normalizeStatus(r);
  }

  const peer = normalizePeer(r.peer);
  const lastMessageAt = asString(r.lastMessageAt);
  const lastMessagePreview = asString(r.lastMessagePreview);
  const unreadCount = asNumber(r.unreadCount) ?? 0;

  // Flat alias — ưu tiên giá trị từ nested object, fallback về field flat cũ
  // (một số endpoint cũ vẫn trả projectId/serviceId ở top-level).
  const projectId =
    project?.id ?? asNumber(r.projectId) ?? null;
  const projectName =
    project?.name ?? asString(r.projectName) ?? null;
  const serviceId = service?.id ?? asNumber(r.serviceId) ?? null;
  const serviceName = service?.title ?? asString(r.serviceName) ?? null;

  return {
    id,
    type,
    project,
    service,
    order,
    status: status.status,
    statusTitle: status.statusTitle,
    statusTitles: status.statusTitles,
    projectId,
    projectName,
    serviceId,
    serviceName,
    peer,
    lastMessageAt,
    lastMessagePreview,
    unreadCount,
  };
}

export const ChatAPI = {
  upsertConversation: async (
    input: UpsertConversationInput
  ): Promise<ApiResponse<ChatConversation>> => {
    const r = await client.post("/chat/upsert", input);
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: normalizeConversation(raw.conversation ?? raw) as ChatConversation,
    };
  },

  listConversations: async (
    filter: ListConversationsFilter = {}
  ): Promise<
    ApiResponse<{ total: number; items: ChatConversation[] }>
  > => {
    const r = await client.post("/chat/list", filter);
    const raw = (r.data ?? {}) as Record<string, unknown>;
    const items = Array.isArray(raw.items)
      ? (raw.items
          .map((item) => normalizeConversation(item))
          .filter((c): c is ChatConversation => c !== null))
      : [];
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: {
        total: Number(raw.total ?? items.length),
        items,
      },
    };
  },

  getMessages: async (
    conversationId: number,
    page = 1,
    limit = 30
  ): Promise<ApiResponse<{ total: number; items: ChatMessage[] }>> => {
    const r = await client.post("/chat/messages", { conversationId, page, limit });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: {
        total: Number(raw.total ?? 0),
        items: Array.isArray(raw.items) ? (raw.items as ChatMessage[]) : [],
      },
    };
  },

  sendMessage: async (
    conversationId: number,
    payload: SendMessagePayload
  ): Promise<ApiResponse<ChatMessage>> => {
    const r = await client.post("/chat/send", { conversationId, ...payload });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: (raw.message ?? raw) as ChatMessage,
    };
  },

  markRead: async (
    conversationId: number,
    upToMessageId: number
  ): Promise<ApiResponse<{ updated: number; upToMessageId: number }>> => {
    const r = await client.post("/chat/read", { conversationId, upToMessageId });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: {
        updated: Number(raw.updated ?? 0),
        upToMessageId: Number(raw.upToMessageId ?? upToMessageId),
      },
    };
  },

  sendTyping: async (
    conversationId: number,
    isTyping: boolean
  ): Promise<ApiResponse<{ conversationId: number; isTyping: boolean }>> => {
    const r = await client.post("/chat/typing", { conversationId, isTyping });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: {
        conversationId: Number(raw.conversationId ?? conversationId),
        isTyping: Boolean(raw.isTyping),
      },
    };
  },

  checkOnline: async (
    userIds: number[]
  ): Promise<ApiResponse<{ online: number[] }>> => {
    const cleaned = Array.from(
      new Set(
        (userIds ?? [])
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0)
      )
    ).slice(0, 200);

    if (cleaned.length === 0) {
      return { code: 200, msg: "", data: { online: [] } };
    }

    try {
      const r = await client.post("/chat/online", { userIds: cleaned });
      const raw = (r.data ?? {}) as Record<string, unknown>;
      return {
        code: typeof raw.code === "number" ? raw.code : 0,
        msg: typeof raw.msg === "string" ? raw.msg : "",
        data: {
          online: Array.isArray(raw.online) ? (raw.online as number[]) : [],
        },
      };
    } catch (err) {
      console.warn("[chat] checkOnline error:", err);
      return { code: 0, msg: String(err), data: { online: [] } };
    }
  },

  uploadFile: async (
    conversationId: number,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<
    ApiResponse<{
      attachmentId: number;
      originalName: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
    }>
  > => {
    const fd = new FormData();
    fd.append("conversationId", String(conversationId));
    fd.append("file", file);
    const r = await client.post("/chat/upload", fd, {
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
      },
    });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: {
        attachmentId: Number(raw.attachmentId ?? 0),
        originalName: String(raw.originalName ?? ""),
        fileName: String(raw.fileName ?? ""),
        mimeType: String(raw.mimeType ?? ""),
        sizeBytes: Number(raw.sizeBytes ?? 0),
        url: String(raw.url ?? ""),
      },
    };
  },

  getUnreadCount: async (): Promise<
    ApiResponse<{
      total: number;
      items: { conversationId: number; count: number; latestAt: string }[];
    }>
  > => {
    const r = await client.post("/chat/unread-count", {});
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      msg: typeof raw.msg === "string" ? raw.msg : "",
      data: {
        total: Number(raw.total ?? 0),
        items: Array.isArray(raw.items)
          ? raw.items.map((item: unknown) => {
              const i = item as Record<string, unknown>;
              return {
                conversationId: Number(i.conversationId ?? 0),
                count: Number(i.count ?? 0),
                latestAt: String(i.latestAt ?? ""),
              };
            })
          : [],
      },
    };
  },
};

export type ChatResponse<T> = ApiResponse<T>;

// ============================================================================
// SERVICE CHAT — OFFER (2026-06-19, theo SERVICE_ORDER_API_GUIDE_V2.md §9)
// ============================================================================

/**
 * Body cho POST /chat/send-offer.
 * Chỉ service owner mới được gửi offer trong conversation type=service.
 *
 * **Case convention (V2 §9.1)**: 3 trường `deliveryDays` / `revisionLimit` /
 * `reviewDuration` là **camelCase** — đồng bộ với metadata JSON key trên
 * message. `conversation_id` vẫn snake_case theo convention cũ của endpoint.
 * Gửi snake_case cho 3 trường trên → BE reject 422.
 */
export interface SendOfferRequest {
  conversation_id: number;
  /** VND, integer > 0 */
  price: number;
  /** 1..365 — camelCase */
  deliveryDays: number;
  /** 0..20 (0 = không cho revision) — camelCase */
  revisionLimit: number;
  /** 1..30 — camelCase */
  reviewDuration: number;
  /** Optional note, max 500 chars (string | undefined để khớp Zod output). */
  note?: string | undefined;
}

/**
 * Response cho POST /chat/send-offer — BE trả về message vừa tạo (type=offer).
 */
export interface SendOfferResponse {
  code: number;
  msg: string;
  message?: ChatMessage;
}

/**
 * POST /chat/send-offer — Seller gửi offer trong chat type=service.
 *
 * Sau khi gửi, Node service sẽ fan-out `message:new` (type=offer) tới room
 * conversation:{id} và `notification:new` (type=service_offer_received) tới
 * user:{peerId}. Buyer nhận realtime → hiển thị offer card.
 *
 * Reference: SERVICE_ORDER_API_GUIDE_V2.md §9.
 */
export async function sendOffer(
  payload: SendOfferRequest,
): Promise<SendOfferResponse> {
  const r = await client.post<SendOfferResponse>("/chat/send-offer", payload);
  return (r.data ?? { code: 0, msg: "empty" }) as SendOfferResponse;
}
