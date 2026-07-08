import type {
  ChatMessage,
  ChatOfferMetadata,
  ChatUser,
  SocketMessageNew,
} from "./types";

/**
 * Normalize offer metadata từ JSON payload (có thể snake_case hoặc camelCase
 * tùy backend version). FE luôn dùng camelCase.
 */
function normalizeOfferMetadata(raw: unknown): ChatOfferMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const price = Number(m.price ?? 0);
  const deliveryDays = Number(m.deliveryDays ?? m.delivery_days ?? 0);
  const revisionLimit = Number(m.revisionLimit ?? m.revision_limit ?? 0);
  const reviewDuration = Number(m.reviewDuration ?? m.review_duration ?? 0);
  const serviceId = Number(m.serviceId ?? m.service_id ?? 0);
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(deliveryDays) ||
    !Number.isFinite(revisionLimit) ||
    !Number.isFinite(reviewDuration) ||
    !Number.isFinite(serviceId)
  ) {
    return null;
  }
  const acceptedOrderIdRaw =
    m.acceptedOrderId ?? m.accepted_order_id ?? null;
  const result: ChatOfferMetadata = {
    price,
    deliveryDays,
    revisionLimit,
    reviewDuration,
    note: typeof m.note === "string" ? m.note : null,
    serviceId,
    acceptedOrderId:
      acceptedOrderIdRaw != null ? Number(acceptedOrderIdRaw) : null,
  };
  // exactOptionalPropertyTypes: chỉ set createdAt khi có string thực sự.
  if (typeof m.createdAt === "string") {
    result.createdAt = m.createdAt;
  }
  return result;
}

/**
 * Convert backend message payload (REST hoặc Socket) -> ChatMessage chuẩn FE.
 *
 * - REST: { id, conversationId, sender: {id,name,avatar}, type, content, attachment, createdAt }
 * - Socket: { messageId, conversationId, senderId, senderName, type, content, attachmentId, createdAt }
 *
 * Socket thiếu `avatar` -> nhận qua `peerLookup` từ useConversations cache.
 * Socket thiếu `attachment` (chỉ có attachmentId) -> để null, FE có thể fetch sau nếu cần.
 *
 * Service order (2026-06-19): thêm `metadata` cho type=offer.
 */
export function normalizeMessage(
  input: unknown,
  peerLookup?: (senderId: number) => ChatUser | null
): ChatMessage | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  // ---- id ----
  const id = Number(raw.id ?? raw.messageId);
  if (!Number.isFinite(id) || id <= 0) return null;

  // ---- sender ----
  let sender: ChatUser | null = null;
  if (raw.sender && typeof raw.sender === "object") {
    const s = raw.sender as Record<string, unknown>;
    sender = {
      id: Number(s.id),
      name: String(s.name ?? ""),
      avatar: typeof s.avatar === "string" ? s.avatar : null,
      alias: typeof s.alias === "string" ? s.alias : null,
    };
  } else if (raw.senderId != null) {
    const senderId = Number(raw.senderId);
    const senderName = String(raw.senderName ?? "");
    const fromCache = peerLookup?.(senderId);
    sender = {
      id: senderId,
      name: senderName || fromCache?.name || "",
      avatar: fromCache?.avatar ?? null,
      alias: fromCache?.alias ?? null,
    };
  }
  if (!sender || !Number.isFinite(sender.id)) return null;

  // ---- attachment ----
  let attachment: ChatMessage["attachment"] = null;
  if (raw.attachment && typeof raw.attachment === "object") {
    const a = raw.attachment as Record<string, unknown>;
    attachment = {
      id: Number(a.id),
      originalName: String(a.originalName ?? ""),
      mimeType: String(a.mimeType ?? ""),
      sizeBytes: Number(a.sizeBytes ?? 0),
      url: String(a.url ?? ""),
    };
  }

  // ---- type ----
  const type = (raw.type as ChatMessage["type"]) ?? "text";

  // ---- metadata (offer) ----
  const metadata =
    type === "offer" ? normalizeOfferMetadata(raw.metadata) : null;

  return {
    id,
    conversationId: Number(raw.conversationId ?? 0),
    sender,
    type,
    content: typeof raw.content === "string" ? raw.content : null,
    attachment,
    metadata,
    createdAt: String(raw.createdAt ?? ""),
  };
}

/**
 * Type guard cho SocketMessageNew (event từ socket.io).
 */
export function isSocketMessageNew(x: unknown): x is SocketMessageNew {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.messageId === "number" &&
    typeof r.conversationId === "number" &&
    typeof r.senderId === "number"
  );
}
