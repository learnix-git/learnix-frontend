"use client";

import {
  BookOpen,
  Search,
  MessageSquare,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useChatConversations } from "@/hooks/chat/useChatConversations";
import { useChatPresence } from "@/hooks/chat/useChatPresence";
import { usePresenceStore } from "@/lib/stores/chat";
import { Avatar } from "@/components/ui/Avatar";
import { NormalizeString } from "@/lib/utils";
import type { 
  ChatConversation, 
  ChatCourseRef, 
  ChatUser 
} from "@/lib/chat/types";

export interface ChatListProps {
  id: string;
  peer: ChatUser;
  type: ChatConversation["type"]; // "direct" | "course"
  course: ChatCourseRef | null;
}

function FormatTime(iso: string | null) {
  if (!iso) return "";

  try {
    const date = new Date(iso.replace(" ", "T"));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso.substring(11, 16);
  }
}

function ChatListSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full p-4 flex gap-3.5 border-b border-slate-100/30 dark:border-white/5 animate-pulse"
        >
          {/* Avatar skeleton */}
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-zinc-800/80 flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-center">
              {/* Name skeleton */}
              <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800/80 rounded-md" />

              {/* Time skeleton */}
              <div className="h-2 w-8 bg-slate-200/60 dark:bg-zinc-800/60 rounded-md" />
            </div>

            {/* Message skeleton */}
            <div className="h-3 w-3/4 bg-slate-100 dark:bg-zinc-800/40 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatListItem({
  chat,
  selected,
  onClick,
}: {
  chat: ChatConversation;
  selected: boolean;
  onClick: () => void;
}) {
  // Trạng thái online của người trò chuyện
  const peerId = chat.peer?.id ?? "";
  
  const online = usePresenceStore((s) =>
    peerId ? s.online.has(peerId) : false
  );

  // Thông tin khóa học
  const courseTitle = chat.course?.name ?? "Khóa học";
  const courseThumb = chat.course?.thumbnail ?? null;
  const showThumb = chat.type === "course" && !!courseThumb;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full px-4 py-3 flex gap-3 transition-all text-left border-b border-slate-100/50 dark:border-white/5 ${
        selected
          ? "bg-primary/5 dark:bg-primary/15 border-r-4 border-r-primary"
          : "hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
      } ${
        chat.type === "course"
          ? "border-l-2 border-l-blue-500/50 dark:border-l-blue-400/50"
          : "border-l-2 border-l-transparent"
      }`}
    >
      {/* Ảnh khóa học */}
      <div className="relative flex-shrink-0 self-start">
        {showThumb ? (
          <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/40 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-zinc-800">
            <img
              src={courseThumb!}
              alt={courseTitle}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <>
            {/* Avatar người dùng */}
            <Avatar
              src={chat.peer?.avatar ?? undefined}
              alt={chat.peer?.name ?? ""}
              size="md"
              className="h-12 w-12 shadow-sm border border-white/40 dark:border-white/10"
            />

            {/* Trạng thái online */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#09090b] ${
                online ? "bg-green-500" : "bg-slate-300"
              }`}
            />
          </>
        )}
      </div>

      {/* Nội dung cuộc trò chuyện */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex justify-between items-center gap-2 min-w-0">
          {/* Tên người dùng */}
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-[14px] leading-none">
            {chat.peer?.name ?? "Không xác định"}
          </span>

          {/* Thời gian tin nhắn */}
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider flex-shrink-0 leading-none">
            {FormatTime(chat.lastMessageAt)}
          </span>
        </div>

        {/* Thông tin khóa học */}
        {chat.type === "course" && chat.course ? (
          <div className="flex items-center gap-1.5 min-w-0 text-[11px] leading-none">
            <BookOpen
              className={`w-3 h-3 flex-shrink-0 ${
                showThumb ? "text-blue-500/80" : "text-primary/80"
              }`}
            />

            {/* Tên khóa học */}
            <span className="truncate font-semibold text-primary/90 dark:text-primary/80 min-w-0">
              {courseTitle}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between items-center gap-2 min-w-0">
          {/* Tin nhắn gần nhất */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <p className="text-xs truncate leading-normal min-w-0 text-muted-foreground">
              {chat.lastMessagePreview ?? "Chưa có tin nhắn"}
            </p>
          </div>

          {/* Số tin nhắn chưa đọc */}
          {chat.unreadCount > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-black text-white shadow-md shadow-primary/20 flex-shrink-0">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function ChatList({
  userId,
  selectedId,
  onSelect,
  className,
  typeFilter,
}: {
  userId: string;
  selectedId: string | null;
  onSelect: (chat: ChatListProps) => void;
  className?: string;
  typeFilter?: "direct" | "course";
}) {
  // Danh sách cuộc trò chuyện và trạng thái tải
  const { items, loading } = useChatConversations(userId, selectedId, typeFilter);

  // Trạng thái tìm kiếm và lọc
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Lấy danh sách id để
  const peerIds = useMemo(
    () =>
      items
        .map((chat) => chat.peer?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    [items]
  );

  // Theo dõi trạng thái online
  useChatPresence(peerIds);

  // Lọc cuộc trò chuyện
  const filtered = useMemo(() => {
    const normalized = NormalizeString(search.trim());

    return items
      .filter((chat) => chat.peer)
      .filter((chat) => (filter === "unread" ? chat.unreadCount > 0 : true))
      .filter((chat) => {
        if (!normalized) return true;

        const peerName = NormalizeString(chat.peer!.name || "");
        const courseName = chat.course?.name
          ? NormalizeString(chat.course.name)
          : "";

        return (
          peerName.includes(normalized) ||
          (courseName.length > 0 &&
            courseName.includes(normalized))
        );
      });
  }, [items, search, filter]);

  // Kiểm tra các cuộc trò chuyện chưa đọc
  const unreadCount = items.some((chat) => chat.unreadCount > 0);

  return (
    <div className={`w-full md:w-80 flex-shrink-0 border-r border-slate-100 dark:border-white/5 flex flex-col h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl ${className ?? ""}`}>
      <div className="p-5 flex-shrink-0">
        {/* Tiêu đề */}
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
            Messages
          </h1>

          {/* Trạng thái */}
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/85" />

          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 pl-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/20 transition-all backdrop-blur-md"
          />
        </div>

        <div className="flex gap-1 p-1 mt-4.5 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 backdrop-blur-md">
          {/* Filter tất cả */}
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer ${
              filter === "all"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>

          {/* Filter chưa đọc */}
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
              filter === "unread"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chưa đọc

            {/* Chấm báo còn tin nhắn chưa đọc */}
            {unreadCount && (
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  filter === "unread"
                    ? "bg-white"
                    : "bg-primary animate-pulse"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Danh sách cuộc trò chuyện */}
      <div className="flex-1 overflow-y-auto border-t border-slate-100 dark:border-white/5">
        {loading ? (
          <ChatListSkeleton />
        ) : filtered.length > 0 ? (
          filtered.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              selected={chat.id === selectedId}

              // Chọn cuộc trò chuyện
              onClick={() =>
                onSelect({
                  id: chat.id,
                  peer: chat.peer!,
                  type: chat.type,
                  course: chat.course,
                })
              }
            />
          ))
        ) : (
          /* Không có cuộc trò chuyện */
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-48 select-none">
            {/* Icon */}
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />

            {/* Tiêu đề */}
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
              Trống
            </span>

            {/* Mô tả */}
            <span className="text-[11px] leading-relaxed">
              {filter === "unread"
                ? "Không có tin nhắn chưa đọc."
                : "Chưa có cuộc trò chuyện nào."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}