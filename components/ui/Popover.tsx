"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { Cn } from "@/lib/utils"

// ! Root wrapper của Base UI Popover.
function Popover(props: PopoverPrimitive.Root.Props) {
  return (
    <PopoverPrimitive.Root
      data-slot="popover"
      {...props}
    />
  )
}

// ! Trigger dùng để mở / đóng Popover.
function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      {...props}
    />
  )
}

// ! Popup content đã tích hợp Positioner + Portal và style mặc định.
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Popup>,
  PopoverPrimitive.Popup.Props &
    Pick<
      PopoverPrimitive.Positioner.Props,
      "align" | "side" | "sideOffset" | "alignOffset"
    >
>(
  (
    {
      className,
      align = "center",
      side = "bottom",
      sideOffset = 4,
      alignOffset = 0,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          ref={ref}
          className={Cn(
            "z-50 w-auto overflow-hidden rounded-[28px]",
            "border border-white/40 dark:border-white/10",
            "bg-white/40 dark:bg-black/40 backdrop-blur-xl",
            "shadow-[0_24px_80px_rgba(15,23,42,0.22)]",
            "text-sm text-foreground outline-none",
            "data-[starting-style]:opacity-0",
            "data-[ending-style]:opacity-0",
            "data-[open]:transition-all",
            "data-[open]:duration-200",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
)

PopoverContent.displayName = "PopoverContent"

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
}