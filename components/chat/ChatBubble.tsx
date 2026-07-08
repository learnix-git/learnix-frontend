"use client";

import { Check, CheckCheck, Download, FileText } from "lucide-react";
import Image from "next/image";
import type { ChatMessage } from "@/lib/chat/types";

function formatTime(iso: string) {
  try {
    const d = new Date(iso.replace(" ", "T"));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso.substring(11, 16);
  }
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageBubble({
  msg,
  isMine,
  isRead = false,
}: {
  msg: ChatMessage;
  isMine: boolean;
  /** True nếu peer đã đọc (msg.id <= peerLastReadId). Chỉ dùng cho tin của mình. */
  isRead?: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4.5 py-3 rounded-2xl text-[14.5px] shadow-sm transition-all relative ${
          isMine
            ? "bg-primary text-white rounded-tr-sm shadow-md shadow-primary/10"
            : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm"
        }`}
      >
        {msg.type === "text" && msg.content && (
          <p className="leading-relaxed whitespace-pre-line break-words">
            {msg.content}
          </p>
        )}

        {msg.type === "file" && !msg.attachment && msg.content && (
          <p className="leading-relaxed whitespace-pre-line break-words">
            {msg.content}
          </p>
        )}

        {msg.type === "image" && msg.attachment && (
          <a
            href={msg.attachment.url}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <Image
              src={msg.attachment.url}
              alt={msg.attachment.originalName}
              width={320}
              height={240}
              unoptimized
              className="rounded-xl max-w-full max-h-72 object-cover h-auto"
            />
          </a>
        )}

        {msg.type === "file" && msg.attachment && (
          <a
            href={msg.attachment.url}
            target="_blank"
            rel="noreferrer"
            className={`flex min-w-0 items-center gap-3 rounded-xl p-2.5 no-underline transition-colors ${
              isMine
                ? "bg-white/15 text-white hover:bg-white/20"
                : "bg-slate-50 text-slate-800 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            }`}
          >
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                isMine
                  ? "bg-white/20"
                  : "bg-primary/10 text-primary dark:bg-primary/15"
              }`}
            >
              <FileText className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block max-w-[220px] truncate text-[13px] font-bold leading-tight">
                {msg.attachment.originalName}
              </span>
              <span
                className={`mt-0.5 block text-[10px] font-semibold ${
                  isMine ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {formatFileSize(msg.attachment.sizeBytes) || "Tệp đính kèm"}
              </span>
            </span>
            <Download
              className={`h-4 w-4 flex-shrink-0 ${
                isMine ? "text-white/75" : "text-muted-foreground"
              }`}
            />
          </a>
        )}

        <div
          className={`flex items-center justify-end gap-1 mt-1.5 text-[9px] font-semibold uppercase tracking-wider ${
            isMine ? "opacity-80" : "opacity-60"
          }`}
        >
          <span>{formatTime(msg.createdAt)}</span>
          {isMine &&
            (isRead ? (
              // Đã đọc: 2 dấu tick, màu nổi (white solid trên bubble tím)
              <CheckCheck
                className="w-3.5 h-3.5 ml-0.5 text-white"
                aria-label="Đã đọc"
              />
            ) : (
              // Đã gửi (chưa đọc): 1 dấu tick mờ
              <Check
                className="w-3.5 h-3.5 ml-0.5 text-white/60"
                aria-label="Đã gửi"
              />
            ))}
        </div>
      </div>
    </div>
  );
}
