"use client";

import * as React from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Cn } from "@/lib/utils";

// ! Component Dialog gốc
function Dialog(props: DialogPrimitive.Root.Props) {
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      {...props}
    />
  );
}

// ! Component mở Dialog
function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
    />
  );
}

// ! Portal hiển thị Dialog
function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal
      data-slot="dialog-portal"
      keepMounted
      {...props}
    />
  );
}

// ! Backdrop phía sau Dialog
function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={Cn(
        "fixed inset-0 z-50 bg-black/55 backdrop-blur-md transition-opacity duration-300",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

// ! Khung nội dung Dialog
function DialogPopup({
  className,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Popup
      data-slot="dialog-popup"
      className={Cn(
        "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2",
        "overflow-hidden rounded-[28px] border border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.22)] outline-none",
        "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
        "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
        "data-[open]:transition-all data-[open]:duration-200",
        className
      )}
      {...props}
    />
  );
}

// ! Nút đóng Dialog
function DialogClose(props: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
    />
  );
}

// ! Tiêu đề Dialog
function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={Cn(
        "text-lg font-semibold text-foreground",
        className
      )}
      {...props}
    />
  );
}

// ! Mô tả Dialog
function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={Cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogClose,
  DialogTitle,
  DialogDescription,
};