import { HTMLAttributes, forwardRef } from "react";

// ! Props của Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

// ! Card dùng để hiển thị nội dung trong một khung
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      hover = false,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          border
          border-white/40
          bg-white/40
          p-6
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-white/5

          ${
            hover
              ? "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-2xl hover:shadow-primary/10 dark:hover:bg-white/10"
              : "shadow-lg shadow-slate-200/50 dark:shadow-none"
          }

          ${className}
        `}
        {...props}
      >
        {/* Nội dung của Card */}
        {children}
      </div>
    );
  },
);