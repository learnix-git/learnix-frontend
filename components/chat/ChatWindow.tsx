"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Paperclip,
  Send,
  WifiOff,
  X,
} from "lucide-react";
import { useChatRoom } from "@/hooks/chat/useChatRoom";
import { useChatPresence } from "@/hooks/chat/useChatPresence";
import { useChatStatus } from "@/hooks/chat/useChatStatus";
import { reconnectChat } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import { usePresenceStore } from "@/lib/stores/presence";
import { MessageBubble } from "./ChatBubble";
import { Avatar } from "@/components/ui/Avatar";
import type { ChatUser, ChatCourseRef } from "@/lib/chat/types";

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
  course = null,
}: {
  conversationId: string;
  peer: ChatUser;
  myId: string;
  onBack?: () => void;
  course?: ChatCourseRef | null;
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
  } = useChatRoom(conversationId, myId);
  
  const { status: socketStatus, lastError: socketError } = useChatStatus();

  const profileUrl = peer.role === "TEACHER" ? `/teachers/${peer.id}` : null;

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingOlderScrollHeightRef = useRef<number | null>(null);
  const hasLeftTopRef = useRef(false);

  useChatPresence([peer.id]);
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
      hasLeftTopRef.current = true;
      return;
    }

    if (!hasLeftTopRef.current) return;
    hasLeftTopRef.current = false;

    pendingOlderScrollHeightRef.current = el.scrollHeight;
    const loaded = await loadOlder();
    if (!loaded) {
      pendingOlderScrollHeightRef.current = null;
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
      const res = await ChatAPI.UploadFile(conversationId, file, (pct) => {
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
        const msg = res.message || "Upload thất bại";
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

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (isUploadingAttachment) return;

    const files = e.clipboardData?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    e.preventDefault();

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
        {course && (
          <Link
            href={`/classes/${course.slug || course.id}`}
            className="flex items-center gap-2.5 px-4 md:px-6 py-2.5 bg-gradient-to-r from-primary/[0.10] via-primary/[0.04] to-transparent dark:from-primary/[0.18] dark:via-primary/[0.08] dark:to-transparent border-b border-primary/15 dark:border-primary/20 backdrop-blur-xl hover:from-primary/[0.16] hover:to-primary/[0.06] dark:hover:from-primary/[0.24] dark:hover:to-primary/[0.12] transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30 text-primary flex-shrink-0 shadow-sm shadow-primary/10">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/80 dark:text-primary/70 flex-shrink-0">
                Lớp học
              </span>
              <span className="h-3 w-px bg-primary/30 flex-shrink-0" />
              {course.code && (
                <span className="text-xs font-bold text-primary/95 dark:text-primary/85 bg-primary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                  {course.code}
                </span>
              )}
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {course.name}
              </span>
            </div>
            <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-wider text-primary/80 dark:text-primary/70 flex-shrink-0">
              Xem lớp học →
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
              <MessageBubble
                key={m.id}
                msg={m}
                isMine={m.sender.id === myId}
                isRead={
                  m.sender.id === myId &&
                  (readByPeer[peer.id] ?? "") === m.id
                }
              />
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
                ? "bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
            }`}
            aria-label="Gửi"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
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