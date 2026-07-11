// * Accept * //

"use client";

import { useState } from 'react';
import {
  IconUsers,
  IconRocket,
  IconShieldCheck,
  IconTarget,
  IconHeartHandshake,
  IconChevronDown,
  IconStarFilled,
  IconQuote,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconCircleNumber4,
  IconSchool,
  IconBook2,
  IconCertificate,
  IconBuildingBank,
  IconWorld,
  IconLock,
  IconBolt,
} from '@tabler/icons-react';

import { FeaturePill } from '@/components/about/AboutFeature';
import { StatCard } from '@/components/about/AboutStat';

const STATS = [
  { label: 'Học sinh & Phụ huynh', value: '10,000+', icon: IconUsers },
  { label: 'Giáo viên & Gia sư', value: '8,000+', icon: IconSchool },
  { label: 'Tài liệu chất lượng', value: '3,500+', icon: IconBook2 },
  { label: 'Khóa học chât lượng', value: '120k+', icon: IconCertificate },
];

const CORE_VALUES = [
  { title: 'Minh bạch', desc: 'Dòng tiền xử lý qua Escrow, công khai rõ ràng.', icon: IconShieldCheck },
  { title: 'Tốc độ', desc: 'Kết nối đúng giáo viên, đúng gia sư chỉ trong vài giờ.', icon: IconRocket },
  { title: 'Chất lượng', desc: 'Hệ thống đánh giá giáo viên và gia sư nghiêm ngặt.', icon: IconTarget },
  { title: 'Hỗ trợ', desc: 'Đội ngũ CSKH sẵn sàng 24/7 đồng hành cùng bạn.', icon: IconHeartHandshake },
];

const PARTNERS = [
  { icon: IconSchool, label: "Học tập" },
  { icon: IconCertificate, label: "Giảng dạy" },
  { icon: IconBuildingBank, label: "Chia sẻ" },
  { icon: IconWorld, label: "Kết nối" },
];

const REVIEWS = [
  {
    content: 'Learnix giúp tôi yên tâm nhận lớp dạy kèm mới. Tiền cọc được hệ thống giữ minh bạch, chỉ giải ngân khi phụ huynh xác nhận chất lượng sau tháng đầu.',
    author: 'Cô Thu Hà',
    role: 'Gia sư Toán - Lý',
    rating: 5,
  },
  {
    content: 'Con tôi đăng ký khóa luyện thi trực tuyến trên Learnix, xem lại bài giảng thoải mái và theo dõi tiến độ học rất rõ ràng. Thanh toán qua VNPAY cũng rất nhanh gọn.',
    author: 'Anh Quốc Bảo',
    role: 'Phụ huynh học sinh lớp 12',
    rating: 5,
  },
];

const STEPS = [
  { title: 'Tạo hồ sơ', desc: 'Đăng ký tài khoản Giáo viên/Gia sư để đăng khóa học, hoặc tài khoản Học sinh để bắt đầu tìm lớp', icon: IconCircleNumber1 },
  { title: 'Kết nối', desc: 'Mua khóa học trực tuyến có sẵn, hoặc đăng kí học trực tiếp với gia sư qua nền tảng', icon: IconCircleNumber2 },
  { title: 'Học tập', desc: 'Học mọi lúc mọi nơi với khóa học online, hoặc tham gia buổi học 1-1/lớp học thêm trực tiếp', icon: IconCircleNumber3 },
  { title: 'Thanh toán', desc: 'Học phí được xử lý an toàn với cơ chế Escrow, chỉ giải ngân cho giáo viên khi buổi học được xác nhận hoàn thành.', icon: IconCircleNumber4 },
];

const FAQS = [
  {
    q: 'Chưa có nội dung',
    a: 'Chưa có nội dung',
  },
  {
    q: 'Chưa có nội dung',
    a: 'Chưa có nội dung',
  },
  {
    q: 'Chưa có nội dung',
    a: 'Chưa có nội dung',
  },
];

const AboutPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white font-sans">
      {/* Background Pattern Grid */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]" />

      {/* Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 z-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />

      {/* HERO */}
      <section className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/*  Tin cậy */}
        <div className="hidden lg:block absolute top-18 left-[5%] xl:left-[12%] z-30 animate-[pulse_4s_ease-in-out_infinite] transition-transform duration-500 hover:-translate-y-2 hover:scale-105">
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/70 p-3 shadow-xl shadow-primary/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/70">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <IconLock size={20} />
            </div>
            <div className="pr-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Tin cậy</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Thanh toán an toàn, người thật việc thật</p>
            </div>
          </div>
        </div>

        {/* Linh hoạt */}
        <div className="hidden lg:block absolute top-40 right-[2%] xl:right-[7%] z-30 animate-[pulse_5s_ease-in-out_infinite] transition-transform duration-500 hover:-translate-y-2 hover:scale-105">
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/70 p-3 shadow-xl shadow-primary/5 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/70">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <IconBolt size={20} />
            </div>
            <div className="pr-2">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Linh hoạt</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hỗ trợ học tập và giảng dạy mọi lúc, mọi nơi</p>
            </div>
          </div>
        </div>

        {/* Chất lượng */}
        <div className="hidden lg:flex absolute bottom-[48%] xl:bottom-[40%] left-[5%] xl:left-[8%] z-30 animate-[pulse_6s_ease-in-out_infinite] items-center gap-3 rounded-[1.5rem] border border-white/60 bg-white/70 p-3 shadow-xl shadow-primary/5 backdrop-blur-md transition-transform duration-500 hover:-translate-y-2 hover:scale-105 dark:border-white/10 dark:bg-slate-800/70">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <IconCertificate size={20} />
          </div>
          <div className="pr-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Chất lượng</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Nâng tầm trải nghiệm học tập và giảng dạy</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-center relative z-20">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.3em] text-primary shadow-[0_0_20px_rgba(var(--color-primary),0.2)]">
            Nền tảng kết nối học sinh và giáo viên
          </div>
          <h1 className="mt-8 text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl lg:text-7xl leading-[1.1]">
            Học tập bứt phá, <br className="hidden md:block" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500">Kết nối không giới hạn.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Learnix mang trải nghiệm học tập & giảng dạy lên tầm cao mới với các khóa học chất lượng và giáo viên tận tâm.
          </p>
        </div>

        {/* BENTO GRID STATS */}
        <div className="mx-auto mt-32 max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-20">
          {STATS.map((stat, i) => (
            <StatCard
              key={i}
              value={stat.value}
              label={stat.label}
              icon={<stat.icon size={24} />}
            />
          ))}
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section className="py-8 px-4 lg:px-8 mb-20 relative z-10">
        <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-white/60 bg-white/60 p-6 md:p-8 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 text-center md:text-left whitespace-nowrap">
            Giải pháp toàn diện cho
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-12 opacity-50 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0">
            {PARTNERS.map(({ icon: Icon, label }, i) => (
            <div key={i} className="group relative flex justify-center">
              <Icon
                size={40}
                stroke={1.5}
                className="text-slate-600 opacity-50 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
              />
              <span className="absolute -bottom-8 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-1">
                {label}
              </span>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZIG-ZAG JOURNEY SECTION */}
      <section className="relative pb-32 px-4 lg:px-8 bg-transparent z-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-24">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-black mb-4">Hành trình sử dụng</p>
            <h2 className="text-4xl font-black text-slate-950 dark:text-white md:text-5xl">4 bước để bắt đầu với Learnix</h2>
          </div>

          <div className="relative">

            {/* Đường gạch đứt dọc */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0 -translate-x-1/2 border-l-[4px] border-dashed border-primary/40 dark:border-primary/60" />

            <div className="space-y-16 md:space-y-24">
              {STEPS.map((step, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div key={i} className={`relative flex flex-col md:flex-row items-center justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block w-5/12" />

                    {/* Node */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-20 w-20 items-center justify-center rounded-full border-[6px] border-slate-50 bg-white shadow-[0_0_30px_rgba(var(--color-primary),0.4)] dark:border-slate-950 dark:bg-slate-900">
                      <step.icon size={36} className="text-primary" />
                    </div>

                    {/* Thẻ Nội Dung */}
                    <div className="w-full md:w-5/12">
                      <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 sm:p-10 shadow-2xl shadow-slate-200/50 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:shadow-primary/20 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
                        
                        <div className="md:hidden mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <step.icon size={32} />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl font-black text-primary/30 dark:text-primary/60">0{i + 1}</span>
                          <h3 className="text-2xl font-black text-slate-950 dark:text-white">{step.title}</h3>
                        </div>
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="relative z-10 pb-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl bg-white/60 backdrop-blur-xl dark:bg-slate-900/40 rounded-[3rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white md:text-4xl">Trải nghiệm học tập & giảng dạy premium.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {CORE_VALUES.map((value, i) => (
              <FeaturePill
                key={i}
                icon={<value.icon size={24} />}
                title={value.title}
                copy={value.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 pb-24 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl bg-white/40 dark:bg-slate-900/40 rounded-[3rem] p-8 md:p-16 border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none backdrop-blur-xl">
          <div className="grid gap-16 md:grid-cols-3 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-primary">
                Lắng nghe cộng đồng
              </div>
              <IconQuote size={56} className="text-primary opacity-50" />
              <h2 className="text-4xl font-black text-slate-950 dark:text-white leading-tight">Khi trải nghiệm tạo nên sự tin tưởng.</h2>
              <p className="max-w-xl text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Learnix tự hào là cầu nối vững chắc, giúp giáo viên, gia sư và học sinh xây dựng môi trường giáo dục an toàn và hiệu quả.
              </p>
            </div>
            <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
              {REVIEWS.map((rev, i) => (
                <div key={i} className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-800/80 dark:shadow-none backdrop-blur-md">
                  <div className="flex gap-1 mb-6 text-amber-400">
                    {[...Array(rev.rating)].map((_, starIndex) => (
                      <IconStarFilled key={starIndex} size={20} />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed font-medium">“{rev.content}”</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-950 dark:text-white">{rev.author}</div>
                      <div className="text-xs uppercase tracking-widest text-primary font-bold mt-1">{rev.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQS */}
      <section className="relative z-10 py-12 px-4 lg:px-8 mb-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-black text-slate-950 dark:text-white md:text-4xl mb-16">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-sm backdrop-blur-md transition-all dark:border-white/10 dark:bg-slate-900/60">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left text-slate-950 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span className="font-bold text-lg pr-8">{faq.q}</span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-primary text-white' : ''}`}>
                    <IconChevronDown size={20} />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="border-t border-slate-100 dark:border-white/10 px-6 pb-8 pt-6 text-base leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-transparent">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 pb-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-primary/5 dark:bg-primary/10 px-6 py-20 text-center shadow-xl shadow-primary/5 sm:px-12 border border-primary/20 backdrop-blur-xl">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
          
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-black mb-6">Sẵn sàng tiến bước</p>
            <h2 className="text-4xl font-black text-slate-950 dark:text-white md:text-5xl lg:text-6xl">Bạn đã sẵn sàng bứt phá?</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Khám phá Learnix và biến mục tiêu của bạn thành kết quả thực sự.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="rounded-full bg-primary px-10 py-5 text-sm font-black text-white shadow-xl shadow-primary/30 transition hover:scale-105 active:scale-95">
                Bắt đầu học ngay
              </button>
              <button className="rounded-full border-2 border-primary/20 bg-white/50 dark:bg-slate-900/50 px-10 py-5 text-sm font-black text-slate-900 dark:text-white backdrop-blur-sm transition hover:bg-primary/10 hover:border-primary/40 active:scale-95">
                Trở thành giáo viên
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;