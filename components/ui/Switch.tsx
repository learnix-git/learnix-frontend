"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { Cn } from "@/lib/utils";

// ! Wrapper của Switch với giao diện thống nhất của dự án.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={Cn(
      "group/switch inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-slate-200/70 transition-colors outline-none",
      "hover:bg-slate-300/70",
      "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-checked:bg-primary data-checked:hover:bg-primary/90",
      "dark:bg-white/10 dark:hover:bg-white/20 dark:data-checked:bg-primary",
      className
    )}
    {...props}
  >
    {/* Thumb tự động di chuyển theo trạng thái checked của Switch. */}
    <SwitchPrimitive.Thumb
      className={Cn(
        "pointer-events-none block h-[18px] w-[18px] translate-x-[3px] rounded-full bg-white shadow-md ring-0 transition-transform",
        "group-data-checked/switch:translate-x-[22px]",
        "dark:bg-white"
      )}
    />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };