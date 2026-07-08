// Theo spec section 5 của backend INTEGRATION.md

export interface ChatUser {
  id: number;
  name: string;
  avatar: string | null;
  alias: string | null;
}

export interface ChatAttachment {
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

/**
 * Offer metadata — payload của AppConversationMessage khi type="offer".
 * Mirror với backend's AppConversationMessage.metadata JSON shape.
 *
 * Reference: SERVICE_ORDER_API_GUIDE_V2.md §6.3 + CHAT_GUIDE.md §"Service Order integration".
 */
export interface ChatOfferMetadata {
  /** VND */
  price: number;
  /** Số ngày giao cam kết */
  deliveryDays: number;
  /** Số lần revision tối đa */
  revisionLimit: number;
  /** Số ngày review sau khi seller submit */
  reviewDuration: number;
  /** Note từ seller */
  note?: string | null;
  /** ID service mà offer này dành cho */
  serviceId: number;
  /** ISO timestamp khi offer được tạo */
  createdAt?: string;
  /**
   * Khi buyer accept offer, BE set field này = order.id.
   * Dùng làm race condition guard: nếu non-null thì offer đã được accept.
   * FE dùng để hiển thị "Đã chấp nhận" + disable button Accept.
   */
  acceptedOrderId?: number | null;
}

/**
 * Phân biệt message type — extend thêm "offer" cho service chat (2026-06-19).
 */
export type ChatMessageType = "text" | "image" | "file" | "offer" | "system";

export interface ChatMessage {
  id: number;
  conversationId: number;
  sender: ChatUser;
  type: ChatMessageType;
  content: string | null;
  attachment: ChatAttachment | null;
  /**
   * Offer payload — chỉ có khi `type === "offer"`. BE sẽ trả về
   * `metadata` như 1 field optional trên message JSON khi type=offer.
   */
  metadata?: ChatOfferMetadata | null;
  createdAt: string;
}

/**
 * Service gắn với cuộc trò chuyện (type=service).
 * Mirror với `service` object BE trả về trong list/upsert conversation.
 */
export interface ChatServiceRef {
  id: number;
  title: string;
  thumbnail: string | null;
  price: number | null;
  priceUnit: "fixed" | "hourly" | string | null;
  alias: string | null;
}

/**
 * Project gắn với cuộc trò chuyện (type=project).
 * `status`/`statusTitle`/`statusTitles` thuộc về project; conversation còn có
 * thêm `status` riêng (lấy từ order nếu có, fallback project).
 */
export interface ChatProjectRef {
  id: number;
  name: string;
  alias: string | null;
  status: number | null;
  statusTitle: string | null;
  statusTitles: { vi?: string; en?: string } | null;
}

/**
 * Order gắn với conversation (cả project và service, từ V2 §18.1).
 * `code` + `statusTitle` để render badge `{order.code} • {order.statusTitle}`
 * trong header chat list và chat window.
 */
export interface ChatOrderRef {
  id: number;
  /** Mã đơn hiển thị (VD: OR_19062026_3). */
  code: string | null;
  status: number | null;
  statusTitle: string | null;
  statusTitles: { vi?: string; en?: string } | null;
  /** Loại order — dùng để chọn màu badge (service vs project). */
  type?: "service" | "project" | "legacy" | null;
}

/**
 * Status bậc cao của conversation — lấy từ order khi có, fallback về project.
 * Service conversations luôn null.
 */
export interface ChatStatus {
  status: number | null;
  statusTitle: string | null;
  statusTitles: { vi?: string; en?: string } | null;
}

/**
 * Conversation trả về từ `/chat/list` và `/chat/upsert`.
 *
 * Shape mới (từ BE):
 *  - type=service:
 *    { id, type:"service", service:{...}, project:null, status:null, order:null, peer, ... }
 *  - type=project:
 *    { id, type:"project", project:{...}, service:null, status, statusTitle, statusTitles, order, peer, ... }
 *  - type=direct:
 *    { id, type:"direct", project:null, service:null, status:null, order:null, peer, ... }
 *
 * Field flat `projectId`/`projectName`/`serviceId`/`serviceName` được derive
 * từ các object lồng nhau bởi `normalizeConversation()` để code consumer cũ
 * (ChatList/ChatWindow/page) vẫn hoạt động mà không cần refactor rộng.
 */
export interface ChatConversation {
  id: number;
  type: "direct" | "project" | "service";
  // Nested refs (shape mới từ BE)
  project: ChatProjectRef | null;
  service: ChatServiceRef | null;
  order: ChatOrderRef | null;
  // Status bậc conversation (từ order → fallback project → null)
  status: number | null;
  statusTitle: string | null;
  statusTitles: { vi?: string; en?: string } | null;
  // Flat alias — back-compat cho code hiện tại (xem normalizeConversation)
  projectId: number | null;
  projectName: string | null;
  serviceId: number | null;
  serviceName: string | null;
  // Common
  peer: ChatUser | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

// --- Socket payloads (theo spec section 5) ---

export interface SocketMessageNew {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  type: ChatMessageType;
  content: string | null;
  attachmentId: number | null;
  /**
   * Offer payload — Node service sẽ include `metadata` khi fan-out
   * offer message (2026-06-19).
   */
  metadata?: ChatOfferMetadata | null;
  createdAt: string;
}

export interface SocketMessageRead {
  conversationId: number;
  readerId: number;
  upToMessageId: number;
  readAt: string;
}

export interface SocketTyping {
  conversationId: number;
  userId: number;
  isTyping: boolean;
}

export interface SocketPresence {
  userId: number;
  online: boolean;
  // Section 5.2: chưa implement ở backend, sẽ thêm nếu cần.
  // Khi BE gửi, FE sẽ hiển thị "Hoạt động X phút trước" thay vì "Offline".
  lastSeenAt?: string;
}

// --- Alias cho code hiện tại (back-compat) ---
export type Conversation = ChatConversation;
export type Attachment = ChatAttachment;
export type PresencePayload = SocketPresence;
export type TypingPayload = SocketTyping;
export type ReadPayload = SocketMessageRead;

export type SendMessagePayload =
  | { type: "text"; content: string }
  | { type: "image" | "file"; attachmentId: number; content?: string };

export interface SocketNotificationNew {
  id: number;
  type: string;
  sourceId: number | null;
  title: string;
  content: string;
  createdAt: string;
  targetId: number;
  userId: number;
}
