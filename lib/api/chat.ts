import client from "./client";
import type { ApiResponse } from "./types";
import type {
  ChatConversation,
  ChatMessage,
  MessagePayload,
  ChatUser,
} from "@/lib/chat/types";

// Dữ liệu tạo hoặc cập nhật cuộc trò chuyện
export type UpsertConversation = { peerId: string };

// Kiểu dữ liệu người dùng từ API
type ChatUserDTO = {
  id?: unknown;
  name?: unknown;
  avatar?: unknown;
  alias?: unknown;
};

// Kiểu dữ liệu cuộc trò chuyện từ API
type ChatConversationDTO = {
  id?: unknown;
  peer?: unknown;
  lastMessageAt?: unknown;
  lastMessagePreview?: unknown;
  unreadCount?: unknown;
};

// Chuyển dữ liệu sang kiểu number
function ConvertToNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

// Chuyển dữ liệu sang kiểu string
function ConvertToString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value == null) return null;

  return String(value);
}

// Chuẩn hóa thông tin người dùng
function NormalizePeer(raw: unknown): ChatUser | null {
  if (!raw || typeof raw !== "object") return null;

  const r = raw as ChatUserDTO;

  const id = ConvertToString(r.id);

  if (!id) return null;

  return {
    id,
    name: ConvertToString(r.name) ?? "Người dùng",
    avatar: ConvertToString(r.avatar),
    alias: ConvertToString(r.alias),
  };
}

// Chuẩn hóa dữ liệu cuộc trò chuyện
export function NormalizeConversation(
  raw: unknown,
): ChatConversation | null {
  if (!raw || typeof raw !== "object") return null;

  const r = raw as ChatConversationDTO;

  const id = ConvertToString(r.id);

  if (!id) return null;

  return {
    id,
    peer: NormalizePeer(r.peer),
    lastMessageAt: ConvertToString(r.lastMessageAt),
    lastMessagePreview: ConvertToString(r.lastMessagePreview),
    unreadCount: ConvertToNumber(r.unreadCount) ?? 0,
  };
}

// API xử lý chức năng chat
export const ChatAPI = {
  // Tạo hoặc cập nhật cuộc trò chuyện
  UpsertConversation: async (
    input: UpsertConversation,
  ): Promise<ApiResponse<ChatConversation>> => {
    const r = await client.post("/chat/upsert", input);
    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: NormalizeConversation(
        raw.conversation ?? raw,
      ) as ChatConversation,
    };
  },

  // Lấy danh sách cuộc trò chuyện
  FilterConversation: async (): Promise<
    ApiResponse<{ total: number; items: ChatConversation[] }>
  > => {
    const r = await client.post("/chat/list", {});
    const raw = (r.data ?? {}) as Record<string, unknown>;

    const items = Array.isArray(raw.items)
      ? raw.items
          .map(NormalizeConversation)
          .filter((c): c is ChatConversation => c !== null)
      : [];

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        total: Number(raw.total ?? items.length),
        items,
      },
    };
  },

  // Lấy danh sách tin nhắn
  RecvMessage: async (
    page = 1,
    limit = 30,
    conversationId: string,
  ): Promise<ApiResponse<{ total: number; items: ChatMessage[] }>> => {
    const r = await client.post("/chat/messages", {
      conversationId,
      page,
      limit,
    });

    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        total: Number(raw.total ?? 0),
        items: Array.isArray(raw.items)
          ? (raw.items as ChatMessage[])
          : [],
      },
    };
  },

  // Gửi tin nhắn
  SendMessage: async (
    conversationId: string,
    payload: MessagePayload,
  ): Promise<ApiResponse<ChatMessage>> => {
    const r = await client.post("/chat/send", {
      conversationId,
      ...payload,
    });

    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: (raw.message ?? raw) as ChatMessage,
    };
  },

    // Đánh dấu tin nhắn đã đọc
  MarkAsRead: async (
    conversationId: string,
    messageId: string,
  ): Promise<ApiResponse<{ updated: number; messageId: string }>> => {
    const r = await client.post("/chat/read", {
      conversationId,
      messageId,
    });

    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        updated: Number(raw.updated ?? 0),
        messageId: String(raw.messageId ?? messageId),
      },
    };
  },

  // Cập nhật trạng thái đang nhập
  CheckTyping: async (
    conversationId: string,
    typing: boolean,
  ): Promise<ApiResponse<{ conversationId: string; typing: boolean }>> => {
    const r = await client.post("/chat/typing", {
      conversationId,
      typing,
    });

    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        conversationId: String(raw.conversationId ?? conversationId),
        typing: Boolean(raw.typing),
      },
    };
  },

  // Kiểm tra người dùng đang trực tuyến
  CheckOnline: async (
    userIds: string[],
  ): Promise<ApiResponse<{ online: string[] }>> => {
    const cleaned = Array.from(
      new Set(
        (userIds ?? [])
          .map((id) => String(id))
          .filter((id) => id.trim() !== ""),
      ),
    ).slice(0, 200);

    // Trả về rỗng nếu không có user cần kiểm tra
    if (cleaned.length === 0) {
      return {
        code: 200,
        message: "",
        data: { online: [] },
      };
    }

    try {
      // Gọi API kiểm tra trạng thái online
      const r = await client.post("/chat/online", {
        userIds: cleaned,
      });

      const raw = (r.data ?? {}) as Record<string, unknown>;

      return {
        code: typeof raw.code === "number" ? raw.code : 0,
        message: typeof raw.message === "string" ? raw.message : "",
        data: {
          online: Array.isArray(raw.online)
            ? (raw.online as string[])
            : [],
        },
      };
    } catch (err) {
      // Trả về danh sách rỗng khi API lỗi
      console.warn(err);

      return {
        code: 0,
        message: String(err),
        data: { online: [] },
      };
    }
  },

  // Tải lên tệp đính kèm
  UploadFile: async (
    conversationId: string,
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<
    ApiResponse<{
      attachmentId: string;
      originalName: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      url: string;
    }>
  > => {
    const fd = new FormData();

    fd.append("conversationId", conversationId);
    fd.append("file", file);

    const r = await client.post("/chat/upload", fd, {
      onUploadProgress: (e) => {
        if (e.total) {
          onProgress?.(
            Math.round((e.loaded * 100) / e.total),
          );
        }
      },
    });

    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        attachmentId: String(raw.attachmentId ?? raw.id ?? ""),
        originalName: String(raw.originalName ?? raw.name ?? ""),
        fileName: String(raw.fileName ?? raw.name ?? ""),
        mimeType: String(raw.mimeType ?? raw.mime ?? ""),
        sizeBytes: Number(raw.sizeBytes ?? raw.size ?? 0),
        url: String(raw.url ?? ""),
      },
    };
  },

  // Lấy số lượng tin nhắn chưa đọc
  CountUnread: async (): Promise<
    ApiResponse<{
      total: number;
      items: {
        conversationId: string;
        count: number;
        latestAt: string;
      }[];
    }>
  > => {
    const r = await client.post("/chat/unread-count", {});

    const raw = (r.data ?? {}) as Record<string, unknown>;

    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        total: Number(raw.total ?? 0),
        items: Array.isArray(raw.items)
          ? raw.items.map((item: unknown) => {
              const i = item as Record<string, unknown>;

              return {
                conversationId: String(i.conversationId ?? ""),
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