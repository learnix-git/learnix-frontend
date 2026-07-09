"use client";

import React, { useEffect, useState } from "react";
import {
  Bookmark,
  FileText,
  Headphones,
  ArrowUp,
  X,
  MessageSquare,
  Image as ImageIcon,
  Star,
  Send,
  BookOpen,
  PhoneCall,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import TooltipHover from "../ui/Tooltip";
import Link from "next/link";
import { Cn } from "@/lib/utils";

const actionButtons = [
  {
    id: "favorite",
    label: "Lớp học yêu thích",
    icon: Bookmark,
    badge: 0,
    href: "/classes/saved",
  },
  {
    id: "exams",
    label: "Tài liệu yêu thích",
    icon: FileText,
    href: "/exams",
  },
  {
    id: "share",
    label: "Góp ý & Phản hồi",
    icon: MessageSquare,
    href: "",
  },
  {
    id: "support",
    label: "Hỗ trợ trực tuyến 24/7",
    icon: Headphones,
    href: "",
  },
];

const supportOptions = [
  {
    id: "student-guide",
    label: "Hướng dẫn dành cho Học sinh",
    icon: BookOpen,
    href: "/about-us",
  },
  {
    id: "teacher-guide",
    label: "Hướng dẫn dành cho Giáo viên",
    icon: FileText,
    href: "/about-us",
  },
  {
    id: "faq",
    label: "Các câu hỏi thường gặp FQA",
    icon: HelpCircle,
    href: "/about-us",
  },
  {
    id: "zalo-support",
    label: "Hỗ trợ trực tuyến qua Zalo",
    icon: MessageCircle,
    href: "https://zalo.me",
  },
];

function ActionButton({
  item,
  onClick,
}: {
  item: (typeof actionButtons)[number];
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const isLink = !!item.href;

  const buttonContent = (
    <div
      role="button"
      aria-label={item.label}
      onClick={isLink ? undefined : onClick}
      className={Cn(
        "relative flex h-11 w-11 items-center justify-center",
        "rounded-full bg-white dark:bg-white/10 text-primary dark:text-white",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        "border border-border",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:bg-primary hover:text-white hover:border-primary",
        "hover:shadow-xl hover:shadow-primary/20",
        "active:scale-95 cursor-pointer"
      )}
    >
      <Icon className="h-5 w-5" />

      {typeof item.badge === "number" && item.badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white shadow-md">
          {item.badge}
        </span>
      )}
    </div>
  );

  if (isLink) {
    return (
      <TooltipHover content={item.label} side="left">
        <Link href={item.href}>{buttonContent}</Link>
      </TooltipHover>
    );
  }

  return (
    <TooltipHover content={item.label} side="left">
      {buttonContent}
    </TooltipHover>
  );
}

export function Support() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isShowSupport, setIsShowSupport] = useState(false);
  const [isShowFeedback, setIsShowFeedback] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

  const supportRef = React.useRef<HTMLDivElement>(null);
  const feedbackRef = React.useRef<HTMLDivElement>(null);

  function openModalHandler(item: string) {
    if (item === "support") {
      setIsShowSupport((prev) => !prev);
      setIsShowFeedback(false);
    }

    if (item === "share") {
      setIsShowFeedback((prev) => !prev);
      setIsShowSupport(false);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isShowSupport && supportRef.current && !supportRef.current.contains(event.target as Node)) {
        setIsShowSupport(false);
      }
      if (isShowFeedback && feedbackRef.current && !feedbackRef.current.contains(event.target as Node)) {
        setIsShowFeedback(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShowSupport, isShowFeedback]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="fixed right-6 bottom-24 z-40 hidden lg:flex flex-col items-center gap-3">
        <div
          className="
            flex flex-col items-center gap-3
            rounded-full bg-background/80
            backdrop-blur-xl backdrop-saturate-180
            px-2 py-4
            shadow-2xl shadow-black/10
            border border-border
          "
        >
          {actionButtons.map((item) => (
            <ActionButton
              key={item.id}
              item={item}
              onClick={() => openModalHandler(item.id)}
            />
          ))}
        </div>

        {/* Nút Cuộn lên đầu trang */}
        {showScrollTop && (
          <TooltipHover content="Quay về đầu trang" side="left">
            <div
              onClick={handleScrollTop}
              role="button"
              aria-label="Quay về đầu trang"
              className="
                relative flex h-11 w-11 items-center justify-center
                rounded-full bg-white/80 dark:bg-slate-900/80
                backdrop-blur-xl backdrop-saturate-180
                text-primary dark:text-white
                shadow-lg shadow-black/10
                border border-border
                transition-all duration-300 ease-out
                hover:-translate-y-1 hover:bg-primary hover:text-white
                hover:shadow-xl hover:shadow-primary/20
                active:scale-95 cursor-pointer
              "
            >
              <ArrowUp className="h-5 w-5" />
            </div>
          </TooltipHover>
        )}
      </div>

      {/* HỖ TRỢ TRỰC TUYẾN */}
      {isShowSupport && (
        <div
          ref={supportRef}
          className="
            fixed bottom-6 right-24 z-50
            w-[340px]
            overflow-hidden rounded-3xl
            bg-card
            shadow-2xl shadow-black/20
            border border-border
            backdrop-blur-2xl
            animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300
          "
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-sky-500 px-5 pb-6 pt-5">
            <div
              onClick={() => setIsShowSupport(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 cursor-pointer transition hover:bg-white/20 hover:text-white z-10"
            >
              <X className="h-4 w-4" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-inner">
                <img
                  src="/images/logo/logo.png"
                  alt="Learnix Logo"
                  className="block h-10 w-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white leading-tight">
                  Learnix
                </h3>
                <p className="mt-1 text-sm text-white/90 font-medium">
                  Hỗ trợ học tập 24/7
                </p>
                <p className="mt-0.5 text-xs text-white/70">
                  Phản hồi nhanh chóng trong 24h
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {supportOptions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-foreground">
                      {item.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* GÓP Ý & PHẢN HỒI */}
      {isShowFeedback && (
        <div
          ref={feedbackRef}
          className="
            fixed bottom-6 right-24 z-50
            w-[380px]
            overflow-hidden rounded-3xl
            bg-card
            shadow-2xl shadow-black/20
            border border-border
            backdrop-blur-2xl
            animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300
          "
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-sky-500 px-5 pb-6 pt-5">
            <button
              onClick={() => setIsShowFeedback(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 cursor-pointer border-none"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-white shadow-inner shrink-0">
                <img
                  src="/images/logo/logo.png"
                  alt="Learnix Logo"
                  className="block h-10 w-10 object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Góp ý với Learnix</h3>
                <p className="mt-1.5 text-xs text-white/90 leading-relaxed">
                  Ý kiến của bạn giúp chúng tôi nâng cao chất lượng giảng dạy và học tập mỗi ngày.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <p className="mb-2.5 text-sm font-bold text-foreground">
                Đánh giá trải nghiệm
              </p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= rating;
                  return (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all duration-200 hover:scale-110 cursor-pointer border-none bg-transparent p-0"
                    >
                      <Star
                        className={Cn(
                          "h-7 w-7 transition-colors",
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30 hover:text-amber-400/50"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {rating === 0 && "Hãy đánh giá trải nghiệm của bạn trên Learnix"}
                {rating === 1 && "Rất không hài lòng"}
                {rating === 2 && "Không hài lòng"}
                {rating === 3 && "Bình thường"}
                {rating === 4 && "Hài lòng"}
                {rating === 5 && "Tuyệt vời, rất hài lòng!"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-bold text-foreground">
                Nội dung góp ý
              </p>
              <textarea
                placeholder="Chia sẻ cảm nhận, góp ý hoặc báo cáo vấn đề bạn gặp phải..."
                className="
                  h-[110px] w-full resize-none
                  rounded-2xl border border-border
                  bg-muted/50
                  px-4 py-3 text-sm text-foreground
                  placeholder:text-muted-foreground
                  outline-none transition
                  focus:border-primary focus:bg-background
                "
              />
            </div>

            <div>
              <input
                type="file"
                id="feedback-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setPreviewImage(imageUrl);
                  }
                }}
              />

              {!previewImage ? (
                <label
                  htmlFor="feedback-upload"
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-xl border-2 border-dashed border-border
                    px-4 py-3 text-sm font-medium
                    text-muted-foreground
                    transition cursor-pointer
                    hover:border-primary hover:text-primary
                  "
                >
                  <ImageIcon className="h-4 w-4" />
                  Đính kèm hình ảnh minh họa
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="preview"
                    className="h-[130px] w-full rounded-2xl object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black cursor-pointer border-none"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsShowFeedback(false)}
                className="
                  rounded-xl border border-border
                  px-4 py-2 text-xs font-bold
                  text-muted-foreground
                  transition hover:bg-muted hover:text-foreground
                  cursor-pointer bg-transparent
                "
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShowFeedback(false);
                }}
                className="
                  flex items-center gap-1.5
                  rounded-xl bg-primary px-5 py-2
                  text-xs font-bold text-white
                  shadow-lg shadow-primary/25
                  transition hover:bg-primary/90 hover:scale-[1.02]
                  cursor-pointer border-none
                "
              >
                <Send className="h-3.5 w-3.5" />
                Gửi góp ý
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Support;