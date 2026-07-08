"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  BookOpen,
  Calculator,
  Atom,
  Languages,
  Code,
  FlaskConical,
} from "lucide-react";

const SCROLL_AMOUNT = 300;
const MAX_VISIBLE_CLASSES = 8;

const CATEGORIES = [
  { id: "toan", name: "Toán học", icon: Calculator },
  { id: "anh", name: "Tiếng Anh", icon: Languages },
  { id: "ly", name: "Vật lý", icon: Atom },
  { id: "van", name: "Ngữ văn", icon: BookOpen },
  { id: "hoa", name: "Hóa học", icon: FlaskConical },
  { id: "tin", name: "Tin học", icon: Code },
];

interface MockClassItem {
  id: string;
  name: string;
  category: string;
  slug: string;
  image: string;
}

const CLASSROOMS: MockClassItem[] = [
  // TOÁN
  { id: "1",  name: "Toán 12",      category: "toan", slug: "toan-12",      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80" },
  { id: "2",  name: "Toán 11",      category: "toan", slug: "toan-11",      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80" },

  // TIẾNG ANH
  { id: "3",  name: "Tiếng Anh 12", category: "anh",  slug: "tieng-anh-12", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80" },
  { id: "4",  name: "Tiếng Anh 11", category: "anh",  slug: "tieng-anh-11", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80" },

  // VẬT LÝ
  { id: "5",  name: "Vật lý 12",    category: "ly",   slug: "vat-ly-12",    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80" },
  { id: "6",  name: "Vật lý 11",    category: "ly",   slug: "vat-ly-11",    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80" },

  // NGỮ VĂN
  { id: "7",  name: "Ngữ văn 12",   category: "van",  slug: "ngu-van-12",   image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80" },

  // HÓA HỌC
  { id: "8",  name: "Hóa học 11",   category: "hoa",  slug: "hoa-hoc-11",   image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80" },

  // TIN HỌC
  { id: "9",  name: "Tin học 11",   category: "tin",  slug: "tin-hoc-11",   image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
  { id: "10", name: "Tin học 12",   category: "tin",  slug: "tin-hoc-12",   image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
];

export function Features() {
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Lọc danh sách lớp theo tab đang chọn
  const filteredClasses = useMemo(() => {
    const list = selectedCategory
      ? CLASSROOMS.filter((c) => c.category === selectedCategory)
      : CLASSROOMS;
    return list.slice(0, MAX_VISIBLE_CLASSES);
  }, [selectedCategory]);

  const rows = filteredClasses.length > 4 ? 2 : 1;

  const scrollCategories = (direction: "left" | "right") => {
    categoriesRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  // Đường dẫn đến trang danh sách lớp học theo môn
  const viewAllHref = selectedCategory
    ? `/classes?subject=${selectedCategory}`
    : "/classes";

  return (
    <section className="py-8 sm:py-10 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Khám phá môn học
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Lựa chọn bộ môn bạn cần ôn tập hoặc cải thiện kiến thức cùng các thầy cô tâm huyết
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
          
          {/* Moving purple glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute w-[500px] h-[500px] bg-[radial-gradient(circle,theme(colors.primary/25),transparent_70%)] blur-3xl opacity-60" />
          </div>

          {/* TOP CATEGORIES WRAPPER */}
          <div className="relative mb-6 w-full group/cats">
            <div
              ref={categoriesRef}
              className="flex justify-start sm:justify-center gap-2 sm:gap-4 md:gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden py-1 w-full transition-all sm:px-10 no-scrollbar"
            >
              <CategoryTab
                iconSlot={<BookOpen className="h-5 w-5" />}
                label="Môn học phổ biến"
                active={selectedCategory === null}
                onClick={() => setSelectedCategory(null)}
              />

              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <CategoryTab
                    key={cat.id}
                    iconSlot={<IconComponent className="h-5 w-5" />}
                    label={cat.name}
                    active={selectedCategory === cat.id}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* CLASSES GRID (LƯỚI LỚP HỌC) */}
          {filteredClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2 border border-white/5 rounded-2xl bg-white/[0.01]">
              <Inbox className="h-10 w-10 text-primary/40" />
              <p className="font-semibold text-foreground">Chưa có lớp học nào</p>
              <p className="text-xs text-muted-foreground/80">
                Môn học này hiện chưa có lớp học nào được mở. Hãy thử chọn môn khác nhé!
              </p>
            </div>
          ) : (
            <div className="overflow-x-hidden [&::-webkit-scrollbar]:hidden">
              <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                  rows === 2 ? "grid-rows-2" : "grid-rows-1"
                }`}
              >
                {filteredClasses.map((item) => (
                  <Link
                    key={item.id}
                    href={`/classes/${item.slug}`}
                    className="group relative h-[130px] sm:h-[140px] overflow-hidden rounded-2xl transition-all hover:shadow-lg hover:shadow-primary/10 bg-gray-900 border border-white/10 hover:border-primary/50"
                  >
                    {/* Ảnh nền chuẩn HTML img */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Lớp phủ Gradient mờ tối */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

                    {/* Nội dung Tên lớp học */}
                    <div className="absolute inset-0 flex items-end justify-start p-3 md:p-4">
                      <h3 className="text-white text-xs sm:text-sm md:text-base font-bold leading-snug drop-shadow-md transition-colors group-hover:text-primary line-clamp-2">
                        {item.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* LINK XEM THÊM BÊN DƯỚI */}
          <div className="mt-6 flex justify-end pt-3 border-t border-white/5">
            <Link
              href={viewAllHref}
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
            >
              <span>Xem tất cả lớp học môn này</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

function CategoryTab({
  iconSlot,
  label,
  active,
  onClick,
}: {
  iconSlot?: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex flex-col items-center gap-2 pb-2.5 transition flex-shrink-0 w-32 md:w-28 cursor-pointer select-none group ${
        active
          ? "text-primary font-bold"
          : "text-muted-foreground hover:text-foreground font-medium"
      }`}
    >
      <div
        className={`flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all duration-300 shadow-sm ${
          active
            ? "bg-primary text-white shadow-primary/30 scale-105"
            : "bg-white/5 text-muted-foreground group-hover:bg-white/10 group-hover:text-foreground group-hover:scale-105"
        }`}
      >
        {iconSlot}
      </div>

      <div className="h-5 w-full flex items-center justify-center px-1">
        <span className="text-xs sm:text-[13px] text-center whitespace-nowrap leading-tight">
          {label}
        </span>
      </div>

      {/* Thanh gạch chân khi Active */}
      <span
        className={`absolute bottom-0 h-[2.5px] w-10 sm:w-14 rounded-full bg-primary transition-all duration-300 ${
          active ? "opacity-100 scale-100" : "opacity-0 scale-0"
        }`}
      />
    </button>
  );
}