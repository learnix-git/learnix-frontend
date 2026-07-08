"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import {
  BadgeCheck,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  Search,
  Star,
  Users,
} from "lucide-react";

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">

        {/* STUDENT CARD */}
        <div
          className="
            relative overflow-hidden
            rounded-3xl
            border border-border
            bg-card
          "
        >
          {/* background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)_0%,transparent_45%)] opacity-10" />

          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT - TEXT CONTENT */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary mb-3 sm:mb-4">
                Dành cho học sinh
              </p>

              <h2
                className="
                  text-xl sm:text-2xl lg:text-3xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-foreground
                "
              >
                Học tập chủ động, bứt phá điểm số cùng Learnix
              </h2>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xl">
                Kết nối với hàng ngàn giáo viên giỏi, tham gia các lớp học tương tác và luyện tập với ngân hàng tài liệu chất lượng.
              </p>

              {/* FEATURES */}
              <div className="mt-8 sm:mt-10 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 sm:mb-2">
                    Tìm lớp học nhanh chóng
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Dễ dàng tìm kiếm lớp học phù hợp với năng lực và mục tiêu điểm số của bạn.
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 sm:mb-2">
                    Nguồn tài liệu đa dạng
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Tiếp cận kho tài liệu học tập phong phú, được cập nhật thường xuyên, giúp bạn ôn luyện và nâng cao kiến thức hiệu quả.
                  </p>
                </div>
              </div>

              {/* BUTTON */}
              <div className="mt-8 sm:mt-10">
                <Link
                  href="/signup"
                  className="
                    inline-flex items-center justify-center
                    w-full sm:w-auto
                    rounded-2xl
                    bg-primary
                    px-7 py-3
                    text-sm font-semibold
                    text-on-primary
                    shadow-lg shadow-primary/20
                    transition-all duration-200
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    hover:bg-primary/90
                  "
                >
                  Bắt đầu học ngay
                </Link>
              </div>
            </div>

            {/* RIGHT - STUDENT APP MOCKUP */}
            <div
              className="
                relative
                border-t lg:border-t-0 lg:border-l border-border
                bg-[linear-gradient(to_bottom_right,var(--color-background),transparent)]
                p-6 sm:p-10 lg:p-12
                flex items-center justify-center
              "
            >
              <StudentSearchMockup />
            </div>
          </div>
        </div>

        {/* TEACHER CARD */}
        <div
          className="
            relative overflow-hidden
            rounded-3xl
            border border-border
            bg-background
          "
        >
          {/* Purple glows */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-primary)_0%,transparent_70%)] opacity-25" />
          <div className="absolute -top-52 -left-52 h-[600px] sm:h-[900px] w-[600px] sm:w-[900px] rounded-full bg-primary/25 blur-[100px] sm:blur-[140px]" />
          <div className="absolute bottom-[-250px] right-[-200px] h-[500px] sm:h-[700px] w-[500px] sm:w-[700px] rounded-full bg-primary/10 blur-[100px] sm:blur-[140px]" />

          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT - TEACHER DASHBOARD MOCKUP */}
            <div className="relative p-6 sm:p-10 lg:p-12 flex items-center justify-center order-last lg:order-first">
              <TeacherDashboardMockup />
            </div>

            {/* RIGHT - TEXT CONTENT */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-16 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary mb-3 sm:mb-4">
                Dành cho giáo viên
              </p>

              <h2
                className="
                  text-xl sm:text-2xl lg:text-3xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-foreground
                "
              >
                Quản lý giảng dạy hiệu quả
              </h2>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-xl">
                Số hóa toàn bộ quy trình giảng dạy, tự động hóa việc giao bài, chấm điểm và dễ dàng kết nối với học sinh trên toàn quốc.
              </p>

              {/* LIST */}
              <ul className="mt-8 sm:mt-10 space-y-4 sm:space-y-5">
                {[
                  "Mở lớp học và tuyển sinh học viên dễ dàng",
                  "Xây dựng ngân hàng câu hỏi và đề thi chuyên nghiệp",
                  "Theo dõi tiến độ học tập và đánh giá kết quả chính xác",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div
                      className="
                        mt-1 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-primary/10
                      "
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* BUTTON */}
              <div className="mt-8 sm:mt-10">
                <Link
                  href="/signup?role=teacher"
                  className="
                    inline-flex items-center justify-center
                    w-full sm:w-auto
                    rounded-2xl
                    bg-primary
                    px-7 py-3
                    text-sm font-semibold
                    text-on-primary
                    shadow-xl shadow-primary/20
                    transition-all duration-200
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    hover:bg-primary/90
                  "
                >
                  Trở thành Giáo viên
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

function StudentSearchMockup() {
  const results = [
    {
      name: "Thầy Hữu Thọ",
      title: "Chuyên Toán · 10 năm KN",
      rate: "500.000 ₫/tháng",
      skills: ["Toán 12", "Toán 11", "Toán 10"],
      verified: true,
    },
    {
      name: "Cô Mai Anh",
      title: "Chuyên IELTS · 6 năm KN",
      rate: "1.200.000 ₫/khóa",
      skills: ["IELTS", "Speaking", "Writing"],
      verified: true,
    },
  ];

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Search bar */}
      <div className="p-3 border-b border-border bg-background/50">
        <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs sm:text-sm text-muted-foreground truncate">
            Toán, IELTS...
          </span>
        </div>
      </div>

      {/* Result rows */}
      <ul className="divide-y divide-border">
        {results.map((r) => (
          <li key={r.name} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
            <Avatar
              size="md"
              alt={r.name}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[13px] sm:text-sm font-bold text-foreground truncate">
                  {r.name}
                </span>
                {r.verified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {r.title}
              </p>
              <div className="flex flex-wrap gap-1">
                {r.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] sm:text-xs font-bold text-foreground whitespace-nowrap">
                {r.rate}
              </p>
              <p className="text-[10px] text-muted-foreground">Học phí</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeacherDashboardMockup() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header: avatar + name */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center gap-3">
        <Avatar
          size="lg"
          alt="Thầy Hữu Thọ"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-bold text-foreground truncate">
              Thầy Hữu Thọ
            </span>
            <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
            Giáo viên chuyên toán
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-foreground">4.9</span>
            <span className="text-muted-foreground"> - 136 đánh giá</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="p-3 sm:p-4 text-center">
          <Users className="h-4 w-4 text-primary mx-auto" />
          <p className="mt-1 text-sm sm:text-base font-extrabold text-foreground">
            156
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Học sinh</p>
        </div>
        <div className="p-3 sm:p-4 text-center">
          <BookOpen className="h-4 w-4 text-primary mx-auto" />
          <p className="mt-1 text-sm sm:text-base font-extrabold text-foreground">
            8
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Lớp học</p>
        </div>
        <div className="p-3 sm:p-4 text-center">
          <FileText className="h-4 w-4 text-primary mx-auto" />
          <p className="mt-1 text-sm sm:text-base font-extrabold text-foreground">
            45
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Tài liệu</p>
        </div>
      </div>

      {/* Activity row */}
      <div className="p-3 sm:p-4 space-y-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Hoạt động gần đây
        </p>
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40">
          <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] sm:text-xs font-semibold text-foreground truncate">
              Đã phát hành tài liệu ôn tập toán các cấp
            </p>
            <p className="text-[10px] text-muted-foreground">30 phút trước</p>
          </div>
        </div>
      </div>
    </div>
  );
}