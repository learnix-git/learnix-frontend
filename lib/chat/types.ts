export interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  alias: string | null;
  role?: "STUDENT" | "TEACHER" | "ADMIN" | string;
}

export interface ChatAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatUser;
  type: "text" | "image" | "file" | "system";
  content: string | null;
  attachment: ChatAttachment | null;
  createdAt: string;
}

export interface ChatCourseRef {
  id: string;
  code: string | null;
  name: string;
  slug?: string | null;
  grade?: string | null;
  thumbnail: string | null;
  price: number | null;
}

export interface ChatConversation {
  id: string;
  type: "direct" | "course";
  course: ChatCourseRef | null;
  peer: ChatUser | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface SocketNew {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: "text" | "image" | "file" | "system";
  content: string | null;
  attachmentId: string | null;
  createdAt: string;
}

export interface SocketRead {
  conversationId: string;
  readerId: string;
  messageId: string;
  readAt: string;
}

export interface SocketType {
  conversationId: string;
  userId: string;
  typing: boolean;
}

export interface SocketPresence {
  userId: string;
  online: boolean;
  lastSeenAt?: string;
}

export interface SocketNotification {
  id: string;
  type: string;
  sourceId: string | null;
  title: string;
  content: string;
  createdAt: string;
  targetId: string;
  userId: string;
}

export type MessagePayload = | { type: "text"; content: string } | { type: "image" | "file"; attachmentId: string; content?: string };