"use client";

import * as React from "react";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import {
  IconCheck,
  IconSearch,
  IconChevronDown,
} from "@tabler/icons-react";

import { Cn, SearchText } from "@/lib/utils";

// ! Kiểu dữ liệu của một lựa chọn
interface ComboboxOption {
  value: string;
  label: string;
}

// ! Props của Combobox
interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;

  // ! Nhãn mặc định khi options chưa tải xong
  defaultLabel?: string;
}

// ! Component Combobox
export function Combobox({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Tìm kiếm...",
  className,
  disabled,
  leftIcon,
  defaultLabel,
}: ComboboxProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // ! Lọc danh sách theo từ khóa
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) {
      return options;
    }

    return options.filter((option) =>
      SearchText(option.label, searchValue),
    );
  }, [options, searchValue]);

  // ! Lấy nhãn của giá trị đang được chọn
  const selectedLabel = value
    ? options.find((option) => option.value === value)?.label ??
      defaultLabel ??
      ""
    : "";

  return (
    <div className={Cn("grid gap-1.5", className)}>
      {/* Label */}
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}

      <ComboboxPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        itemToStringLabel={(value) =>
          options.find((option) => option.value === value)?.label ??
          defaultLabel ??
          ""
        }
      >
        <div
          ref={containerRef}
          className="group relative"
        >
          {/* Hiển thị nhãn khi Input không được focus */}
          {selectedLabel && !isFocused && (
            <div
              className={Cn(
                "pointer-events-none absolute inset-0 flex items-center rounded-2xl px-4 text-[14px] font-medium text-foreground",
                leftIcon ? "pl-10" : "pl-4",
              )}
            >
              {selectedLabel}
            </div>
          )}

          {/* Ô nhập tìm kiếm */}
          <ComboboxPrimitive.Input
            placeholder={placeholder}
            className={Cn(
              "flex h-12 w-full rounded-2xl border border-white/50 bg-white/20 py-2 pr-10 text-[14px] font-medium shadow-xs shadow-slate-200/50 ring-offset-background outline-none backdrop-blur-xl transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:border-primary aria-expanded:ring-2 aria-expanded:ring-primary/20 dark:border-white/10 dark:bg-white/3 dark:shadow-none",
              leftIcon ? "pl-10" : "pl-4",
            )}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Icon bên trái */}
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
              {leftIcon}
            </div>
          )}

          {/* Nút mở danh sách */}
          <ComboboxPrimitive.Trigger className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-muted-foreground/60 transition-colors hover:bg-white/20">
            <IconChevronDown
              size={18}
              className="transition-transform duration-200 group-aria-expanded:rotate-180"
            />
          </ComboboxPrimitive.Trigger>
        </div>

        <ComboboxPrimitive.Portal>
          <ComboboxPrimitive.Positioner
            side="bottom"
            sideOffset={8}
            align="start"
            anchor={containerRef}
            className="z-50"
            style={{
              width: "var(--anchor-width)",
            }}
          >
            <ComboboxPrimitive.Popup
              className={Cn(
                "w-full overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-1 text-foreground shadow-2xl shadow-primary/5 outline-none dark:border-white/10 dark:bg-slate-900/60",
                "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
              )}
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <ComboboxPrimitive.List className="max-h-[300px] overflow-y-auto p-1 outline-none">
                {/* Không có dữ liệu */}
                {filteredOptions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-3 py-8 text-center text-sm text-muted-foreground">
                    <IconSearch
                      size={28}
                      className="text-primary opacity-10"
                    />

                    <span className="font-medium opacity-60">
                      Không tìm thấy kết quả
                    </span>
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <ComboboxPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className={Cn(
                        "mb-0.5 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-transparent px-4 py-3 text-sm font-bold outline-none transition-all last:mb-0",
                        "hover:bg-primary/10 hover:text-primary",
                        "focus:bg-primary/10 focus:text-primary",
                        "data-[selected]:border-primary/20 data-[selected]:bg-primary/10 data-[selected]:text-primary",
                        "dark:data-[selected]:border-primary/30 dark:data-[selected]:bg-primary/20",
                      )}
                    >
                      <span>{option.label}</span>

                      <ComboboxPrimitive.ItemIndicator>
                        <IconCheck
                          size={16}
                          strokeWidth={3}
                        />
                      </ComboboxPrimitive.ItemIndicator>
                    </ComboboxPrimitive.Item>
                  ))
                )}
              </ComboboxPrimitive.List>
            </ComboboxPrimitive.Popup>
          </ComboboxPrimitive.Positioner>
        </ComboboxPrimitive.Portal>
      </ComboboxPrimitive.Root>
    </div>
  );
}