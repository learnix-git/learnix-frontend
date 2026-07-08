import * as React from "react";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { Cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// ! Pagination container
function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={Cn(
        "mx-auto flex w-full justify-center",
        className,
      )}
      {...props}
    />
  );
}

// ! Pagination list
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={Cn(
        "flex items-center gap-2",
        "border-none bg-transparent",
        "p-0 shadow-none",
        "backdrop-blur-none",

        className,
      )}
      {...props}
    />
  );
}

// ! Pagination item
function PaginationItem(
  props: React.ComponentProps<"li">,
) {
  return (
    <li
      data-slot="pagination-item"
      {...props}
    />
  );
}

// ! Props của PaginationLink
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<
  React.ComponentProps<typeof Button>,
  "size"
> &
  React.ComponentProps<"a">;

// ! Link của Pagination
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {

  // ! Kiểm tra có phải số trang không
  const isNumber =
    typeof props.children === "number" ||
    (
      typeof props.children === "string" &&
      !isNaN(Number(props.children))
    );

  return (
    <Button
      variant="ghost"
      size={size}
      nativeButton={false}
      className={Cn(

        // ! Base Style
        "flex items-center justify-center",
        "h-10 rounded-xl",
        "border border-transparent",
        "text-sm font-medium",
        "cursor-pointer select-none",
        "transition-all duration-200",

        // ! Number Button
        isNumber
          ? "w-10 border-black/[0.08] dark:border-white/[0.08]"
          : "w-auto px-0 border-none! bg-transparent! shadow-none! text-slate-600 dark:text-slate-400 hover:bg-transparent! active:bg-transparent! hover:text-slate-900 dark:hover:text-white",

        // ! Active
        isActive &&
          isNumber &&
          "bg-primary! text-white! border-primary! font-semibold cursor-default hover:bg-primary/90! hover:text-white! shadow-lg! shadow-primary/40!",

        // ! Normal
        !isActive &&
          isNumber &&
          "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",

        className,
      )}
      render={
        <a
          aria-current={
            isActive
              ? "page"
              : undefined
          }
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  );
}

// ! Previous Button
function PaginationPrevious({
  className,
  text = "Trước",
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string;
}) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={Cn(

        // ! Style
        "gap-1 px-0",
        "rounded-xl",
        "border-none!",
        "bg-transparent!",
        "shadow-none!",
        "text-sm font-medium",
        "text-slate-600 dark:text-slate-400",
        "hover:bg-transparent!",
        "active:bg-transparent!",
        "hover:text-slate-900 dark:hover:text-white",

        className,
      )}
      {...props}
    >
      <ChevronLeftIcon className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </PaginationLink>
  );
}

// ! Next Button
function PaginationNext({
  className,
  text = "Sau",
  ...props
}: React.ComponentProps<typeof PaginationLink> & {
  text?: string;
}) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={Cn(

        // ! Style
        "gap-1 px-0",
        "rounded-xl",
        "border-none!",
        "bg-transparent!",
        "shadow-none!",
        "text-sm font-medium",
        "text-slate-600 dark:text-slate-400",
        "hover:bg-transparent!",
        "active:bg-transparent!",
        "hover:text-slate-900 dark:hover:text-white",

        className,
      )}
      {...props}
    >
      <span>{text}</span>
      <ChevronRightIcon className="h-4 w-4 shrink-0" />
    </PaginationLink>
  );
}

// ! Ellipsis (...)
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={Cn(

        // ! Base Style
        "flex size-10 items-center justify-center",
        "text-slate-400 dark:text-slate-600",
        "[&_svg:not([class*='size-'])]:size-5",

        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon />

      <span className="sr-only">
        More pages
      </span>
    </span>
  );
}

// ! Export Components
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};