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
  // Nếu dữ liệu không hợp lệ thì bỏ qua
  if (!input || typeof input !== "object") return null;

  const raw = input as Record<string, unknown>;

  // Lấy id của tin nhắn
  const id = String(raw.id ?? raw.messageId ?? "").trim();
  if (!id) return null;

  // Chuẩn hóa thông tin người gửi
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

  // Nếu không có thông tin người gửi thì bỏ qua
  if (!sender || !sender.id) return null;

  // Chuẩn hóa tệp đính kèm
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

  // Lấy loại tin nhắn
  const type = (raw.type as ChatMessage["type"]) ?? "text";

  // Trả về dữ liệu đã chuẩn hóa
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