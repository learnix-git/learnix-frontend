"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  ArrowRight,
  CheckCircle2,
  School,
  Award,
  Bookmark,
  Compass,
} from "lucide-react";

const GRADES = [
  { id: "", label: "Tất cả Lớp học", icon: Sparkles },
  { id: "6", label: "Lớp 6", icon: Compass },
  { id: "7", label: "Lớp 7", icon: BookOpen },
  { id: "8", label: "Lớp 8", icon: Bookmark },
  { id: "9", label: "Lớp 9", icon: Award },
  { id: "10", label: "Lớp 10", icon: School },
  { id: "11", label: "Lớp 11", icon: Users },
  { id: "12", label: "Lớp 12", icon: GraduationCap },
];

interface Classroom {
  id: string;
  name: string;
  code: string;
  grade: string;
  teacher: string;
  students: string;
  image: string;
}

const CLASSROOMS: Classroom[] = [
  { id: "c1",  name: "Toán 12 - Khảo sát hàm số",       code: "TOAN12-A", grade: "12", teacher: "Thầy Hữu Thọ", students: "38/40", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80" },
  { id: "c2",  name: "Ngữ văn 12 - Nghị luận xã hội",   code: "VAN12-B",  grade: "12", teacher: "Cô Thu Trang",   students: "37/40", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80" },
  { id: "c3",  name: "IELTS 6.5+ Speaking & Writing",   code: "ANH12-C",  grade: "12", teacher: "Cô Mai Anh",     students: "36/40", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80" },

  { id: "c4",  name: "Vật lý 11 - Điện trường & Dòng điện", code: "LY11-D",   grade: "11", teacher: "Thầy Đức Lý",   students: "34/40", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80" },
  { id: "c5",  name: "Hóa học 11 - Chuyên đề Hữu cơ",     code: "HOA11-E",  grade: "11", teacher: "Thầy Hoàng Hóa",  students: "35/40", image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80" },

  { id: "c6",  name: "Sinh học 10 - Di truyền & Tế bào",  code: "SINH10-F", grade: "10", teacher: "Cô Vũ Mai",     students: "32/40", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80" },

  { id: "c7",  name: "Toán 9 - Luyện thi vào 10 Chuyên",  code: "TOAN9-A",  grade: "9",  teacher: "Thầy Hữu Thọ", students: "39/40", image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80" },
  { id: "c8",  name: "Tiếng Anh 9 - Bứt phá điểm số",     code: "ANH9-C",   grade: "9",  teacher: "Cô Mai Anh",     students: "33/40", image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80" },

  { id: "c9",  name: "Khoa học Tự nhiên 8 - Nâng cao",    code: "KH8-D",    grade: "8",  teacher: "Thầy Đức Lý",   students: "31/40", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80" },
  { id: "c10", name: "Toán 7 - Hình học trực quan",       code: "TOAN7-A",  grade: "7",  teacher: "Thầy Hữu Thọ", students: "36/40", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80" },
  { id: "c11", name: "Tiếng Anh 6 - Ngữ pháp căn bản",    code: "ANH6-C",   grade: "6",  teacher: "Cô Mai Anh",     students: "30/40", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80" },
];

export function Services() {
  const [activeGrade, setActiveGrade] = useState<string>("");

  const filteredClassrooms = activeGrade
    ? CLASSROOMS.filter((item) => item.grade === activeGrade)
    : CLASSROOMS;

  return (
    <section className="py-12 sm:py-16 md:py-20 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Khối Container dùng bg-card, border-border tự động đổi màu theo theme */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 md:p-12 shadow-xl">
          
          {/* Đèn glow trang trí chuẩn màu Xanh Dương (Primary) & Xanh Da Trời (Sky) */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8 sm:space-y-10">
            
            {/* HEADER CHƯƠNG TRÌNH */}
            <div className="space-y-2 text-left">
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
                Lộ trình học tập
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Khám phá các lớp học phổ biến
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Lựa chọn khối lớp phù hợp từ Cấp 2 đến Cấp 3 để kết nối ngay với giáo viên tâm huyết
              </p>
            </div>

            {/* THANH TAB ICON - CHUẨN XANH DƯƠNG PRIMARY */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar border-b border-border">
              {GRADES.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeGrade === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveGrade(tab.id)}
                    className={`
                      group flex flex-col items-center justify-center gap-2.5 min-w-[100px] sm:min-w-[110px] py-2 px-3 rounded-2xl transition-all duration-300 cursor-pointer select-none
                      ${isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground font-medium"}
                    `}
                  >
                    <div
                      className={`
                        flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl transition-all duration-300 shadow-md
                        ${
                          isActive
                            ? "bg-primary text-white shadow-primary/30 scale-105"
                            : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground group-hover:scale-105"
                        }
                      `}
                    >
                      <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>

                    <span className="text-xs sm:text-sm text-center tracking-tight whitespace-nowrap">
                      {tab.label}
                    </span>

                    {/* Thanh gạch chân màu Primary */}
                    <div
                      className={`h-0.5 w-8 rounded-full transition-all duration-300 ${
                        isActive ? "bg-primary opacity-100" : "bg-transparent opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* KHỐI HIỂN THỊ DỮ LIỆU */}
            {filteredClassrooms.length === 0 ? (
              <div className="rounded-3xl border border-border bg-muted/20 p-12 text-center space-y-2">
                <BookOpen className="h-10 w-10 text-primary/40 mx-auto" />
                <p className="text-base font-bold text-foreground">
                  Chưa có lớp học nào đang tuyển sinh cho khối này
                </p>
                <p className="text-xs text-muted-foreground">
                  Các thầy cô đang chuẩn bị mở lớp mới, bạn vui lòng quay lại sau nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
                {filteredClassrooms.map((item) => (
                  <Link
                    key={item.id}
                    href={`/classes/${item.code}`}
                    className="
                      group relative h-48 sm:h-52 w-full rounded-3xl overflow-hidden border border-border
                      bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5
                    "
                  >
                    {/* Ảnh nền */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Lớp phủ chuyển màu chuẩn Dark/Light Mode */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                    {/* Nội dung chữ ở góc dưới trái */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          {item.students} học sinh
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug group-hover:text-primary transition-colors line-clamp-1">
                        {item.name}
                      </h3>

                      <p className="text-xs text-gray-300 truncate mt-1">
                        GV: <span className="text-white font-medium">{item.teacher}</span>
                      </p>
                    </div>

                    {/* Icon mũi tên góc trên phải */}
                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 border border-white/10">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* FOOTER NÚT XEM THÊM */}
            <div className="flex items-center justify-end pt-4 border-t border-border">
              <Link
                href="/classes"
                className="group inline-flex items-center gap-2 text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors"
              >
                <span>Xem tất cả danh sách lớp học</span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}