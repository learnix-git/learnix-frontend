"use client"

import * as React from "react"
import { Drawer } from "@base-ui/react/drawer"
import { Cn } from "@/lib/utils"

// ! Context lưu hướng hiển thị của Sheet (left hoặc right).
const SheetContext = React.createContext<{ side?: "left" | "right" }>({
  side: "right",
})

// ! Component gốc của Sheet.
function SheetRoot({
  children,
  side = "right",
  ...props
}: Drawer.Root.Props & { side?: "left" | "right" }) {
  return (
    <SheetContext.Provider value={{ side }}>
      <Drawer.Root
        data-slot="sheet"
        swipeDirection={side}
        {...props}
      >
        {children}
      </Drawer.Root>
    </SheetContext.Provider>
  )
}

// ! Trigger dùng để mở Sheet.
function SheetTrigger(props: Drawer.Trigger.Props) {
  return <Drawer.Trigger data-slot="sheet-trigger" {...props} />
}

// ! Portal render Sheet ra ngoài DOM.
function SheetPortal(props: Drawer.Portal.Props) {
  return <Drawer.Portal data-slot="sheet-portal" keepMounted {...props} />
}

// ! Lớp nền phía sau Sheet.
function SheetBackdrop({ className, ...props }: Drawer.Backdrop.Props) {
  return (
    <Drawer.Backdrop
      data-slot="sheet-backdrop"
      className={Cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

// ! Viewport chứa toàn bộ Sheet.
function SheetViewport({ className, ...props }: Drawer.Viewport.Props) {
  return (
    <Drawer.Viewport
      data-slot="sheet-viewport"
      className={Cn("fixed inset-0 z-50", className)}
      {...props}
    />
  )
}

// ! Nội dung chính của Sheet.
function SheetPopup({ className, ...props }: Drawer.Popup.Props) {
  const { side } = React.useContext(SheetContext)

  return (
    <Drawer.Popup
      data-slot="sheet-popup"
      className={Cn(
        "fixed inset-y-0 z-50 h-full w-[300px] border-border bg-card p-0 shadow-xl transition-transform duration-300 ease-in-out",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        side === "right"
          ? "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full data-[open]:translate-x-0"
          : "data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full data-[open]:translate-x-0",
        className
      )}
      {...props}
    />
  )
}

// ! Đóng Sheet.
function SheetClose(props: Drawer.Close.Props) {
  return <Drawer.Close data-slot="sheet-close" {...props} />
}

// ! Tiêu đề của Sheet.
function SheetTitle({ className, ...props }: Drawer.Title.Props) {
  return (
    <Drawer.Title
      data-slot="sheet-title"
      className={Cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

// ! Mô tả của Sheet.
function SheetDescription({ className, ...props }: Drawer.Description.Props) {
  return (
    <Drawer.Description
      data-slot="sheet-description"
      className={Cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// ! Export theo dạng Sheet.Trigger, Sheet.Popup,...
export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Portal: SheetPortal,
  Backdrop: SheetBackdrop,
  Viewport: SheetViewport,
  Popup: SheetPopup,
  Close: SheetClose,
  Title: SheetTitle,
  Description: SheetDescription,
})