"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";

import { Cn } from "@/lib/utils";

// ! Props của Input component
export interface InputProps
  extends Omit<React.ComponentProps<typeof BaseInput>, "className" | "size"> {

  // ! Class cho input
  className?: string;

  // ! Class cho wrapper ngoài
  containerClassName?: string;

  // ! Hiển thị trạng thái lỗi
  invalid?: boolean;

  // ! Icon bên trái
  leftAdornment?: React.ReactNode;

  // ! Icon bên phải
  rightAdornment?: React.ReactNode;
}

// ! Input component
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      className,
      containerClassName,
      invalid = false,
      leftAdornment,
      rightAdornment,
      type = "text",
      ...rest
    },
    ref,
  ) {

    // ! Input chính
    const inputEl = (
      <BaseInput
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={Cn(
          // ! Base Style
          "w-full rounded-2xl",
          "bg-white/40 dark:bg-slate-900/40",
          "backdrop-blur-2xl",
          "border border-white/60 dark:border-white/10",
          "px-4 py-2.5",
          "text-sm text-foreground",
          "placeholder:text-muted-foreground/80",
          "outline-none transition-all",

          // ! Focus
          "focus:bg-white/60 dark:focus:bg-slate-900/60",
          "focus:border-primary/40",
          "focus:ring-2",
          "focus:ring-primary/20",

          // ! Disabled
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",

          // ! Invalid
          invalid &&
            "border-rose-500/50 focus:border-rose-500/70 focus:ring-rose-500/20",

          // ! Padding khi có icon
          leftAdornment && "pl-10",
          rightAdornment && "pr-10",

          className,
        )}
        {...rest}
      />
    );

    // ! Không có icon
    if (!leftAdornment && !rightAdornment) {
      return (
        <div className={Cn("relative", containerClassName)}>
          {inputEl}
        </div>
      );
    }

    // ! Có icon
    return (
      <div className={Cn("relative w-full", containerClassName)}>

        {/* ! Left Icon */}
        {leftAdornment && (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            {leftAdornment}
          </div>
        )}

        {inputEl}

        {/* ! Right Icon */}
        {rightAdornment && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            {rightAdornment}
          </div>
        )}

      </div>
    );
  },
);

// ! Display name
Input.displayName = "Input";