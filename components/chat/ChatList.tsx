"use client";

import {
  Briefcase,
  Handshake,
  Package,
  Search,
  MessageSquare,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useConversations } from "@/hooks/chat/useConversations";
import { usePresenceSync } from "@/hooks/chat/usePresenceSync";
import { usePresenceStore } from "@/lib/stores/presence";
import { Avatar } from "@/components/ui/Avatar";
import { normalizeVietnameseString } from "@/lib/utils";
import { ChatOrderBadge } from "./ChatBadge";
import type { Conversation } from "@/lib/chat/types";

export interface ChatListSelection {
  id: number;
  /**
   * Peer object — mirror `ChatUser` từ `lib/chat/types.ts`. Phải include các
   * field mới `ownerId`/`ownerAlias`/`creatorId`/`creatorAlias` để parent
   * (vd. `ChatWindow`) dùng resolve URL sang `/client/...` hoặc
   * `/freelancer/...` qua helper `peerProfileLink`.
   */
  peer: {
    id: number;
    name: string;
    avatar: string | null;
    alias: string | null;
    ownerId?: number | null;
    ownerAlias?: string | null;
    creatorId?: number | null;
    creatorAlias?: string | null;
  };
  type: "direct" | "project" | "service";
  projectId: number | null;
  projectName: string | null;
  projectAlias?: string | null;
  serviceId: number | null;
  serviceName: string | null;
  /**
   * Slug của service — dùng để build URL "Xem dịch vụ" theo alias thay vì id.
   * `ChatWindow` ưu tiên `service.alias` (route `/dich-vu/:slug`), fallback
   * về `/dich-vu/:id` chỉ khi alias null. Thread từ `conv.service.alias`
   * (xem `lib/chat/types.ts` `ChatServiceRef.alias`).
   */
  serviceAlias?: string | null;
  // Mở rộng (optional) — caller có thể dùng để hiển thị nhiều hơn.
  serviceThumbnail?: string | null;
  /**
   * `true` khi user hiện tại là chủ của service (seller side). `false` khi
   * user là buyer. `null` khi BE chưa trả về hoặc conv không gắn service.
   * Caller dùng để gate UI "Gửi offer" — chỉ seller mới thấy.
   */
  serviceIsFreelancer?: boolean | null;
  statusTitle?: string | null;
  /**
   * Order gắn với conversation (V2 §18.1). null nếu chưa có order.
   */
  order?: {
    id: number;
    code: string | null;
    status: number | null;
    statusTitle: string | null;
    statusTitles: { vi?: string; en?: string } | null;
    type: "service" | "project" | "legacy" | null;
  } | null;
}

function formatPreviewTime(iso: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso.replace(" ", "T"));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso.substring(11, 16);
  }
}

function ChatListItem({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const peerId = conv.peer?.id ?? 0;
  const online = usePresenceStore((s) =>
    peerId > 0 ? s.online.has(peerId) : false
  );

  // ── Quyết định leading visual theo type ────────────────────────────────
  // - type=service có thumbnail → show thumbnail (avatar tròn, cùng size).
  // - còn lại → show peer avatar như cũ.
  const serviceThumb = conv.service?.thumbnail ?? null;
  const showServiceThumb = conv.type === "service" && !!serviceThumb;
  /**
   * Detect offer preview — BE prefix "[offer]" trong lastMessagePreview khi
   * tin nhắn cuối là offer. Render chip nhỏ + đổi màu để user dễ thấy.
   */
  const isOfferPreview =
    conv.type === "service" &&
    typeof conv.lastMessagePreview === "string" &&
    conv.lastMessagePreview.startsWith("[offer]");
  const serviceTitle =
    conv.service?.title ?? conv.serviceName ?? `Dịch vụ #${conv.serviceId ?? ""}`;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full px-4 py-3 flex gap-3 transition-all text-left border-b border-slate-100/50 dark:border-white/5 ${
        selected
          ? "bg-primary/5 dark:bg-primary/15 border-r-4 border-r-primary"
          : "hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
      } ${
        conv.type === "project"
          ? "border-l-2 border-l-primary/60 dark:border-l-primary/50"
          : conv.type === "service"
            ? "border-l-2 border-l-blue-500/50 dark:border-l-blue-400/50"
            : "border-l-2 border-l-transparent"
      }`}
    >
      {/* ── Leading visual ───────────────────────────────────────────── */}
      <div className="relative flex-shrink-0 self-start">
        {showServiceThumb ? (
          <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/40 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-zinc-800">
            <img
              src={serviceThumb!}
              alt={serviceTitle}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <>
            <Avatar
              src={conv.peer?.avatar ?? undefined}
              alt={conv.peer?.name ?? ""}
              size="md"
              className="h-12 w-12 shadow-sm border border-white/40 dark:border-white/10"
            />
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#09090b] ${
                online ? "bg-green-500" : "bg-slate-300"
              }`}
            />
          </>
        )}
      </div>

      {/* ── Content (3 dòng cố định) ────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Row 1: Name + time */}
        <div className="flex justify-between items-center gap-2 min-w-0">
          <span className="font-bold text-slate-800 dark:text-slate-100 truncate text-[14px] leading-none">
            {conv.peer?.name ?? "Không xác định"}
          </span>
          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider flex-shrink-0 leading-none">
            {formatPreviewTime(conv.lastMessageAt)}
          </span>
        </div>

        {/* Row 2: Context — chỉ icon + tên (project / service) */}
        {conv.type === "project" ? (
          <div className="flex items-center gap-1.5 min-w-0 text-[11px] leading-none">
            <Briefcase className="w-3 h-3 flex-shrink-0 text-primary/80" />
            <span className="truncate font-semibold text-primary/90 dark:text-primary/80 min-w-0">
              {conv.projectName || `Dự án #${conv.projectId ?? ""}`}
            </span>
          </div>
        ) : conv.type === "service" ? (
          <div className="flex items-center gap-1.5 min-w-0 text-[11px] leading-none">
            <Package
              className={`w-3 h-3 flex-shrink-0 ${
                showServiceThumb ? "text-blue-500/80" : "text-primary/80"
              }`}
            />
            <span className="truncate font-semibold text-primary/90 dark:text-primary/80 min-w-0">
              {serviceTitle}
            </span>
          </div>
        ) : null}

        {/* Row 2.5: Order badge (V2 §18.2) — khi conversation có order gắn vào */}
        {conv.order && (
          <div className="flex">
            <ChatOrderBadge order={conv.order} size="compact" />
          </div>
        )}

        {/* Row 3: Preview + unread */}
        <div className="flex justify-between items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isOfferPreview && (
              <Handshake className="h-3 w-3 flex-shrink-0 text-primary" />
            )}
            <p
              className={`text-xs truncate leading-normal min-w-0 ${
                isOfferPreview
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {conv.lastMessagePreview ?? "Chưa có tin nhắn"}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-black text-white shadow-md shadow-primary/20 flex-shrink-0">
              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ChatListSkeleton() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full p-4 flex gap-3.5 border-b border-slate-100/30 dark:border-white/5 animate-pulse"
        >
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-zinc-800/80 flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800/80 rounded-md" />
              <div className="h-2 w-8 bg-slate-200/60 dark:bg-zinc-800/60 rounded-md" />
            </div>
            <div className="h-3 w-3/4 bg-slate-100 dark:bg-zinc-800/40 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatList({
  myId,
  selectedId,
  onSelect,
  className,
  typeFilter,
}: {
  myId: number;
  selectedId: number | null;
  onSelect: (conv: ChatListSelection) => void;
  className?: string;
  typeFilter?: "direct" | "project" | "service";
}) {
  const { items, loading } = useConversations(myId, selectedId, typeFilter);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "unread">("all");

  // Gom tất cả peerId đang hiển thị -> sync presence (spec 7.5)
  const peerIds = useMemo(
    () =>
      items
        .map((c) => c.peer?.id)
        .filter((id): id is number => typeof id === "number" && id > 0),
    [items]
  );
  usePresenceSync(peerIds);

  const filtered = useMemo(() => {
    const normalizedSearch = normalizeVietnameseString(search.trim());

    return items
      .filter((c) => c.peer)
      .filter((c) => (tab === "unread" ? c.unreadCount > 0 : true))
      .filter((c) => {
        if (!normalizedSearch) return true;
        const peerName = normalizeVietnameseString(c.peer!.name);
        const projectName = c.projectName
          ? normalizeVietnameseString(c.projectName)
          : "";
        const serviceName = c.serviceName
          ? normalizeVietnameseString(c.serviceName)
          : "";
        return (
          peerName.includes(normalizedSearch) ||
          (projectName.length > 0 && projectName.includes(normalizedSearch)) ||
          (serviceName.length > 0 && serviceName.includes(normalizedSearch))
        );
      });
  }, [items, search, tab]);

  const hasUnread = items.some((c) => c.unreadCount > 0);

  return (
    <div className={`w-full md:w-80 flex-shrink-0 border-r border-slate-100 dark:border-white/5 flex flex-col h-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl ${className ?? ""}`}>
      <div className="p-5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
            Messages
          </h1>
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
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
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer ${
              tab === "all"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "unread"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chưa đọc
            {hasUnread && (
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  tab === "unread" ? "bg-white" : "bg-primary animate-pulse"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-slate-100 dark:border-white/5">
        {loading ? (
          <ChatListSkeleton />
        ) : filtered.length > 0 ? (
          filtered.map((conv) => (
            <ChatListItem
              key={conv.id}
              conv={conv}
              selected={conv.id === selectedId}
              onClick={() =>
                onSelect({
                  id: conv.id,
                  peer: {
                    id: conv.peer!.id,
                    name: conv.peer!.name,
                    avatar: conv.peer!.avatar,
                    alias: conv.peer!.alias ?? null,
                    ownerId: conv.peer!.ownerId ?? null,
                    ownerAlias: conv.peer!.ownerAlias ?? null,
                    creatorId: conv.peer!.creatorId ?? null,
                    creatorAlias: conv.peer!.creatorAlias ?? null,
                  },
                  type: conv.type,
                  projectId: conv.projectId,
                  projectName: conv.projectName,
                  projectAlias: conv.project?.alias ?? null,
                  serviceId: conv.serviceId,
                  serviceName: conv.serviceName,
                  serviceAlias: conv.service?.alias ?? null,
                  serviceThumbnail: conv.service?.thumbnail ?? null,
                  serviceIsFreelancer: conv.service?.isFreelancer ?? null,
                  statusTitle: conv.statusTitle,
                  order: conv.order?.code
                    ? {
                        id: conv.order.id,
                        code: conv.order.code,
                        status: conv.order.status,
                        statusTitle: conv.order.statusTitle,
                        statusTitles: conv.order.statusTitles ?? null,
                        type: conv.order.type ?? null,
                      }
                    : null,
                })
              }
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-48 select-none">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
              Trống
            </span>
            <span className="text-[11px] leading-relaxed">
              {tab === "unread"
                ? "Không có tin nhắn chưa đọc."
                : "Chưa có cuộc trò chuyện nào."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
