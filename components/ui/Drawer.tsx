"use client";

import * as React from "react";

import { Drawer as DrawerPrimitive } from "vaul";

import { Cn } from "@/lib/utils";

// ! Component Drawer gốc
function Drawer(
  props: React.ComponentProps<typeof DrawerPrimitive.Root>
) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      {...props}
    />
  );
}

// ! Nút mở Drawer
function DrawerTrigger(
  props: React.ComponentProps<typeof DrawerPrimitive.Trigger>
) {
  return (
    <DrawerPrimitive.Trigger
      data-slot="drawer-trigger"
      {...props}
    />
  );
}

// ! Portal hiển thị Drawer
function DrawerPortal(
  props: React.ComponentProps<typeof DrawerPrimitive.Portal>
) {
  return (
    <DrawerPrimitive.Portal
      data-slot="drawer-portal"
      {...props}
    />
  );
}

// ! Nút đóng Drawer
function DrawerClose(
  props: React.ComponentProps<typeof DrawerPrimitive.Close>
) {
  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      {...props}
    />
  );
}

// ! Lớp nền phía sau Drawer
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={Cn(
        "fixed inset-0 z-50 bg-black/55 backdrop-blur-md transition-opacity duration-300",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

// ! Nội dung Drawer
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />

      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={Cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col bg-white/40 dark:bg-black/40 text-sm text-foreground backdrop-blur-xl",

          // ! Bottom
          "data-[vaul-drawer-direction=bottom]:inset-x-0",
          "data-[vaul-drawer-direction=bottom]:bottom-0",
          "data-[vaul-drawer-direction=bottom]:mt-24",
          "data-[vaul-drawer-direction=bottom]:max-h-[80vh]",
          "data-[vaul-drawer-direction=bottom]:rounded-t-[28px]",
          "data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=bottom]:border-white/40",
          "dark:data-[vaul-drawer-direction=bottom]:border-white/10",

          // ! Left
          "data-[vaul-drawer-direction=left]:inset-y-0",
          "data-[vaul-drawer-direction=left]:left-0",
          "data-[vaul-drawer-direction=left]:w-3/4",
          "data-[vaul-drawer-direction=left]:rounded-r-[28px]",
          "data-[vaul-drawer-direction=left]:border-r",
          "data-[vaul-drawer-direction=left]:border-white/40",
          "dark:data-[vaul-drawer-direction=left]:border-white/10",

          // ! Right
          "data-[vaul-drawer-direction=right]:inset-y-0",
          "data-[vaul-drawer-direction=right]:right-0",
          "data-[vaul-drawer-direction=right]:w-3/4",
          "data-[vaul-drawer-direction=right]:rounded-l-[28px]",
          "data-[vaul-drawer-direction=right]:border-l",
          "data-[vaul-drawer-direction=right]:border-white/40",
          "dark:data-[vaul-drawer-direction=right]:border-white/10",

          // ! Top
          "data-[vaul-drawer-direction=top]:inset-x-0",
          "data-[vaul-drawer-direction=top]:top-0",
          "data-[vaul-drawer-direction=top]:mb-24",
          "data-[vaul-drawer-direction=top]:max-h-[80vh]",
          "data-[vaul-drawer-direction=top]:rounded-b-[28px]",
          "data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=top]:border-white/40",
          "dark:data-[vaul-drawer-direction=top]:border-white/10",

          // ! Desktop width
          "data-[vaul-drawer-direction=left]:sm:max-w-sm",
          "data-[vaul-drawer-direction=right]:sm:max-w-sm",

          className
        )}
        {...props}
      >
        {/* Thanh kéo */}
        <div className="mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />

        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

// ! Header của Drawer
function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={Cn(
        "flex flex-col gap-0.5 p-4",
        "group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center",
        "group-data-[vaul-drawer-direction=top]/drawer-content:text-center",
        "md:gap-0.5 md:text-left",
        className
      )}
      {...props}
    />
  );
}

// ! Footer của Drawer
function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={Cn(
        "mt-auto flex flex-col gap-2 p-4",
        className
      )}
      {...props}
    />
  );
}

// ! Tiêu đề Drawer
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={Cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  );
}

// ! Mô tả Drawer
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={Cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};