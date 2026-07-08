"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { ChevronRight, BookOpen, Users, Star, Sparkles } from "lucide-react";
import Link from "next/link";

const CLASSROOMS = [
  { id: "1", name: "Toán 12 - Chuyên đề Khảo sát hàm số", code: "TOAN12-A", teacher: "Thầy Hữu Thọ", students: "38/40", rating: "4.9", tag: "Toán học", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80" },
  { id: "2", name: "Ngữ văn 12 - Nghị luận xã hội 8+ 9+", code: "VAN12-B", teacher: "Cô Thu Trang", students: "37/40", rating: "4.8", tag: "Ngữ văn", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80" },
  { id: "3", name: "IELTS 6.5+ Cấp tốc Speaking & Writing", code: "ANH12-C", teacher: "Cô Mai Anh", students: "36/40", rating: "5.0", tag: "Ngoại ngữ", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80" },
  { id: "4", name: "Vật lý 12 - Dao động cơ & Sóng điện từ", code: "LY11-D", teacher: "Thầy Đức Lý", students: "34/40", rating: "4.7", tag: "Vật lý", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80" },
  { id: "5", name: "Hóa học 11 - Thực chiến 50 đề thi thử", code: "HOA11-E", teacher: "Thầy Hoàng Hóa", students: "35/40", rating: "4.9", tag: "Hóa học", image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80" },
  { id: "6", name: "Python Cơ Bản - Bước đệm HSG Tin học", code: "IT10-F", teacher: "Thầy Tiến Hưng", students: "32/40", rating: "5.0", tag: "Tin học", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
];

function InlineClassCard({ item }: { item: (typeof CLASSROOMS)[0] }) {
  return (
    <Link
      href="/classes"
      className="group relative flex flex-col justify-between h-full w-full rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Khối ảnh phía trên */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Tag Môn học - Dùng màu Primary (Xanh dương) */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/90 text-white backdrop-blur-md shadow-sm">
          <Sparkles className="h-3 w-3" />
          {item.tag}
        </span>

        {/* Rating */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-black/60 text-amber-400 backdrop-blur-md border border-white/10">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {item.rating}
        </span>

        {/* Mã lớp */}
        <div className="absolute bottom-2 left-3 text-[11px] font-semibold text-gray-300">
          Mã lớp: <span className="text-white font-bold">{item.code}</span>
        </div>
      </div>

      {/* Khối nội dung phía dưới */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-card">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 truncate">
            Giáo viên: <span className="text-foreground font-medium">{item.teacher}</span>
          </p>
        </div>

        {/* Footer của Thẻ */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-500 dark:text-emerald-400">
            <Users className="h-3.5 w-3.5" />
            Sĩ số: {item.students}
          </span>

          <span className="font-bold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center">
            Chi tiết <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Benefits() {
  const chunkedClassrooms = CLASSROOMS.reduce<(typeof CLASSROOMS)[]>(
    (result, item, index) => {
      const chunkIndex = Math.floor(index / 2);
      if (!result[chunkIndex]) result[chunkIndex] = [];
      result[chunkIndex].push(item);
      return result;
    },
    []
  );

  return (
    <section className="py-16 sm:py-24 !overflow-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 !overflow-visible">
        
        {/* Header Section */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
              Chương trình đào tạo
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Lớp học nổi bật
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Khám phá các lớp học trực tuyến và tài liệu trên Learnix ngay bây giờ!
            </p>
          </div>

          <Link
            href="/classes"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Xem tất cả lớp học
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="mt-10 relative px-0 lg:px-4 !overflow-visible">
          <Carousel
            opts={{ align: "start", loop: false }}
            className="w-full !overflow-visible"
          >
            <CarouselContent
              viewportClassName="-my-6 overflow-hidden py-6"
              className="-ml-4 !overflow-visible"
            >
              {chunkedClassrooms.map((pair, chunkIndex) => (
                <CarouselItem
                  key={chunkIndex}
                  className="pl-4 basis-[85%] sm:basis-[50%] lg:basis-1/3 !overflow-visible"
                >
                  <div className="grid h-full auto-rows-fr grid-cols-1 gap-4 !overflow-visible">
                    {pair.map((item) => (
                      <InlineClassCard key={item.id} item={item} />
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="hidden sm:block">
              <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-6 bg-card border border-border text-foreground shadow-xl backdrop-blur-sm z-30 hover:bg-primary hover:text-white hover:border-primary transition-all" />
              <CarouselNext className="absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-6 bg-card border border-border text-foreground shadow-xl backdrop-blur-sm z-30 hover:bg-primary hover:text-white hover:border-primary transition-all" />
            </div>
          </Carousel>
        </div>

        {/* Mobile View More Button */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/classes"
            className="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-bold text-primary border border-primary/20 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            Xem tất cả lớp học
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}