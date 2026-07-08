"use client";

import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  large?: boolean;
}

// ! Thanh tìm kiếm dùng chung, hỗ trợ callback khi submit.
export function SearchBar({
  placeholder = "Search for something...",
  onSearch,
  className = "",
  large = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // ! Xử lý submit và trả về từ khóa tìm kiếm.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div
        className={`flex items-center ${
          large
            ? "bg-card border-2 border-primary/20 rounded-xl shadow-lg"
            : "bg-muted rounded-[var(--radius)] border border-border"
        } overflow-hidden`}
      >
        {/* Icon tìm kiếm. */}
        <svg
          className="h-5 w-5 text-muted-foreground ml-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Ô nhập từ khóa tìm kiếm. */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground ${
            large ? "py-4 px-4 text-lg" : "py-2.5 px-3 text-sm"
          }`}
        />

        {/* Nút gửi tìm kiếm. */}
        <button
          type="submit"
          className="bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity cursor-pointer shrink-0 m-1.5 rounded-lg px-5 py-2 text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}