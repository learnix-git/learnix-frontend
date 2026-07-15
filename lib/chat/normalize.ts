import type {
  ChatMessage,
  ChatUser,
  SocketNew,
} from "./types";

/**
 * - REST: { id, conversationId, sender: {id,name,avatar}, type, content, attachment, createdAt }
 * - Socket: { messageId, conversationId, senderId, senderName, type, content, attachmentId, createdAt }
 */

// ! Chuẩn hóa dữ liệu từ Socket hoặc REST API
export function NormalizeMessage(
  input: unknown,
  peerLookup?: (senderId: string) => ChatUser | null
): ChatMessage | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  // ---- id ----
  const id = String(raw.id ?? raw.messageId ?? "").trim();
  if (!id) return null;

  // ---- sender ----
  let sender: ChatUser | null = null;
  if (raw.sender && typeof raw.sender === "object") {
    const s = raw.sender as Record<string, unknown>;
    sender = {
      id: String(s.id ?? "").trim(),
      name: String(s.name ?? ""),
      avatar: typeof s.avatar === "string" ? s.avatar : null,
      alias: typeof s.alias === "string" ? s.alias : null,
    };
  } else if (raw.senderId != null) {
    const senderId = String(raw.senderId).trim();
    const senderName = String(raw.senderName ?? "");
    const fromCache = peerLookup?.(senderId);
    sender = {
      id: senderId,
      name: senderName || fromCache?.name || "",
      avatar: fromCache?.avatar ?? null,
      alias: fromCache?.alias ?? null,
    };
  }
  if (!sender || !sender.id) return null;

  // ---- attachment ----
  let attachment: ChatMessage["attachment"] = null;
  if (raw.attachment && typeof raw.attachment === "object") {
    const a = raw.attachment as Record<string, unknown>;
    attachment = {
      id: String(a.id ?? "").trim(),
      originalName: String(a.originalName ?? ""),
      mimeType: String(a.mimeType ?? ""),
      sizeBytes: Number(a.sizeBytes ?? 0),
      url: String(a.url ?? ""),
    };
  }

  // ---- type ----
  const type = (raw.type as ChatMessage["type"]) ?? "text";

  return {
    id,
    conversationId: String(raw.conversationId ?? "").trim(),
    sender,
    type,
    content: typeof raw.content === "string" ? raw.content : null,
    attachment,
    createdAt: String(raw.createdAt ?? ""),
  };
}

/**
 * Type guard cho SocketNew (event từ socket.io).
 */
export function CheckMessage(x: unknown): x is SocketNew {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.messageId === "string" &&
    typeof r.conversationId === "string" &&
    typeof r.senderId === "string"
  );
}