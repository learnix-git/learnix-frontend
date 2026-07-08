"use client";

import * as React from "react";

import { Cn } from "@/lib/utils";

// ! Label component
function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={Cn(
        // ! Base Style
        "flex items-center gap-2",
        "text-sm font-medium leading-none",
        "select-none",

        // ! Disabled State
        "group-data-[disabled=true]:pointer-events-none",
        "group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed",
        "peer-disabled:opacity-50",

        className,
      )}
      {...props}
    />
  );
}

// ! Export
export { Label };