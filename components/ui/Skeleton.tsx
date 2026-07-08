import { Cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={Cn("animate-pulse rounded-2xl bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10", className)}
      {...props}
    />
  )
}

export { Skeleton }