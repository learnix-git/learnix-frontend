import client from "./client";
import type { ApiResponse } from "./types";
import type {
  ChatConversation,
  ChatMessage,
  MessagePayload,
  ChatUser,
} from "@/lib/chat/types";

export type UpsertConversation =
  | { peerId: string } 
  | { peerId: string; courseId: string }; 

export type FilterConversation = {
  type?: "direct" | "course";
};

type ChatUserDTO = {
  id?: unknown;
  name?: unknown;
  avatar?: unknown;
  alias?: unknown;
};

type ChatConversationDTO = {
  id?: unknown;
  type?: unknown;
  course?: unknown;
  courseId?: unknown;
  courseName?: unknown;
  peer?: unknown;
  lastMessageAt?: unknown;
  lastMessagePreview?: unknown;
  unreadCount?: unknown;
};

function ConvertToNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function ConvertToString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value == null) return null;
  return String(value);
}

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

export function NormalizeConversation(raw: unknown): ChatConversation | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as ChatConversationDTO;

  const id = ConvertToString(r.id);
  if (!id) return null;

  const type: ChatConversation["type"] = ConvertToString(r.type) === "course" ? "course" : "direct";

  let course = null;
  if (r.course && typeof r.course === "object") {
    const c = r.course as Record<string, unknown>;
    course = {
      id: ConvertToString(c.id) ?? "",
      code: ConvertToString(c.code),
      name: ConvertToString(c.name) ?? "",
      thumbnail: ConvertToString(c.thumbnail),
      price: ConvertToNumber(c.price)
    };
  }

  return {
    id,
    type,
    course,
    peer: NormalizePeer(r.peer),
    lastMessageAt: ConvertToString(r.lastMessageAt),
    lastMessagePreview: ConvertToString(r.lastMessagePreview),
    unreadCount: ConvertToNumber(r.unreadCount) ?? 0,
  };
}

export const ChatAPI = {
  // ! Hàm tạo cuộc trò chuyện hoặc cập nhật cuộc trò chuyện
  UpsertConversation: async (
    input: UpsertConversation
  ): Promise<ApiResponse<ChatConversation>> => {
    const r = await client.post("/chat/upsert", input);
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: NormalizeConversation(raw.conversation ?? raw) as ChatConversation,
    };
  },

  // ! Hàm lấy danh sách cuộc trò chuyện
  FilterConversation: async (
    filter: FilterConversation = {}
  ): Promise<ApiResponse<{ total: number; items: ChatConversation[] }>> => {
    const r = await client.post("/chat/list", filter);
    const raw = (r.data ?? {}) as Record<string, unknown>;
    const items = Array.isArray(raw.items)
      ? raw.items.map(NormalizeConversation).filter((c): c is ChatConversation => c !== null)
      : [];
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: { total: Number(raw.total ?? items.length), items },
    };
  },

  // ! Hàm nhận tin nhắn
  RecvMessage: async (
    page = 1,
    limit = 30,
    conversationId: string,
  ): Promise<ApiResponse<{ total: number; items: ChatMessage[] }>> => {
    const r = await client.post("/chat/messages", { conversationId, page, limit });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        total: Number(raw.total ?? 0),
        items: Array.isArray(raw.items) ? (raw.items as ChatMessage[]) : [],
      },
    };
  },

  // ! Hàm gửi tin nhắn
  SendMessage: async (
    conversationId: string,
    payload: MessagePayload
  ): Promise<ApiResponse<ChatMessage>> => {
    const r = await client.post("/chat/send", { conversationId, ...payload });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: (raw.message ?? raw) as ChatMessage,
    };
  },

  // ! Hàm đánh dấu là đã đọc
  MarkAsRead: async (
    conversationId: string, 
    messageId: string 
  ): Promise<ApiResponse<{ updated: number; messageId: string }>> => {
    const r = await client.post("/chat/read", { conversationId, messageId });
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

  // ! Hàm kiểm tra đang gõ
  CheckTyping: async (
    conversationId: string,
    typing: boolean
  ): Promise<ApiResponse<{ conversationId: string; typing: boolean }>> => {
    const r = await client.post("/chat/typing", { conversationId, typing });
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

  // ! Hàm kiểm tra trạng thái hoạt động
  CheckOnline: async (
    userIds: string[]
  ): Promise<ApiResponse<{ online: string[] }>> => {
    const cleaned = Array.from(
      new Set(
        (userIds ?? []).map((id) => String(id)).filter((id) => id.trim() !== "")
      )
    ).slice(0, 200);

    if (cleaned.length === 0) {
      return { code: 200, message: "", data: { online: [] } };
    }

    try {
      const r = await client.post("/chat/online", { userIds: cleaned });
      const raw = (r.data ?? {}) as Record<string, unknown>;
      return {
        code: typeof raw.code === "number" ? raw.code : 0,
        message: typeof raw.message === "string" ? raw.message : "",
        data: {
          online: Array.isArray(raw.online) ? (raw.online as string[]) : [],
        },
      };
    } catch (err) {
      console.warn("[chat] checkOnline error:", err);
      return { code: 0, message: String(err), data: { online: [] } };
    }
  },

  // ! Hàm tải lên file
  UploadFile: async (
    conversationId: string, 
    file: File,
    onProgress?: (pct: number) => void
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
        if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
      },
    });
    const raw = (r.data ?? {}) as Record<string, unknown>;
    return {
      code: typeof raw.code === "number" ? raw.code : 0,
      message: typeof raw.message === "string" ? raw.message : "",
      data: {
        attachmentId: String(raw.attachmentId ?? ""),
        originalName: String(raw.originalName ?? ""),
        fileName: String(raw.fileName ?? ""),
        mimeType: String(raw.mimeType ?? ""),
        sizeBytes: Number(raw.sizeBytes ?? 0),
        url: String(raw.url ?? ""),
      },
    };
  },

  // ! Hàm đếm tin nhắn chưa đọc
  CountUnread: async (): Promise<
    ApiResponse<{
      total: number;
      items: { conversationId: string; count: number; latestAt: string }[];
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
                conversationId: String(i.conversationId ?? ""), // Ép kiểu chuỗi
                count: Number(i.count ?? 0),
                latestAt: String(i.latestAt ?? ""),
              };
            })
          : 
        [],
      },
    };
  },
};

export type ChatResponse<T> = ApiResponse<T>;