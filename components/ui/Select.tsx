"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

import { Cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

// ! Nhóm các item trong Select.
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={Cn("scroll-my-1 p-1", className)}
      {...props}
    />
  );
}

// ! Hiển thị giá trị đang được chọn.
function SelectValue({
  className,
  children,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={Cn("flex flex-1 text-left line-clamp-1", className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  );
}

// ! Trigger dùng để mở hoặc đóng Select.
function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={Cn(
        "flex h-12 w-full items-center justify-between gap-2 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 px-4 py-2 text-[14px] font-medium transition-all outline-none select-none backdrop-blur-xl shadow-xs shadow-slate-200/50 dark:shadow-none",
        "hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[placeholder]:text-muted-foreground aria-expanded:border-primary aria-expanded:ring-2 aria-expanded:ring-primary/20",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground opacity-60 transition-transform duration-200 group-aria-expanded:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

// ! Popup chứa danh sách các lựa chọn.
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-50"
        style={{ width: "var(--anchor-width)" }}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={Cn(
            "w-full max-h-[var(--available-height)] overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 text-foreground shadow-2xl shadow-primary/5 outline-none",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          style={{
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
          {...props}
        >
          <SelectScrollUpButton />

          {/* Danh sách các lựa chọn. */}
          <SelectPrimitive.List className="p-1 outline-none">
            {children}
          </SelectPrimitive.List>

          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

// ! Tiêu đề của một nhóm item.
function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={Cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

// ! Một lựa chọn trong Select.
function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={Cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-xl py-3 pl-10 pr-4 text-[14px] font-bold outline-none transition-all mb-0.5 last:mb-0 border border-transparent",
        "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[selected]:bg-primary/10 dark:data-[selected]:bg-primary/20 data-[selected]:text-primary data-[selected]:border-primary/20 dark:data-[selected]:border-primary/30",
        className
      )}
      {...props}
    >
      {/* Icon hiển thị khi item được chọn. */}
      <SelectPrimitive.ItemIndicator className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
        <IconCheck className="size-4" strokeWidth={3} />
      </SelectPrimitive.ItemIndicator>

      <SelectPrimitive.ItemText className="flex-1 truncate">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

// ! Đường phân cách giữa các nhóm item.
function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={Cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}

// ! Nút cuộn lên khi danh sách vượt quá chiều cao.
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={Cn(
        "flex w-full cursor-default items-center justify-center bg-white py-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      <IconChevronUp size={14} />
    </SelectPrimitive.ScrollUpArrow>
  );
}

// ! Nút cuộn xuống khi danh sách vượt quá chiều cao.
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={Cn(
        "flex w-full cursor-default items-center justify-center bg-white py-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      <IconChevronDown size={14} />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};