"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { freelancers } from "@/lib/data";
import {
  AlertCircle,
  Briefcase,
  ChevronLeft,
  Handshake,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package as PackageIcon,
  Paperclip,
  Send,
  WifiOff,
  X,
} from "lucide-react";
import { useChatRoom } from "@/hooks/chat/useChatRoom";
import { usePresenceSync } from "@/hooks/chat/usePresenceSync";
import { useChatStatus } from "@/hooks/chat/useChatStatus";
import { reconnectChat } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import { usePresenceStore } from "@/lib/stores/presence";
import { MessageBubble } from "./ChatBubble";
import { OfferMessage } from "./OfferMessage";
import { SendOfferModal } from "./SendOfferModal";
import { ChatOrderBadge } from "./ChatBadge";
import { Avatar } from "@/components/ui/Avatar";
import { formatPriceUnit } from "@/lib/service-filters";
import type { ChatUser, ChatOrderRef } from "@/lib/chat/types";
import { peerProfileLink } from "@/lib/chat/peer-link";

/**
 * Service context gắn vào header. Có thể là id+name tối thiểu (từ URL) hoặc
 * full object từ API (có thumbnail, price, priceUnit) — UI tự fallback.
 *
 * `isFreelancer` mirror với `ChatServiceRef.isFreelancer` từ response
 * `/api/v1/chat/list` (BE 2026-07-06): true khi service thuộc về user-as-
 * freelancer hiện tại (seller side) → gate UI "Gửi offer".
 */
type ServiceContext =
  | {
      id: number;
      name: string;
      thumbnail?: string | null;
      price?: number | null;
      priceUnit?: string | null;
      alias?: string | null;
      /** SLA fields — optional, fallback về defaults khi null. */
      deliveryDays?: number | null;
      revisionLimit?: number | null;
      reviewDuration?: number | null;
      isFreelancer?: boolean | null;
    }
  | null;

type ProjectContext =
  | {
      id: number;
      name: string;
      alias: string | null;
      statusTitle?: string | null;
      status?: number | null;
    }
  | null;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 5000;
const ALLOWED_EXT = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
  "zip",
];

type UploadState = {
  name: string;
  size: number;
  ext: string;
  kind: "image" | "document" | "spreadsheet" | "archive" | "file";
  progress: number;
  status: "uploading" | "sending" | "failed";
  error?: string;
};

function getExt(name: string) {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.substring(idx + 1).toLowerCase() : "";
}

function getFileKind(file: File): UploadState["kind"] {
  const ext = getExt(file.name);
  if (file.type.startsWith("image/")) return "image";
  if (["xls", "xlsx"].includes(ext)) return "spreadsheet";
  if (ext === "zip") return "archive";
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return "document";
  return "file";
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon({ kind }: { kind: UploadState["kind"] }) {
  const className = "h-5 w-5";
  if (kind === "image") return <FileImage className={className} />;
  if (kind === "spreadsheet") return <FileSpreadsheet className={className} />;
  if (kind === "archive") return <FileArchive className={className} />;
  return <FileText className={className} />;
}

/**
 * Spec 5.4: "Hoạt động X phút trước" khi offline có lastSeenAt.
 *   < 1 phút -> "Vừa mới truy cập"
 *   < 60 phút -> "Hoạt động X phút trước"
 *   < 24 giờ -> "Hoạt động X giờ trước"
 *   >= 1 ngày -> "Hoạt động X ngày trước"
 */
function formatLastSeen(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso.replace(" ", "T"));
    const diffMs = Date.now() - d.getTime();
    if (Number.isNaN(diffMs) || diffMs < 0) return null;
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "Vừa mới truy cập";
    if (minutes < 60) return `Hoạt động ${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hoạt động ${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hoạt động ${days} ngày trước`;
    return null;
  } catch {
    return null;
  }
}

function MessageBubbleSkeleton({ isMine }: { isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} animate-pulse`}>
      <div
        className={`max-w-[70%] px-4.5 py-3 rounded-2xl border transition-all ${
          isMine
            ? "bg-slate-200 dark:bg-zinc-800 border-transparent rounded-tr-sm w-[40%]"
            : "bg-slate-100 dark:bg-zinc-900 border-slate-100/50 dark:border-white/5 rounded-tl-sm w-[50%]"
        }`}
      >
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-300 dark:bg-zinc-750 rounded-md" />
          <div className="h-3 w-5/6 bg-slate-300 dark:bg-zinc-750 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({
  conversationId,
  peer,
  myId,
  onBack,
  project,
  service,
  canSendOffer = false,
  conversationOrder = null,
}: {
  conversationId: number;
  peer: ChatUser;
  myId: number;
  onBack?: () => void;
  project?: ProjectContext;
  service?: ServiceContext;
  /**
   * Cho phép hiển thị button "Gửi offer" — parent set true khi:
   *  - conversation type === "service"
   *  - current user là owner của service (seller side)
   */
  canSendOffer?: boolean;
  /**
   * Order gắn với conversation (V2 §18.1). Khi có → hiển thị badge trong
   * header. Parent lấy từ `conv.order` khi user chọn conversation.
   */
  conversationOrder?: ChatOrderRef | null;
}) {
  const {
    messages,
    peerTyping,
    loading,
    loadingOlder,
    hasMore,
    error,
    readByPeer,
    loadOlder,
    send,
    markRead,
    emitTyping,
  } =
    useChatRoom(conversationId, myId);
  const { status: socketStatus, lastError: socketError } = useChatStatus();

  /**
   * Build URL trỏ về trang hồ sơ của peer.
   *
   * BE 2026-07-06 trả các field mới trên peer: `ownerId`/`ownerAlias`
   * (AppOwner) và `creatorId`/`creatorAlias` (AppCreator). Helper
   * `peerProfileLink()` quyết định URL theo thứ tự ưu tiên spec BE:
   *   - ownerId  → /client/<ownerAlias || ownerId>
   *   - creatorId → /freelancer/<creatorAlias || creatorId>
   *   - không có → null (peer chưa có profile, header chỉ render text)
   *
   * `service?.isFreelancer` KHÔNG còn dùng để quyết định route nữa — BE là
   * nguồn quyết định duy nhất, tránh sai lệch khi role thật của peer
   * không trùng với context conversation (vd. buyer chưa có owner profile
   * nhưng peer là freelancer).
   */
  const peerLink = peerProfileLink(peer);
  const profileUrl = peerLink?.url ?? null;

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  /**
   * Service offer modal — chỉ mở được khi conversation type=service VÀ
   * current user là service owner (peer != service.user). Parent truyền
   * prop `canSendOffer` để gate UI.
   */
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingOlderScrollHeightRef = useRef<number | null>(null);
  // Đánh dấu user đã rời đỉnh ít nhất 1 lần. Khi mới mở conv, container có
  // thể đã ở scrollTop=0 mà user chưa cuộn gì (do content ngắn hoặc auto-scroll
  // chưa kịp chạy) — nếu cứ thấy ở đỉnh là loadOlder thì sẽ fire ngay khi mount.
  const hasLeftTopRef = useRef(false);
  // Sync presence cho peer đang chat (peer không nằm trong ChatList items
  // -> cần gọi riêng để biết online/offline ngay khi mở conv)
  usePresenceSync([peer.id]);
  const peerOnline = usePresenceStore((s) => s.online.has(peer.id));
  const peerLastSeenAt = usePresenceStore((s) => s.lastSeen[peer.id] ?? null);
  const peerLastSeenLabel = formatLastSeen(peerLastSeenAt);
  const isUploadingAttachment =
    uploadState?.status === "uploading" || uploadState?.status === "sending";

  useEffect(() => {
    if (scrollRef.current && pendingOlderScrollHeightRef.current !== null) {
      const previousHeight = pendingOlderScrollHeightRef.current;
      pendingOlderScrollHeightRef.current = null;
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight - previousHeight;
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last && last.sender && last.sender.id === peer.id) {
        markRead(last.id);
      }
    }
  }, [messages.length, messages, peer.id, markRead]);

  const onMessagesScroll = async () => {
    const el = scrollRef.current;
    if (!el || loading || loadingOlder || !hasMore) return;

    if (el.scrollTop > 4) {
      // Đã rời đỉnh — đánh dấu để lần sau chạm đỉnh thì mới load.
      hasLeftTopRef.current = true;
      return;
    }

    // Đang ở đỉnh, nhưng nếu user chưa từng rời đỉnh kể từ khi mount thì
    // vị trí này là "tự nhiên" (content ngắn / auto-scroll), bỏ qua.
    if (!hasLeftTopRef.current) return;

    // Reset cờ để debounce: nếu user cứ đứng yên ở đỉnh, chỉ load 1 lần.
    hasLeftTopRef.current = false;

    pendingOlderScrollHeightRef.current = el.scrollHeight;
    const loaded = await loadOlder();
    if (!loaded) {
      pendingOlderScrollHeightRef.current = null;
      // Load thất bại (hết trang / lỗi) thì giữ cờ = false để không lặp lại.
    }
  };

  useEffect(() => {
    if (!peerTyping) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [peerTyping]);

  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setUploadError(`Tin nhắn tối đa ${MAX_MESSAGE_LENGTH} ký tự`);
      return;
    }
    setSending(true);
    try {
      await send({ type: "text", content: trimmed });
      setText("");
    } finally {
      setSending(false);
    }
  };

  const onFile = async (file: File) => {
    setUploadError(null);
    setUploadState(null);
    const ext = getExt(file.name);
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File vượt quá 10MB");
      return;
    }
    if (ext && !ALLOWED_EXT.includes(ext)) {
      setUploadError(`Định dạng .${ext} không được hỗ trợ`);
      return;
    }
    const baseUploadState: UploadState = {
      name: file.name,
      size: file.size,
      ext,
      kind: getFileKind(file),
      progress: 0,
      status: "uploading",
    };
    setUploadState(baseUploadState);
    try {
      const res = await ChatAPI.uploadFile(conversationId, file, (pct) => {
        setUploadState((prev) =>
          prev ? { ...prev, progress: pct, status: "uploading" } : prev
        );
      });
      if (res.code === 200 && res.data) {
        const isImage = file.type.startsWith("image/");
        setUploadState((prev) =>
          prev ? { ...prev, progress: 100, status: "sending" } : prev
        );
        await send({
          type: isImage ? "image" : "file",
          attachmentId: res.data.attachmentId,
        });
        setUploadState(null);
      } else {
        const msg = res.msg || "Upload thất bại";
        setUploadError(msg);
        setUploadState((prev) =>
          prev ? { ...prev, status: "failed", error: msg } : prev
        );
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload thất bại";
      setUploadError(msg);
      setUploadState((prev) =>
        prev ? { ...prev, status: "failed", error: msg } : prev
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  /**
   * Paste ảnh (Snipping Tool, Print Screen, screenshot tool) hoặc file từ
   * Explorer/Finder vào textarea → upload như file đính kèm. Nếu clipboard
   * chỉ có text → để default (không preventDefault).
   *
   * Lưu ý:
   *  - Snipping Tool / screenshot utility thường set `file.name = ""`, chỉ
   *    có mime (vd `image/png`). Synthesize name có timestamp + ext từ mime
   *    để upload pipeline (extension check + server) nhận đúng file.
   *  - preventDefault chỉ khi thực sự handle file, tránh nuốt paste text.
   *  - v1: chỉ xử lý file đầu — đơn giản, đủ cho use case 1 ảnh.
   *  - Guard `isUploadingAttachment` để không queue upload thứ 2.
   */
  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (isUploadingAttachment) return;

    const files = e.clipboardData?.files;
    if (!files || files.length === 0) return; // text paste → default

    const file = files[0];
    if (!file) return;

    e.preventDefault(); // chặn textarea insert binary content

    let fileToUpload = file;
    if (!file.name) {
      const mimeExt = (file.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "");
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      fileToUpload = new File([file], `pasted-image-${ts}.${mimeExt || "png"}`, {
        type: file.type,
      });
    }
    void onFile(fileToUpload);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 relative bg-slate-50/50 dark:bg-slate-950/20">
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="sticky top-0 z-20 flex-shrink-0">
        {project && (
          <Link
            href={project.alias ? `/viec-lam/${project.alias}` : `/job/${project.id}`}
            className="flex items-center gap-2.5 px-4 md:px-6 py-2.5 bg-gradient-to-r from-primary/[0.10] via-primary/[0.04] to-transparent dark:from-primary/[0.18] dark:via-primary/[0.08] dark:to-transparent border-b border-primary/15 dark:border-primary/20 backdrop-blur-xl hover:from-primary/[0.16] hover:to-primary/[0.06] dark:hover:from-primary/[0.24] dark:hover:to-primary/[0.12] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30 text-primary flex-shrink-0 shadow-sm shadow-primary/10">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/80 dark:text-primary/70 flex-shrink-0">
                Dự án
              </span>
              <span className="h-3 w-px bg-primary/30 flex-shrink-0" />
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {project.name}
              </span>
              {project.statusTitle && (
                <span className="hidden sm:inline-flex items-center rounded-md border border-primary/25 bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary whitespace-nowrap shrink-0">
                  {project.statusTitle}
                </span>
              )}
            </div>
            <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-wider text-primary/80 dark:text-primary/70 flex-shrink-0">
              Xem dự án →
            </span>
          </Link>
        )}

        {service && (
          <Link
            href={`/dich-vu/${service.alias || service.id}`}
            className="flex items-center gap-2.5 px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-500/[0.10] via-blue-500/[0.04] to-transparent dark:from-blue-400/[0.18] dark:via-blue-400/[0.08] dark:to-transparent border-b border-blue-500/15 dark:border-blue-400/20 backdrop-blur-xl hover:from-blue-500/[0.16] hover:to-blue-500/[0.06] dark:hover:from-blue-400/[0.24] dark:hover:to-blue-400/[0.12] transition-colors"
          >
            {service.thumbnail ? (
              <div className="h-7 w-7 flex-shrink-0 rounded-lg overflow-hidden border border-white/40 dark:border-white/10 shadow-sm bg-slate-100 dark:bg-zinc-800">
                <img
                  src={service.thumbnail}
                  alt={service.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 dark:bg-blue-400/30 text-blue-600 dark:text-blue-400 flex-shrink-0 shadow-sm shadow-blue-500/10">
                <PackageIcon className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600/80 dark:text-blue-400/70 flex-shrink-0">
                Dịch vụ
              </span>
              <span className="h-3 w-px bg-blue-500/30 flex-shrink-0" />
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {service.name}
              </span>
              {service.price != null && Number.isFinite(service.price) && (
                <span className="hidden sm:inline-flex items-center gap-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider flex-shrink-0">
                  {Math.round(service.price).toLocaleString("vi-VN")} ₫
                  {service.priceUnit && (
                    <span className="text-[8px] font-bold opacity-80 normal-case">
                      /{formatPriceUnit(service.priceUnit)}
                    </span>
                  )}
                </span>
              )}
            </div>
            <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-wider text-blue-600/80 dark:text-blue-400/70 flex-shrink-0">
              Xem dịch vụ →
            </span>
          </Link>
        )}

        <div className="h-16 px-4 md:px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="md:hidden flex items-center justify-center p-1.5 -ml-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
                aria-label="Quay lại"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="relative flex-shrink-0">
              <Avatar src={peer.avatar ?? undefined} alt={peer.name} size="md" />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#09090b] ${
                  peerOnline ? "bg-green-500" : "bg-slate-300"
                }`}
              />
            </div>
            <div className="min-w-0">
              {profileUrl ? (
                <Link
                  href={profileUrl}
                  className="block font-black text-slate-800 dark:text-slate-100 leading-tight text-[15px] truncate hover:text-primary dark:hover:text-primary transition-colors"
                  aria-label={`Xem hồ sơ của ${peer.name}`}
                >
                  {peer.name}
                </Link>
              ) : (
                <h2 className="font-black text-slate-800 dark:text-slate-100 leading-tight text-[15px] truncate">
                  {peer.name}
                </h2>
              )}
              <span
                className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${
                  peerOnline ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    peerOnline ? "bg-green-500 animate-pulse" : "bg-slate-300"
                  }`}
                />
                {peerOnline
                  ? "Đang hoạt động"
                  : peerLastSeenLabel ?? "Ngoại tuyến"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Order badge (V2 §18.2) — hiển thị khi conversation có order */}
            {conversationOrder && conversationOrder.code && (
              <ChatOrderBadge order={conversationOrder} size="header" />
            )}
            {socketStatus !== "connected" && (
              <SocketStatusBadge
                status={socketStatus}
                lastError={socketError}
                onRetry={() => reconnectChat()}
              />
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onMessagesScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {loadingOlder && (
            <div className="flex justify-center py-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm dark:border-white/10 dark:bg-white/5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang tải tin cũ
              </span>
            </div>
          )}
          {loading && (
            <div className="space-y-4 py-2">
              <MessageBubbleSkeleton isMine={false} />
              <MessageBubbleSkeleton isMine={true} />
              <MessageBubbleSkeleton isMine={false} />
            </div>
          )}
          {error && (
            <div className="text-center text-xs text-rose-500 font-semibold py-2">
              {error}
            </div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-6">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.
            </div>
          )}
          {messages.map((m) =>
            m.sender ? (
              m.type === "offer" && service ? (
                <div
                  key={m.id}
                  className={`flex ${m.sender.id === myId ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[78%] w-full sm:w-[420px]">
                    <OfferMessage
                      msg={m}
                      serviceId={service.id}
                      conversationId={conversationId}
                      variant={m.sender.id === myId ? "seller" : "buyer"}
                      myId={myId}
                    />
                  </div>
                </div>
              ) : (
                <MessageBubble
                  key={m.id}
                  msg={m}
                  isMine={m.sender.id === myId}
                  isRead={
                    m.sender.id === myId &&
                    (readByPeer[peer.id] ?? 0) >= m.id
                  }
                />
              )
            ) : null
          )}
          {peerTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-end gap-1 shadow-sm">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
              </div>
            </div>
          )}
        </div>
      </div>

      {(uploadState || uploadError) && (
        <div className="px-4 pb-2">
          {uploadState ? (
            <div
              className={`max-w-3xl mx-auto rounded-2xl border px-3 py-3 shadow-sm backdrop-blur-md ${
                uploadState.status === "failed"
                  ? "border-rose-500/30 bg-rose-500/10"
                  : "border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                    uploadState.status === "failed"
                      ? "bg-rose-500/15 text-rose-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {uploadState.status === "failed" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <UploadIcon kind={uploadState.kind} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                      {uploadState.name}
                    </p>
                    <span
                      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider ${
                        uploadState.status === "failed"
                          ? "text-rose-500"
                          : "text-primary"
                      }`}
                    >
                      {uploadState.status === "sending"
                        ? "Đang gửi"
                        : uploadState.status === "failed"
                          ? "Lỗi"
                          : `${uploadState.progress}%`}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <span>{formatFileSize(uploadState.size)}</span>
                    {uploadState.ext && <span>.{uploadState.ext}</span>}
                    {uploadState.status === "failed" && uploadState.error && (
                      <span className="truncate text-rose-500">
                        {uploadState.error}
                      </span>
                    )}
                  </div>
                  {uploadState.status !== "failed" && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.max(uploadState.progress, 8)}%` }}
                      />
                    </div>
                  )}
                </div>

                {uploadState.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      setUploadState(null);
                    }}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10"
                    aria-label="Đóng lỗi upload"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1">{uploadError}</span>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="hover:opacity-70 cursor-pointer"
                aria-label="Đóng lỗi upload"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-0 p-4 bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 flex-shrink-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-2 md:gap-3">
          {/* "Gửi offer" — chỉ hiện khi conversation type=service VÀ user là owner */}
          {canSendOffer && (service?.isFreelancer) && (
            <button
              type="button"
              onClick={() => setOfferModalOpen(true)}
              className="flex items-center justify-center gap-1.5 h-11 px-3 md:px-4 rounded-2xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
              aria-label="Gửi offer"
              title="Gửi offer cho buyer"
            >
              <Handshake className="w-4 h-4" />
              <span className="hidden md:inline text-[13px] font-semibold">Gửi offer</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isUploadingAttachment}
            className="flex items-center justify-center w-11 h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            aria-label="Đính kèm file"
          >
            {isUploadingAttachment ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 flex items-center bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all backdrop-blur-md">
            <textarea
              rows={1}
              value={text}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => {
                setText(e.target.value);
                emitTyping();
              }}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              placeholder="Viết tin nhắn..."
              disabled={sending}
              className="w-full bg-transparent py-3 text-[14px] outline-none resize-none leading-relaxed max-h-32 text-slate-800 dark:text-slate-200 placeholder-slate-400/80"
            />
          </div>

          <button
            type="button"
            onClick={onSend}
            disabled={!text.trim() || sending}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all flex-shrink-0 shadow-md ${
              text.trim() && !sending
                ? "bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer hover:bg-primaryup"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
            }`}
            aria-label="Gửi"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Service offer modal — chỉ render khi conversation có service context */}
      {service && (
        <SendOfferModal
          open={offerModalOpen}
          onOpenChange={setOfferModalOpen}
          conversationId={conversationId}
          service={{
            id: service.id,
            title: service.name,
            thumbnail: service.thumbnail ?? null,
            price: service.price ?? 0,
            priceUnit: service.priceUnit ?? "fixed",
            deliveryDays: service.deliveryDays ?? null,
            revisionLimit: service.revisionLimit ?? null,
            reviewDuration: service.reviewDuration ?? null,
          }}
          onSent={() => {
            // Realtime event sẽ tự đẩy message vào list — không cần refetch.
            // Scroll xuống cuối cho user thấy offer vừa gửi.
            setTimeout(() => {
              scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
              });
            }, 100);
          }}
        />
      )}
    </div>
  );
}

function SocketStatusBadge({
  status,
  lastError,
  onRetry,
}: {
  status: "idle" | "connecting" | "connected" | "disconnected" | "error";
  lastError: string | null;
  onRetry: () => void;
}) {
  if (status === "connected") {
    return null;
  }
  if (status === "connecting") {
    return (
      <span
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg bg-amber-500/10"
        title="Connecting…"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Đang kết nối
      </span>
    );
  }
  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500 px-2 py-1 rounded-lg bg-rose-500/10 cursor-help"
          title={lastError ? `Lỗi: ${lastError}` : "Lỗi kết nối"}
        >
          <WifiOff className="w-3.5 h-3.5" />
          Lỗi socket
        </span>
        <button
          onClick={onRetry}
          className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 rounded-lg bg-slate-500/10"
        title="Mất kết nối realtime"
      >
        <WifiOff className="w-3.5 h-3.5" />
        Mất kết nối
      </span>
      <button
        onClick={onRetry}
        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-500/10 cursor-pointer"
      >
        Thử lại
      </button>
    </div>
  );
}
