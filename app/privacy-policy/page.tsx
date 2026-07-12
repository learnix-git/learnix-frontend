"use client";

import type { ReactNode } from "react";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import {
  Database, Settings2, Share2, ShieldCheck,
  UserCheck, Cookie, RefreshCw, Mail, ListChecks,
} from "lucide-react";

// ! Bullet chấm tròn màu primary thay cho list-disc mặc định, đồng bộ phong cách Learnix
function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}

const SECTIONS = [
  {
    id: "thu-thap-thong-tin",
    title: "Thu thập thông tin",
    icon: Database,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Learnix thu thập thông tin cá nhân để cung cấp và cải thiện trải nghiệm học tập cho cả học sinh, phụ huynh và giáo viên.
          Thông tin này bao gồm:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li><strong className="text-foreground">Thông tin đăng ký:</strong> Tên, email, mật khẩu</Li>
          <Li><strong className="text-foreground">Thông tin hồ sơ:</strong> Ảnh đại diện, trình độ học vấn và chứng chỉ giảng dạy (đối với GV/GS), khối lớp (đối với HS)</Li>
          <Li><strong className="text-foreground">Thông tin giao dịch:</strong> Lịch sử thanh toán học phí, thông tin xử lý qua cổng thanh toán VNPAY</Li>
          <Li><strong className="text-foreground">Dữ liệu sử dụng:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập, lịch sử học tập và tiến độ khóa học</Li>
        </ul>
      </>
    ),
  },
  {
    id: "cach-su-dung",
    title: "Cách sử dụng thông tin",
    icon: Settings2,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li>Cung cấp, duy trì và cải thiện chất lượng dịch vụ của Learnix</Li>
          <Li>Xử lý giao dịch học phí và gửi thông báo liên quan đến tài khoản</Li>
          <Li>Kết nối học sinh, phụ huynh với giáo viên và gia sư phù hợp</Li>
          <Li>Ngăn chặn gian lận và đảm bảo an toàn cho cơ chế bảo hiểm tài chính (Escrow) trên nền tảng</Li>
          <Li>Gửi email nhắc lịch học, thông báo bài tập, và các nội dung tiếp thị nếu bạn cho phép</Li>
        </ul>
      </>
    ),
  },
  {
    id: "chia-se-thong-tin",
    title: "Chia sẻ thông tin",
    icon: Share2,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Chúng tôi không bán thông tin cá nhân của bạn. Thông tin có thể được chia sẻ trong các trường hợp sau:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li><strong className="text-foreground">Với giáo viên và gia sư:</strong> Thông tin cần thiết để tổ chức buổi học như tên, phương thức liên lạc, lịch học</Li>
          <Li><strong className="text-foreground">Với nhà cung cấp dịch vụ:</strong> VNPAY để xử lý thanh toán học phí</Li>
          <Li><strong className="text-foreground">Theo yêu cầu pháp luật:</strong> Khi được cơ quan có thẩm quyền yêu cầu</Li>
        </ul>
      </>
    ),
  },
  {
    id: "bao-mat-du-lieu",
    title: "Bảo mật dữ liệu",
    icon: ShieldCheck,
    body: (
      <p className="m-0 text-muted-foreground">
        Chúng tôi cam kết bảo vệ thông tin của bạn bằng các biện pháp bảo mật phù hợp,
        bao gồm mã hóa dữ liệu, tường lửa và giới hạn quyền truy cập. Tuy nhiên,
        không có phương pháp truyền tải qua internet hay lưu trữ điện tử nào là hoàn toàn an toàn.
      </p>
    ),
  },
  {
    id: "quyen-nguoi-dung",
    title: "Quyền của người dùng",
    icon: UserCheck,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Bạn có các quyền sau đối với thông tin cá nhân của mình:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li>Truy cập và xem thông tin cá nhân đã lưu trữ</Li>
          <Li>Yêu cầu chỉnh sửa thông tin không chính xác</Li>
          <Li>Yêu cầu xóa tài khoản và dữ liệu liên quan</Li>
          <Li>Rút lại sự đồng ý cho các hoạt động tiếp thị</Li>
          <Li>Khiếu nại với cơ quan bảo vệ dữ liệu</Li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    icon: Cookie,
    body: (
      <p className="m-0 text-muted-foreground">
        Chúng tôi sử dụng cookies và các công nghệ tương tự để cải thiện trải nghiệm học tập của bạn.
        Cookies giúp chúng tôi ghi nhớ sở thích, phân tích lưu lượng truy cập và cá nhân hóa nội dung học tập.
        Bạn có thể từ chối cookies qua cài đặt trình duyệt.
      </p>
    ),
  },
  {
    id: "thay-doi-chinh-sach",
    title: "Thay đổi chính sách",
    icon: RefreshCw,
    body: (
      <p className="m-0 text-muted-foreground">
        Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Thay đổi sẽ được
        thông báo qua email hoặc thông báo trên nền tảng trước khi có hiệu lực.
      </p>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    icon: Mail,
    body: (
      <p className="m-0 text-muted-foreground">
        Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email:{" "}
        <span className="font-bold text-primary">support@learnix.vn</span>
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  const pathList = [
    { name: "Trang chủ", href: "/" },
    { name: "Chính sách bảo mật", href: "/privacy-policy" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="bg-white/40 dark:bg-white/5 border-b border-white/50 dark:border-white/10 backdrop-blur-xl">
        <div className="max-w-[1100px] mx-auto px-4 py-4">
          <BreadcrumbComponent pathList={pathList} />
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-primary" />
          <div>
            <h1 className="m-0 text-2xl md:text-3xl font-black tracking-tight text-foreground">Chính sách bảo mật</h1>
            <p className="m-0 mt-1 text-[13px] text-muted-foreground">Cập nhật lần cuối: 22/05/2026</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
          <aside className="hidden lg:block lg:sticky lg:top-6">
            <Card className="!p-4 !rounded-3xl">
              <div className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5" /> Mục lục
              </div>
              <nav className="space-y-0.5">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-xl px-2.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {i + 1}. {s.title}
                  </a>
                ))}
              </nav>
            </Card>
          </aside>

          {/* NỘI DUNG */}
          <div className="space-y-5">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card key={s.id} id={s.id} className="!p-5 sm:!p-6 !rounded-3xl scroll-mt-24">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="m-0 text-lg font-black tracking-tight text-foreground">
                      {i + 1}. {s.title}
                    </h2>
                  </div>
                  <div className="text-[14px] leading-relaxed">{s.body}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}