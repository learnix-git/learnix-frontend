"use client";

import React from "react";

import { IconInbox } from "@tabler/icons-react";

// ! Props của Component Empty
export type EmptyProps = {
  // ! Icon hiển thị
  icon?: React.ReactNode;

  // ! Tiêu đề
  title: string;

  // ! Mô tả
  description?: React.ReactNode;

  // ! Nút hoặc Action
  action?: React.ReactNode;

  // ! Class tùy chỉnh
  className?: string;

  // ! Kiểu hiển thị
  variant?: "default" | "search";
};

// ! Component hiển thị trạng thái rỗng
export function Empty({
  icon,
  title,
  description,
  action,
  className = "",
  variant = "search",
}: EmptyProps) {
  // ! Kiểm tra chế độ Search
  const isSearch = variant === "search";

  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",

        isSearch
          ? "group relative rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/40 px-8 py-24 shadow-sm backdrop-blur-xl transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] dark:border-slate-800 dark:bg-slate-900/40"
          : "rounded-[32px] border border-white/50 bg-white/40 px-5 py-16 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/40",

        className,
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "relative flex items-center justify-center backdrop-blur-xl",

          isSearch
            ? "mb-6 h-20 w-20 rounded-full bg-primary/10 shadow-inner transition-transform duration-500 group-hover:scale-105"
            : "mb-5 rounded-full bg-primary/10 p-4 text-primary dark:bg-primary/20 dark:text-primary/95",
        ].join(" ")}
      >
        {icon || (
          <IconInbox
            size={40}
            stroke={1.5}
          />
        )}
      </div>

      {/* Tiêu đề */}
      <h3
        className={[
          "m-0 font-black tracking-tight",

          isSearch
            ? "mb-3 text-lg text-slate-900 dark:text-white"
            : "mb-2 text-lg text-foreground",
        ].join(" ")}
      >
        {title}
      </h3>

      {/* Mô tả */}
      {description && (
        <p
          className={[
            "m-0 leading-relaxed",

            isSearch
              ? "max-w-[300px] text-sm text-slate-500 dark:text-slate-400"
              : "mx-auto max-w-sm text-[13px] font-medium text-muted-foreground",
          ].join(" ")}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div
          className={[
            "flex w-full justify-center",

            isSearch
              ? "mt-8"
              : "mt-6 max-w-xs",
          ].join(" ")}
        >
          {action}
        </div>
      )}
    </div>
  );
}