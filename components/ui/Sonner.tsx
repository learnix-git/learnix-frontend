"use client"

import { useTheme } from "next-themes"
import { Toaster as Radix } from "sonner"

type ToasterProps = React.ComponentProps<typeof Radix>

// ! Hiển thị hệ thống thông báo toàn cục với giao diện và chủ đề tùy chỉnh.
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const resolved: "system" | "light" | "dark" =
    theme === "light" || theme === "dark" ? theme : "system"

  return (
    <Radix
      theme={resolved}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:glass-toast-effect group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:justify-between group-[.toaster]:w-full group-[.toaster]:max-w-[356px] group-[.toaster]:p-4 group-[.toaster]:rounded-[32px] group-[.toaster]:shadow-[0_20px_50px_rgba(168,85,247,0.12)] group-[.toaster]:gap-4 group-[.toaster]:border group-[.toaster]:border-white/60 group-[.toaster]:dark:border-white/10 group-[.toaster]:text-sm group-[.toaster]:text-slate-800 group-[.toaster]:dark:text-slate-200 group-[.toaster]:font-sans group-[.toaster]:tracking-wide",
          title: "group-[.toast]:text-[14px] group-[.toast]:font-bold group-[.toast]:text-slate-900 group-[.toast]:dark:text-white group-[.toast]:leading-normal",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:shrink-0 group-[.toast]:rounded-full group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:text-xs group-[.toast]:font-bold group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:hover:bg-primary/95 group-[.toast]:transition-all group-[.toast]:shadow-lg group-[.toast]:shadow-primary/20 group-[.toast]:hover:scale-105 group-[.toast]:active:scale-95 group-[.toast]:cursor-pointer",
          cancelButton:
            "group-[.toast]:shrink-0 group-[.toast]:rounded-full group-[.toast]:bg-slate-200 group-[.toast]:dark:bg-white/10 group-[.toast]:text-slate-800 group-[.toast]:dark:text-slate-200 group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:hover:opacity-90 group-[.toast]:transition-all group-[.toast]:cursor-pointer",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }