"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
};

const TESTIMONIALS: Testimonial[] = [
  { id: "1", name: "Nguyễn Văn A", role: "Giáo viên Toán",      content: "Learnix giúp tôi quản lý lớp học, tuyển sinh và giao bài tập dễ dàng hơn. Ngân hàng câu hỏi và tính năng chấm điểm tự động giúp tiết kiệm rất nhiều thời gian.", rating: 5 },
  { id: "2", name: "Trần Thị B",   role: "Giáo viên Ngữ văn",   content: "Việc tạo lớp, quản lý học viên và theo dõi kết quả học tập trở nên đơn giản hơn trước. Mọi thao tác đều trực quan và rất dễ sử dụng.",                   rating: 5 },
  { id: "3", name: "Lê Văn C",     role: "Giáo viên Tiếng Anh", content: "Learnix hỗ trợ tôi xây dựng ngân hàng câu hỏi, tạo bài kiểm tra và đánh giá học sinh nhanh chóng. Đây là công cụ rất hữu ích cho việc giảng dạy.",        rating: 5 },
];

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value}/5 sao`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < value
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 h-full shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col">
      <RatingStars value={t.rating} />
      <blockquote className="mt-4 text-sm leading-relaxed text-foreground/90 flex-1">
        &ldquo;{t.content}&rdquo;
      </blockquote>
      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/60">
        <Avatar
          alt={t.name}
          size="md"
          className="h-10 w-10 rounded-full shrink-0"
        />
        <div className="min-w-0">
          <p className="font-bold text-foreground text-sm truncate">
            {t.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {t.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            Cộng đồng tin tưởng Learnix
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Cảm nhận thực tế từ các giáo viên và học sinh đã đồng hành cùng chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}