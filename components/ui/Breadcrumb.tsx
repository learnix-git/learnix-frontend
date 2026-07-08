"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { ChevronRight, Home, MoreHorizontal } from "lucide-react";

import { Cn } from "@/lib/utils";

// ! Breadcrumb container
function BreadcrumbContainer({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={Cn(className)}
      {...props}
    />
  );
}

// ! Danh sách Breadcrumb
function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={Cn(
        "flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

// ! Một mục trong Breadcrumb
function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={Cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

//! Liên kết Breadcrumb
function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",

    props: mergeProps<"a">(
      {
        className: Cn(
          "transition-colors hover:text-foreground",
          className,
        ),
      },
      props,
    ),

    render,

    state: {
      slot: "breadcrumb-link",
    },
  });
}

// ! Trang hiện tại
function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-current="page"
      aria-disabled="true"
      className={Cn("font-normal text-foreground", className)}
      {...props}
    />
  );
}

// ! Dấu phân cách
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={Cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

// ! Hiển thị ...
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={Cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className,
      )}
      {...props}
    >
      <MoreHorizontal />
      <span className="sr-only">More</span>
    </span>
  );
}

// ! Kiểu dữ liệu của từng đường dẫn
type Path = {
  name: string;
  href: string;
};

// ! ! Định nghĩa Props của Breadcrumb
type BreadcrumbProps = {
  pathList?: Path[];
};

// ! Ánh xạ URL sang tên hiển thị
const map: Record<string, string> = {
  // TODO: Chuyển URL thành tên để hiện thị
};

// ! Breadcrumb tự động tạo theo URL
function BreadcrumbComponent({
  pathList,
}: BreadcrumbProps) {
  const pathname = usePathname();

  let paths = pathList;

  //! Tự sinh breadcrumb từ URL nếu không truyền vào
  if (!paths || paths.length === 0) {
    const segments = pathname.split("/").filter(Boolean);

    paths = [
      {
        name: "Trang chủ",
        href: "/",
      },

      ...segments.map((segment, idx) => ({
        href: "/" + segments.slice(0, idx + 1).join("/"),
        name: map[segment] || segment,
      })),
    ];
  }

  const lastIndex = paths.length - 1;

  return (
    <BreadcrumbContainer>
      <BreadcrumbList className="flex flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1 text-[13px] text-slate-500 scrollbar-none dark:text-slate-400">
        {paths.map((path, index) => {
          const isHome = index === 0;
          const isLastItem = index === lastIndex;

          return (
            <React.Fragment key={`${path.href}-${index}`}>
              {!isHome && (
                <BreadcrumbSeparator className="flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                </BreadcrumbSeparator>
              )}

              <BreadcrumbItem className="flex items-center">
                {isLastItem ? (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
                    {isHome && (
                      <Home
                        className="h-3.5 w-3.5 text-primary/80"
                        strokeWidth={2.2}
                      />
                    )}

                    {path.name}
                  </span>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={path.href} />}
                    className="flex items-center gap-1.5 font-semibold text-slate-500 transition-all duration-200 hover:text-primary dark:text-slate-400 dark:hover:text-primary"
                  >
                    {isHome && (
                      <Home
                        className="h-3.5 w-3.5"
                        strokeWidth={2.2}
                      />
                    )}

                    {path.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  );
}

//! Export Components
export {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbComponent,
  BreadcrumbContainer,
};