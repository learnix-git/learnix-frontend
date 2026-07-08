import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-background">
      <div
        className="
          relative overflow-hidden
          w-full
          px-6 py-16 sm:py-20 sm:px-10 lg:px-16
          text-center
          bg-primary
          rounded-3xl
        "
      >
        {/* Glow */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18)_0%,transparent_60%)]
          "
        />

        {/* Blur */}
        <div
          className="
            absolute top-1/2 left-1/2
            h-[600px] w-[600px]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-white/10
            blur-3xl
          "
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl">

          <h2
            className="
              text-2xl sm:text-3xl lg:text-4xl
              font-extrabold tracking-tight
              text-on-primary
              leading-snug
            "
          >
            Tham gia cộng đồng Learnix ngay hôm nay
          </h2>

          <p
            className="
              mx-auto mt-4 max-w-2xl
              text-sm sm:text-base
              leading-relaxed
              text-on-primary/85
            "
          >
            Cùng hàng ngàn giáo viên và học sinh kết nối trên Learnix để biến việc học tập thành trải nghiệm thực tế và thú vị.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              href="/signup"
              className="
                inline-flex items-center justify-center
                rounded-2xl
                bg-white
                px-7 py-3
                text-sm font-semibold
                text-primary
                shadow-lg shadow-black/10
                transition-all duration-200
                hover:scale-[1.02]
                active:scale-[0.98]
                hover:bg-white/90
              "
            >
              Bắt đầu miễn phí
            </Link>

            <Link
              href="/signin"
              className="
                inline-flex items-center justify-center
                rounded-2xl
                border border-white/40
                bg-white/5
                backdrop-blur-md
                px-7 py-3
                text-sm font-semibold
                text-white
                transition-all duration-200
                hover:bg-white/10
                hover:border-white/60
                active:scale-[0.98]
              "
            >
              Khám phá learnix
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}