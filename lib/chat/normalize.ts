import type {
  ChatMessage,
  ChatUser,
  SocketNew,
} from "./types";

// Chuẩn hóa dữ liệu từ REST API hoặc Socket
export function NormalizeMessage(
  input: unknown,
  peerLookup?: (senderId: string) => ChatUser | null
): ChatMessage | null {
  if (!input || typeof input !== "object") return null;

  const raw = input as Record<string, unknown>;

  // REST dùng "id", socket dùng "messageId"
  const id = String(raw.id ?? raw.messageId ?? "").trim();
  if (!id) return null;

  // REST dùng "room", socket dùng "conversationId"
  const conversationId = String(raw.conversationId ?? raw.room ?? "").trim();

  // Chuẩn hóa thông tin người gửi
  let sender: ChatUser | null = null;

  if (raw.user && typeof raw.user === "object") {
    const u = raw.user as Record<string, unknown>;

    sender = {
      id: String(u.id ?? "").trim(),
      name: String(u.name ?? ""),
      avatar: typeof u.avatar === "string" ? u.avatar : null,
      alias: null,
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
  } else if (typeof raw.sender === "string") {
    const senderId = raw.sender.trim();
    const fromCache = peerLookup?.(senderId);

    sender = {
      id: senderId,
      name: fromCache?.name || "",
      avatar: fromCache?.avatar ?? null,
      alias: fromCache?.alias ?? null,
    };
  }

  if (!sender || !sender.id) return null;

  let attachment: ChatMessage["attachment"] = null;

  if (raw.attachment && typeof raw.attachment === "object") {
    const a = raw.attachment as Record<string, unknown>;

    attachment = {
      id: String(a.id ?? "").trim(),
      originalName: String(a.originalName ?? a.name ?? ""),
      mimeType: String(a.mimeType ?? a.mime ?? ""),
      sizeBytes: Number(a.sizeBytes ?? a.size ?? 0),
      url: String(a.url ?? ""),
    };
  }

  const kindRaw = String(raw.type ?? raw.kind ?? "text").toLowerCase();
  const type = (kindRaw as ChatMessage["type"]) || "text";

  // REST dùng "created", socket dùng "createdAt"
  const createdAt = String(raw.createdAt ?? raw.created ?? "");

  return {
    id,
    conversationId,
    sender,
    type,
    content: typeof raw.content === "string" ? raw.content : null,
    attachment,
    createdAt,
  };
}

// Kiểm tra dữ liệu có đúng định dạng tin nhắn từ socket
export function CheckMessage(x: unknown): x is SocketNew {
  // Nếu dữ liệu không hợp lệ thì bỏ qua
  if (!x || typeof x !== "object") return false;

  const raw = x as Record<string, unknown>;

  // Kiểm tra các trường bắt buộc
  return (
    typeof raw.messageId === "string" &&
    typeof raw.conversationId === "string" &&
    typeof raw.senderId === "string"
  );
}