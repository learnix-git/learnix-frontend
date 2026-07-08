"use client";

import React, { useState } from "react";

import { AlertTriangle, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogBackdrop,
  DialogDescription,
} from "@/components/ui/Dialog";

import { Cn } from "@/lib/utils";

// ! Kiểu hiển thị Dialog
export type ConfirmVariant = "default" | "destructive";

// ! Props của Confirm
export interface ConfirmProps {
  // ! Trạng thái mở Dialog
  open: boolean;

  // ! Thay đổi trạng thái Dialog
  onOpenChange: (open: boolean) => void;

  // ! Tiêu đề
  title: string;

  // ! Nội dung mô tả
  description?: React.ReactNode;

  // ! Nội dung nút xác nhận
  confirmText?: string;

  // ! Nội dung nút huỷ
  cancelText?: string;

  // ! Loại Dialog
  variant?: ConfirmVariant;

  // ! Hàm xử lý khi xác nhận
  onConfirm: () => void | Promise<void>;

  // ! Chuỗi bắt buộc nhập để xác nhận
  requireTextMatch?: string;

  // ! Icon tùy chỉnh
  icon?: React.ReactNode;
}

// ! Component Confirm xác nhận dùng chung
export function Confirm({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Huỷ",
  variant = "default",
  onConfirm,
  requireTextMatch,
  icon,
}: ConfirmProps) {
  // ! State loading
  const [confirming, setConfirming] = useState(false);

  // ! Nội dung người dùng nhập
  const [typedText, setTypedText] = useState("");

  // ! Có yêu cầu nhập text hay không
  const needsTextMatch = !!requireTextMatch;

  // ! Kiểm tra text hợp lệ
  const textMatched =
    !needsTextMatch || typedText === requireTextMatch;

  // ! Cho phép xác nhận
  const canConfirm = textMatched && !confirming;

  // ! Xử lý xác nhận
  const handleConfirm = async () => {
    if (!canConfirm) return;

    setConfirming(true);

    try {
      await onConfirm();
    } finally {
      setConfirming(false);
      setTypedText("");
    }
  };

  // ! Đóng / mở Dialog
  const handleOpenChange = (next: boolean) => {
    if (confirming) return;

    if (!next) {
      setTypedText("");
    }

    onOpenChange(next);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogPortal>
        <DialogBackdrop />

        <DialogPopup className="max-w-md">
          <div className="space-y-5 p-6 md:p-7">

            {/* Header */}
            <div className="flex items-start gap-4">
              <div
                className={Cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner",
                  variant === "destructive"
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                    : "border-primary/20 bg-primary/10 text-primary"
                )}
              >
                {icon ?? (
                  <AlertTriangle
                    className="h-6 w-6"
                    strokeWidth={2}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <DialogTitle className="text-lg font-extrabold tracking-tight text-foreground dark:text-white">
                  {title}
                </DialogTitle>

                {description && (
                  <DialogDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground dark:text-zinc-400">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>

            {/* Ô nhập xác nhận */}
            {needsTextMatch && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground dark:text-zinc-400">
                  Gõ{" "}
                  <span className="font-mono font-bold text-rose-500">
                    {requireTextMatch}
                  </span>{" "}
                  để xác nhận:
                </label>

                <input
                  type="text"
                  autoComplete="off"
                  value={typedText}
                  placeholder={requireTextMatch}
                  onChange={(e) => setTypedText(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-white/40 bg-white/50 px-4 text-sm font-medium backdrop-blur-md transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-white/10 dark:bg-white/5"
                />
              </div>
            )}

            {/* Nhóm nút */}
            <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-2 sm:flex-row sm:items-center">
              <DialogClose className="flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-white/40 bg-white/60 px-5 text-xs font-bold tracking-widest text-foreground backdrop-blur-md transition-all hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                {cancelText}
              </DialogClose>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={Cn(
                  "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 text-xs font-bold tracking-widest text-white shadow-lg transition-all",
                  variant === "destructive"
                    ? "bg-rose-500 shadow-rose-500/30 hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-500/40"
                    : "bg-primary shadow-primary/30 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40",
                  confirming && "opacity-80"
                )}
              >
                {confirming && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {confirming
                  ? "Đang xử lý..."
                  : confirmText}
              </button>
            </div>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}