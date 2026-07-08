"use client";

import {
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  BadgeCheck,
  FileText,
  Search,
  Users,
} from "lucide-react";

export function WhyChoose() {
  return (
    <section className="py-12 sm:py-16 md:py-20 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 lg:space-y-16">

        {/* --- WHY CHOOSE --- */}
        <div
          className="
            relative overflow-hidden
            rounded-2xl sm:rounded-[24px] md:rounded-[28px]
            border border-border
            px-5 py-8
            sm:p-10
            md:p-14
          "
        >
          {/* glow */}
          <div
            className="
              absolute inset-0 pointer-events-none
              bg-[radial-gradient(circle_at_top_left,var(--color-primary)_0%,transparent_55%)]
              opacity-10
            "
          />

          <div className="relative z-10">
            {/* heading */}
            <div className="max-w-4xl space-y-2">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
                Tại sao chọn Learnix
              </p>

              <h2
                className="
                  text-xl sm:text-2xl lg:text-3xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-primary
                "
              >
                Kết nối giáo viên tâm huyết và học sinh năng động, biến mọi lớp học thành hành trình bứt phá
              </h2>
            </div>

            {/* features: Chuyển đổi từ 1 cột cho Mobile sang 3 cột cho PC */}
            <div className="mt-8 sm:mt-10 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">

              {/* item 1 */}
              <div className="flex flex-col items-start">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                  <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-foreground leading-snug">
                  Nâng tầm thương hiệu giáo viên
                </h3>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Công cụ hỗ trợ giáo viên xây dựng uy tín, dễ dàng chia sẻ lớp học, quản lý học sinh và tiếp cận hàng ngàn học viên tiềm năng.
                </p>
              </div>

              {/* item 2 */}
              <div className="flex flex-col items-start">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-foreground leading-snug">
                  Tuyển sinh và quản lý thông minh
                </h3>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Hệ thống hỗ trợ xếp lịch, theo dõi tiến độ, chấm điểm tự động giúp giáo viên tối ưu thời gian và nâng cao hiệu quả giảng dạy.
                </p>
              </div>

              {/* item 3: Trên màn hình tablet (sm) chiếm 2 cột để cân bằng bố cục */}
              <div className="flex flex-col items-start sm:col-span-2 md:col-span-1">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-muted border border-border shrink-0">
                  <FileCheck2 className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                </div>
                <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-foreground leading-snug">
                  Kho học liệu chung phong phú
                </h3>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Nơi giáo viên chia sẻ, xây dựng đề thi trắc nghiệm bám sát chương trình, giúp học sinh có nguồn tài liệu học tập dồi dào.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- STEPS --- */}
        <div
          className="
            relative overflow-hidden
            rounded-2xl sm:rounded-[24px] md:rounded-[28px]
            border border-border
            px-5 py-8
            sm:p-10
            md:p-14
          "
        >
          {/* glow */}
          <div
            className="
              absolute inset-0 pointer-events-none
              bg-[radial-gradient(circle_at_bottom_right,var(--color-primary)_0%,transparent_55%)]
              opacity-10
            "
          />

          <div className="relative z-10">
            <h2
              className="
                max-w-4xl
                text-xl sm:text-2xl lg:text-3xl
                font-extrabold
                leading-tight
                tracking-tight
                text-primary
              "
            >
              Khởi đầu dễ dàng cùng Learnix dù bạn là Giáo viên hay Học sinh
            </h2>

            <div className="mt-8 sm:mt-10 grid gap-y-6 sm:gap-y-8 gap-x-10 md:gap-x-16 grid-cols-1 sm:grid-cols-2">

              {/* step 1 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    1 - Tạo lớp học / Tìm kiếm lớp học
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Giáo viên dễ dàng tạo và quản lý lớp học với đầy đủ thông tin. Học sinh chủ động tìm kiếm lớp học phù hợp theo nhu cầu của mình.
                  </p>
                </div>
              </div>

              {/* step 2 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    2 - Trao đổi chi tiết
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Giáo viên và học sinh kết nối trực tiếp để trao đổi về mục tiêu học tập, yêu cầu đầu vào và các thông tin cần thiết trước khi tham gia lớp học.
                  </p>
                </div>
              </div>

              {/* step 3 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    3 - Giảng dạy & Học tập
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Giáo viên tổ chức kiểm tra, giao bài tập và quản lý kết quả trên một nền tảng duy nhất. Học sinh thực hành với các bài kiểm tra và nhận kết quả ngay sau khi hoàn thành.
                  </p>
                </div>
              </div>

              {/* step 4 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    4 - Đánh giá kết quả
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                    Học sinh nhận bảng phân tích năng lực chi tiết để không ngừng tiến bộ. Giáo viên dễ dàng theo dõi kết quả học tập và điều chỉnh lộ trình giảng dạy phù hợp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- IMAGE GALLERY SECTION --- */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full">

          <div className="md:col-span-2 relative overflow-hidden rounded-xl sm:rounded-[20px] bg-card border border-border aspect-[16/10] md:aspect-auto md:h-full">
            <img
              src="/images/wc-image-1.png"
              className="h-full w-full object-cover block"
            />
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-col gap-4 w-full">

            {/* Ảnh nhỏ phía trên */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-[20px] bg-card border border-border aspect-square md:aspect-[4/3] md:flex-1">
              <img
                src="/images/wc-image-2.png"
                className="h-full w-full object-cover block"
              />
            </div>

            {/* Ảnh nhỏ phía dưới */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-[20px] bg-card border border-border aspect-square md:aspect-[4/3] md:flex-1">
              <img
                src="/images/wc-image-3.png"
                className="h-full w-full object-cover block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}