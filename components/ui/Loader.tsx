"use client";

import { IconLoader2 } from "@tabler/icons-react";

import { Cn } from "@/lib/utils";

// ! Props của Loader
interface LoaderProps {

  // ! Class tùy chỉnh
  className?: string;

  // ! Kích thước icon
  size?: number;
}

// ! Loader component
export function Loader({
  className,
  size = 32,
}: LoaderProps) {
  return (
    <div
      className={Cn(
        // ! Wrapper
        "flex items-center justify-center",

        className,
      )}
    >
      <IconLoader2
        size={size}
        className={
          // ! Hiệu ứng xoay
          "animate-spin text-primary"
        }
      />
    </div>
  );
}

// ! Full page loading
export function FullPageLoader() {
  return (
    <div
      className="
        flex
        min-h-[60vh]
        w-full
        items-center
        justify-center
      "
    >
      <Loader size={32} />
    </div>
  );
}