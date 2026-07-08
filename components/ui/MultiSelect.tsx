"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import {
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";

import { Cn } from "@/lib/utils";

// ! Props của MultiSelect
interface MultiSelectProps {

  // ! Label phía trên
  label?: string;

  // ! Danh sách lựa chọn
  options: string[];

  // ! Giá trị đang chọn
  selected: string[];

  // ! Callback khi thay đổi
  onChange: (value: string[]) => void;

  // ! Placeholder
  placeholder?: string;

  // ! Class tùy chỉnh
  className?: string;

  // ! Disable component
  disabled?: boolean;
}

// ! Multi Select Component
export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Chọn...",
  className,
  disabled,
}: MultiSelectProps) {

  // ! Thêm hoặc bỏ một option
  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  };

  // ! Nội dung hiển thị trên Trigger
  const displayText =
    selected.length === 0
      ? placeholder
      : selected.join(", ");

  return (
    <div
      className={Cn(
        "grid gap-1.5",
        className,
      )}
    >

      {/* Label */}
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <Popover.Root>

        {/* Trigger */}
        <Popover.Trigger
          disabled={disabled}
          className={Cn(
            "flex h-12 w-full items-center justify-between",
            "rounded-2xl",
            "border border-white/40 dark:border-white/10",
            "bg-white/40 dark:bg-white/5",
            "px-4 py-2",
            "text-[14px] font-medium",
            "backdrop-blur-md",
            "ring-offset-background",
            "outline-none transition-all",
            "shadow-sm",

            // ! Hover & Focus
            "hover:border-primary/50",
            "focus:border-primary",
            "focus:ring-2",
            "focus:ring-primary/20",

            // ! Expanded
            "aria-expanded:border-primary",
            "aria-expanded:ring-2",
            "aria-expanded:ring-primary/20",

            // ! Disabled
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",

            // ! Placeholder
            selected.length === 0 &&
              "text-muted-foreground",
          )}
        >
          <span className="flex-1 truncate text-left">
            {displayText}
          </span>

          <IconChevronDown
            className="
              ml-2
              h-4
              w-4
              shrink-0
              opacity-50
              transition-transform
              duration-200
              group-aria-expanded:rotate-180
            "
          />
        </Popover.Trigger>

        {/* Popup */}
        <Popover.Portal>

          <Popover.Positioner
            side="bottom"
            sideOffset={4}
            align="start"
            className="z-50"
          >
            <Popover.Popup
              className={Cn(
                "w-[var(--base-ui-popover-trigger-width)]",
                "min-w-[200px]",
                "overflow-hidden",
                "rounded-2xl",
                "border border-white/40 dark:border-white/10",
                "bg-white/80 dark:bg-slate-900/90",
                "p-1",
                "text-foreground",
                "shadow-2xl shadow-primary/5",
                "backdrop-blur-xl",
                "outline-none",

                // ! Animation
                "data-[starting-style]:opacity-0",
                "data-[ending-style]:opacity-0",
                "data-[open]:animate-in",
                "data-[closed]:animate-out",
                "data-[closed]:fade-out-0",
                "data-[open]:fade-in-0",
                "data-[closed]:zoom-out-95",
                "data-[open]:zoom-in-95",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=top]:slide-in-from-bottom-2",
              )}
            >
              <ul className="max-h-[300px] overflow-y-auto p-1">

                {/* Không có dữ liệu */}
                {options.length === 0 ? (
                  <li className="px-3 py-2 text-center text-sm text-muted-foreground">
                    Không có lựa chọn
                  </li>
                ) : (

                  // ! Danh sách option
                  options.map((option) => {

                    const isSelected =
                      selected.includes(option);

                    return (
                      <li
                        key={option}
                        onClick={() => toggle(option)}
                        className={Cn(
                          "mb-0.5 last:mb-0",
                          "flex cursor-pointer items-center gap-3",
                          "rounded-xl",
                          "px-4 py-3",
                          "text-sm font-bold",
                          "outline-none transition-all",

                          isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "text-foreground hover:bg-primary/10 hover:text-primary",
                        )}
                      >

                        {/* Checkbox */}
                        <div
                          className={Cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center",
                            "rounded border transition-colors",

                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border",
                          )}
                        >
                          {isSelected && (
                            <IconCheck
                              className="h-3 w-3"
                              strokeWidth={3}
                            />
                          )}
                        </div>

                        {option}

                      </li>
                    );
                  })

                )}

              </ul>
            </Popover.Popup>
          </Popover.Positioner>

        </Popover.Portal>

      </Popover.Root>

    </div>
  );
}