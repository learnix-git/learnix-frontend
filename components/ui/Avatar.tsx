"use client";

import { useState } from "react";

// ! Định nghĩa Props của Avatar
interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// ! Kích thước Avatar
const Size = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-xl",
};

//! Avatar dùng để hiển thị ảnh đại diện hoặc chữ cái đầu
export function Avatar({
  src,
  alt,
  size = "md",
  className = "",
}: AvatarProps) {

  // ! Trạng thái kiểm tra ảnh có tải thành công hay không
  const [error, setError] = useState(false);

  // ! Lấy tối đa 2 ký tự đầu từ tên người dùng
  const initials = (alt || "")
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        relative
        inline-flex
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-[2.2rem]
        bg-primary/10
        font-semibold
        text-primary
        ${Size[size]}
        ${className}
      `}
    >
      {/* Hiển thị ảnh đại diện nếu tải thành công */}
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        /* Hiển thị chữ cái đầu khi không có ảnh */
        <span>{initials}</span>
      )}
    </div>
  );
}