"use client";

import * as React from "react";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { IconCheck } from "@tabler/icons-react";

import { Cn } from "@/lib/utils";

// ! Component Checkbox
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={Cn(
        "peer flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white transition-all ring-offset-background hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-checked:text-white dark:border-white/20 dark:bg-white/5",
        className,
      )}
      {...props}
    >
      {/* Hiển thị dấu tích khi được chọn */}
      <CheckboxPrimitive.Indicator>
        <IconCheck
          className="h-3.5 w-3.5"
          strokeWidth={3.5}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
);

//! Export Component
export { Checkbox };