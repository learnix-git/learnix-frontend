"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Toggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F5F7] dark:bg-white/5 text-[#1D2B36] dark:text-slate-200 hover:bg-[#E5E7EB] dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
      aria-label="Toggle theme"
    >
      <Sun className="h-[22px] w-[22px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[22px] w-[22px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}