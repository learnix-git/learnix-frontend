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
import { ReconnectChat } from "@/lib/chat/socket";
import { ChatAPI } from "@/lib/api/chat";
import { usePresenceStore } from "@/lib/stores/chat";
import { 
  ChatBubble, 
  ChatBubbleSkeleton 
} from "./ChatBubble";
import { Avatar } from "@/components/ui/Avatar";
import type { 
  ChatUser, 
  ChatCourseRef 
} from "@/lib/chat/types";

// Dung lượng tối đa
const MAX_SIZE = 10 * 1024 * 1024;

// Độ dài tối đa
const MAX_LENGTH = 5000;

// Định dạng cho phép
const EXTENSION = [
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

// Kiểu dữ liệu của tệp đính kèm
type Attachment = {
  name: string;
  size: number;
  ext: string;
  kind: "image" | "document" | "spreadsheet" | "archive" | "file";
  progress: number;
  socketStatus: "uploading" | "sending" | "failed";
  error?: string;
};

// Hàm lấy đuôi mở rộng của tệp đính kèm
function GetExtension(name: string) {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.substring(idx + 1).toLowerCase() : "";
}

// Hàm định dạng đuôi mở rộng của tệp đính kèm
function FormatFileExtension(file: File): Attachment["kind"] {
  const ext = GetExtension(file.name);
  // Nếu là file ảnh trả về image
  if (file.type.startsWith("image/")) 
    return "image";
  // Nếu là file excel trả về spreadsheet
  if (["xls", "xlsx"].includes(ext)) 
    return "spreadsheet";
  // Nếu là file zip trả về archive
  if (ext === "zip") 
    return "archive";
  // Nếu là file văn bản trả về document
  if (["pdf", "doc", "docx", "txt"].includes(ext)) 
    return "document";
  // Còn lại trả về file
  return "file";
}

// Hàm định dạng dung lượng của tệp đính kèm
function FormatFileSize(bytes: number) {
  // Nếu kích thước không hợp lệ trả về 0 KB
  if (!Number.isFinite(bytes) || bytes <= 0) 
    return "0 KB";
  // Nếu nhỏ hơn 1 MB hiển thị KB
  if (bytes < 1024 * 1024) 
    return `${Math.ceil(bytes / 1024)} KB`;
  // Nếu lớn hơn 1 MB hiển thị MB
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Hàm định dạng icon của tệp đính kèm
function FormatFileIcon({ kind }: { kind: Attachment["kind"] }) {
  const className = "h-5 w-5";
  if (kind === "image") 
    return <FileImage className={className} />;
  if (kind === "spreadsheet") 
    return <FileSpreadsheet className={className} />;
  if (kind === "archive") 
    return <FileArchive className={className} />;
  return <FileText className={className} />;
}

// Hàm định dạng thời gian hoạt động
function FormatTime(iso: string | null): string | null {
  // Nếu thời gian không tồn tại thì không hiển thị
  if (!iso) return null;

  try {
    const date = new Date(iso.replace(" ", "T"));
    const diffMs = Date.now() - date.getTime();

    // Nếu thời gian không hợp lệ thì không hiển thị
    if (Number.isNaN(diffMs) || diffMs < 0)
      return null;

    const minutes = Math.floor(diffMs / 60_000);

    // Nếu dưới 1 phút hiển thị vừa mới truy cập
    if (minutes < 1)
      return "Vừa mới truy cập";

    // Nếu dưới 1 giờ hiển thị theo phút
    if (minutes < 60)
      return `Hoạt động ${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);

    // Nếu dưới 1 ngày hiển thị theo giờ
    if (hours < 24)
      return `Hoạt động ${hours} giờ trước`;

    const days = Math.floor(hours / 24);

    // Nếu dưới 7 ngày hiển thị theo ngày
    if (days < 7)
      return `Hoạt động ${days} ngày trước`;

    // Nếu quá 7 ngày thì không hiển thị
    return null;
  } catch {
    // Nếu xảy ra lỗi thì không hiển thị
    return null;
  }
}

export function ChatWindow({
  conversationId,
  peer,
  userId,
  onBack,
  course = null,
}: {
  conversationId: string;
  peer: ChatUser;
  userId: string;
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
  } = useChatRoom(conversationId, userId);
  
  const { socketStatus, socketError } = useChatStatus();

  const profileUrl = peer.role === "TEACHER" ? `/teachers/${peer.id}` : null;

  // Trạng thái nhập tin nhắn
  const [text, setText] = useState("");
  
  // Trạng thái gửi tin nhắn
  const [sending, setSending] = useState(false);
  
  // Trạng thái lỗi tải lên
  const [failure, setFailure] = useState<string | null>(null);
  
  // Trạng thái tệp tải lên
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  
  // Tham chiếu đến các phần tử và trạng thái cuộn
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const highRef = useRef<number | null>(null);
  const hasLeftTopRef = useRef(false);

  // Theo dõi trạng thái hoạt động của đối phương
  useChatPresence([peer.id]);
  const peerOnline = usePresenceStore((s) => s.online.has(peer.id));
  const peerLastSeenAt = usePresenceStore((s) => s.lastSeen[peer.id] ?? null);
  const peerLastSeenLabel = FormatTime(peerLastSeenAt);

  // Trạng thái tải lên tệp đính kèm
  const isUploading = attachment?.socketStatus === "uploading" || attachment?.socketStatus === "sending";

  // Theo dõi cuộn trang và đọc tin nhắn
  useEffect(() => {
    // Nếu vừa tải thêm tin nhắn cũ thì giữ nguyên vị trí cuộn
    if (scrollRef.current && highRef.current !== null) {
      const previousHeight = highRef.current;
      highRef.current = null;
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight - previousHeight;
    }
    // Nếu không thì cuộn xuống cuối đoạn chat
    else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Nếu tin nhắn cuối cùng là của đối phương thì đánh dấu đã đọc
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last && last.sender && last.sender.id === peer.id) {
        markRead(last.id);
      }
    }
  }, [messages.length, messages, peer.id, markRead]);

  // Hàm tải thêm tin nhắn cũ khi cuộn lên đầu
  const onScroll = async () => {
    const el = scrollRef.current;

    // Nếu không thể tải thêm thì dừng
    if (!el || loading || loadingOlder || !hasMore) return;

    // Nếu chưa cuộn đến đầu thì đánh dấu đã rời khỏi đầu
    if (el.scrollTop > 4) {
      hasLeftTopRef.current = true;
      return;
    }

    // Nếu chưa từng rời khỏi đầu thì không tải thêm
    if (!hasLeftTopRef.current) return;
    hasLeftTopRef.current = false;

    // Lưu chiều cao hiện tại trước khi tải thêm
    highRef.current = el.scrollHeight;

    // Tải thêm tin nhắn cũ
    const loaded = await loadOlder();

    // Nếu không còn dữ liệu thì xóa chiều cao đã lưu
    if (!loaded) {
      highRef.current = null;
    }
  };

  // Theo dõi trạng thái đang gõ
  useEffect(() => {
    // Nếu đối phương không nhập tin nhắn thì không xử lý
    if (!peerTyping) return;

    // Cuộn xuống cuối đoạn chat
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [peerTyping]);

  // Hàm gửi tin nhắn văn bản
  const onSend = async () => {
    const trimmed = text.trim();

    // Nếu tin nhắn rỗng hoặc đang gửi thì không xử lý
    if (!trimmed || sending) return;

    // Nếu vượt quá số ký tự cho phép thì báo lỗi
    if (trimmed.length > MAX_LENGTH) {
      setFailure(`Tin nhắn tối đa ${MAX_LENGTH} ký tự`);
      return;
    }

    // Bắt đầu gửi tin nhắn
    setSending(true);

    try {
      await send({ type: "text", content: trimmed });

      // Xóa nội dung sau khi gửi thành công
      setText("");
    } finally {
      // Kết thúc trạng thái gửi
      setSending(false);
    }
  };

  // Hàm tải lên và gửi tệp đính kèm
  const onFile = async (file: File) => {
    // Xóa trạng thái lỗi và tệp trước đó
    setFailure(null);
    setAttachment(null);

    const ext = GetExtension(file.name);

    // Nếu tệp vượt quá dung lượng cho phép thì báo lỗi
    if (file.size > MAX_SIZE) {
      setFailure("File vượt quá 10MB");
      return;
    }

    // Nếu định dạng không được hỗ trợ thì báo lỗi
    if (ext && !EXTENSION.includes(ext)) {
      setFailure(`Định dạng .${ext} không được hỗ trợ`);
      return;
    }

    // Khởi tạo thông tin tệp đang tải lên
    const baseAttachment: Attachment = {
      name: file.name,
      size: file.size,
      ext,
      kind: FormatFileExtension(file),
      progress: 0,
      socketStatus: "uploading",
    };

    setAttachment(baseAttachment);

    try {
      // Tải tệp lên máy chủ
      const res = await ChatAPI.UploadFile(conversationId, file, (pct) => {
        setAttachment((prev) =>
          prev ? { ...prev, progress: pct, socketStatus: "uploading" } : prev
        );
      });

      // Nếu tải lên thành công thì gửi tin nhắn chứa tệp
      if (res.code === 200 && res.data) {
        const isImage = file.type.startsWith("image/");

        setAttachment((prev) =>
          prev ? { ...prev, progress: 100, socketStatus: "sending" } : prev
        );

        await send({
          type: isImage ? "image" : "file",
          attachmentId: res.data.attachmentId,
        });

        // Xóa trạng thái tệp sau khi gửi thành công
        setAttachment(null);
      } else {
        // Nếu tải lên thất bại thì cập nhật lỗi
        const msg = res.message || "Upload thất bại";
        setFailure(msg);

        setAttachment((prev) =>
          prev ? { ...prev, socketStatus: "failed", error: msg } : prev
        );
      }
    } catch (e) {
      // Nếu xảy ra lỗi thì cập nhật trạng thái thất bại
      const msg = e instanceof Error ? e.message : "Upload thất bại";

      setFailure(msg);

      setAttachment((prev) =>
        prev ? { ...prev, socketStatus: "failed", error: msg } : prev
      );
    } finally {
      // Xóa giá trị của ô chọn tệp
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Hàm gửi tin nhắn khi nhấn Enter
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Nếu nhấn Enter thì gửi tin nhắn
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Hàm xử lý dán tệp từ clipboard
  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Nếu đang tải tệp lên thì không xử lý
    if (isUploading) return;

    const files = e.clipboardData?.files;

    // Nếu clipboard không có tệp thì bỏ qua
    if (!files || files.length === 0) return;

    const file = files[0];

    // Nếu không có tệp đầu tiên thì dừng
    if (!file) return;

    // Ngăn hành vi dán mặc định
    e.preventDefault();

    let fileToUpload = file;

    // Nếu tệp không có tên thì tạo tên mới
    if (!file.name) {
      const mimeExt = (file.type.split("/")[1] || "png").replace(/[^a-z0-9]/gi, "");
      const ts = new Date().toISOString().replace(/[:.]/g, "-");

      fileToUpload = new File([file], `pasted-image-${ts}.${mimeExt || "png"}`, {
        type: file.type,
      });
    }

    // Tải lên tệp vừa dán
    void onFile(fileToUpload);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 relative bg-slate-50/50 dark:bg-slate-950/20">
      {/* Hiệu ứng nền */}
      <div className="absolute top-12 right-12 h-80 w-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />
      <div className="absolute bottom-12 left-12 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-20 flex-shrink-0">

        {/* Thông tin lớp học */}
        {course && (
          <Link
            href={`/classes/${course.slug || course.id}`}
            className="flex items-center gap-2.5 px-4 md:px-6 py-2.5 bg-gradient-to-r from-primary/[0.10] via-primary/[0.04] to-transparent dark:from-primary/[0.18] dark:via-primary/[0.08] dark:to-transparent border-b border-primary/15 dark:border-primary/20 backdrop-blur-xl hover:from-primary/[0.16] hover:to-primary/[0.06] dark:hover:from-primary/[0.24] dark:hover:to-primary/[0.12] transition-colors"
          >
            {/* Biểu tượng lớp học */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 dark:bg-primary/30 text-primary flex-shrink-0 shadow-sm shadow-primary/10">
              <BookOpen className="w-3.5 h-3.5" />
            </div>

            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/80 dark:text-primary/70 flex-shrink-0">
                Lớp học
              </span>

              <span className="h-3 w-px bg-primary/30 flex-shrink-0" />

              {/* Mã lớp học */}
              {course.code && (
                <span className="text-xs font-bold text-primary/95 dark:text-primary/85 bg-primary/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                  {course.code}
                </span>
              )}

              {/* Tên lớp học */}
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
                {course.name}
              </span>
            </div>

            {/* Nút xem lớp học */}
            <span className="hidden md:inline-flex text-[10px] font-black uppercase tracking-wider text-primary/80 dark:text-primary/70 flex-shrink-0">
              Xem lớp học →
            </span>
          </Link>
        )}

        {/* Thông tin cuộc trò chuyện */}
        <div className="h-16 px-4 md:px-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/60 dark:bg-zinc-950/40 backdrop-blur-xl">

          {/* Thông tin đối phương */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0">

            {/* Nút quay lại */}
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
              {/* Ảnh đại diện */}
              <Avatar src={peer.avatar ?? undefined} alt={peer.name || ""} size="md" />
            </div>

            <div className="min-w-0">
              {/* Xem hồ sơ */}
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

                {/* Trạng thái */}
                {peerOnline
                  ? "Đang hoạt động"
                  : peerLastSeenLabel ?? "Ngoại tuyến"}
              </span>
            </div>
          </div>

          {/* Trạng thái kết nối socket */}
          <div className="flex items-center gap-3">
            {socketStatus !== "connected" && (
              <SocketBadge
                socketStatus={socketStatus}
                socketError={socketError}
                onRetry={() => ReconnectChat()}
              />
            )}
          </div>
        </div>
      </div>

      {/* Danh sách tin nhắn */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-3">

          {/* Trạng thái tải thêm tin nhắn cũ */}
          {loadingOlder && (
            <div className="flex justify-center py-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm dark:border-white/10 dark:bg-white/5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang tải tin cũ
              </span>
            </div>
          )}

          {/* Hiển thị khung xương khi đang tải */}
          {loading && (
            <div className="space-y-4 py-2">
              <ChatBubbleSkeleton isMine={false} />
              <ChatBubbleSkeleton isMine={true} />
              <ChatBubbleSkeleton isMine={false} />
            </div>
          )}

          {/* Hiển thị thông báo lỗi */}
          {error && (
            <div className="text-center text-xs text-rose-500 font-semibold py-2">
              {error}
            </div>
          )}

          {/* Hiển thị khi chưa có tin nhắn */}
          {!loading && messages.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-6">
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.
            </div>
          )}

          {/* Danh sách tin nhắn */}
          {messages.map((m) =>
            m.sender ? (
              <ChatBubble
                key={m.id}
                msg={m}
                isMine={m.sender.id === userId}
                isRead={
                  m.sender.id === userId &&
                  (readByPeer[peer.id] ?? "") === m.id
                }
              />
            ) : null
          )}

          {/* Trạng thái đối phương đang nhập */}
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

      {/* Tệp đính kèm */}
      {(attachment || failure) && (
        <div className="px-4 pb-2">
          {attachment ? (
            <div
              className={`max-w-3xl mx-auto rounded-2xl border px-3 py-3 shadow-sm backdrop-blur-md ${
                attachment.socketStatus === "failed"
                  ? "border-rose-500/30 bg-rose-500/10"
                  : "border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">

                {/* Biểu tượng trạng thái tệp */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                    attachment.socketStatus === "failed"
                      ? "bg-rose-500/15 text-rose-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {attachment.socketStatus === "failed" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <FormatFileIcon kind={attachment.kind} />
                  )}
                </div>

                {/* Thông tin và tiến trình tải lên */}
                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-3">
                    {/* Tên tệp */}
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                      {attachment.name}
                    </p>

                    <span
                      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider ${
                        attachment.socketStatus === "failed"
                          ? "text-rose-500"
                          : "text-primary"
                      }`}
                    >
                      {/* Trạng thái */}
                      {attachment.socketStatus === "sending"
                        ? "Đang gửi"
                        : attachment.socketStatus === "failed"
                          ? "Lỗi"
                          : `${attachment.progress}%`}
                    </span>
                  </div>

                  {/* Dung lượng, định dạng và thông báo lỗi */}
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <span>{FormatFileSize(attachment.size)}</span>

                    {attachment.ext && <span>.{attachment.ext}</span>}

                    {attachment.socketStatus === "failed" && attachment.error && (
                      <span className="truncate text-rose-500">
                        {attachment.error}
                      </span>
                    )}
                  </div>

                  {/* Thanh tiến trình tải lên */}
                  {attachment.socketStatus !== "failed" && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.max(attachment.progress, 8)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Nút đóng khi tải lên thất bại */}
                {attachment.socketStatus === "failed" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFailure(null);
                      setAttachment(null);
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
            /* Thông báo lỗi tải tệp */
            <div className="max-w-3xl mx-auto px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />

              <span className="flex-1">{failure}</span>

              {/* Nút đóng thông báo lỗi */}
              <button
                type="button"
                onClick={() => setFailure(null)}
                className="hover:opacity-70 cursor-pointer"
                aria-label="Đóng lỗi upload"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
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
            disabled={isUploading}
            className="flex items-center justify-center w-11 h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
            aria-label="Đính kèm file"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Paperclip className="w-5 h-5" />
            )}
          </button>

          {/* Ô nhập */}
          <div className="flex-1 flex items-center bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all backdrop-blur-md">
            <textarea
              rows={1}
              value={text}
              maxLength={MAX_LENGTH}
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

          {/* Nút gửi */}
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

// Hàm hiển thị trạng thái kết nối Socket
function SocketBadge({
  socketStatus,
  socketError,
  onRetry,
}: {
  socketStatus: "idle" | "connecting" | "connected" | "disconnected" | "error";
  socketError: string | null;
  onRetry: () => void;
}) {
  // Nếu đã kết nối thì không hiển thị
  if (socketStatus === "connected") {
    return null;
  }

  // Nếu đang kết nối thì hiển thị trạng thái kết nối
  if (socketStatus === "connecting") {
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

  // Nếu xảy ra lỗi thì hiển thị lỗi và nút thử lại
  if (socketStatus === "error") {
    return (
      <div className="flex items-center gap-1.5">

        {/* Thông báo lỗi kết nối */}
        <span
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-500 px-2 py-1 rounded-lg bg-rose-500/10 cursor-help"
          title={socketError ? `Lỗi: ${socketError}` : "Lỗi kết nối"}
        >
          <WifiOff className="w-3.5 h-3.5" />
          Lỗi socket
        </span>

        {/* Nút kết nối lại */}
        <button
          onClick={onRetry}
          className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Nếu mất kết nối thì hiển thị thông báo và nút thử lại
  return (
    <div className="flex items-center gap-1.5">

      {/* Thông báo mất kết nối */}
      <span
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 rounded-lg bg-slate-500/10"
        title="Mất kết nối realtime"
      >
        <WifiOff className="w-3.5 h-3.5" />
        Mất kết nối
      </span>

      {/* Nút kết nối lại */}
      <button
        onClick={onRetry}
        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-500/10 cursor-pointer"
      >
        Thử lại
      </button>
    </div>
  );
}