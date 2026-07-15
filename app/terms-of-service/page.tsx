"use client";

import type { ReactNode } from "react";
import { BreadcrumbComponent } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import {
  Info, UserCog, Wallet, Copyright, ShieldAlert,
  ScrollText, ListChecks,
} from "lucide-react";

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
    id: "gioi-thieu",
    title: "Giới thiệu",
    icon: Info,
    body: (
      <p className="m-0 text-muted-foreground">
        Chào mừng bạn đến với Learnix. Bằng việc đăng ký tài khoản và sử dụng nền tảng học tập của chúng tôi,
        bạn xác nhận rằng mình đã đọc, hiểu và đồng ý với các quy định dưới đây. Các điều khoản này thiết lập
        mối quan hệ pháp lý giữa bạn và Learnix trong quá trình sử dụng dịch vụ.
      </p>
    ),
  },
  {
    id: "quy-dinh-tai-khoan",
    title: "Quy định tài khoản",
    icon: UserCog,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Mỗi người dùng chịu trách nhiệm quản lý thông tin tài khoản cá nhân. Việc duy trì tính bảo mật cho
          mật khẩu và các thông tin truy cập là nghĩa vụ của người dùng.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li>Người dùng phải đảm bảo thông tin cá nhân cung cấp là chính xác và trung thực.</Li>
          <Li>Nghiêm cấm hành vi chuyển nhượng, cho thuê hoặc bán tài khoản cho bên thứ ba.</Li>
          <Li>Learnix có quyền tạm khóa hoặc xóa vĩnh viễn tài khoản nếu phát hiện dấu hiệu gian lận hoặc vi phạm quy tắc cộng đồng.</Li>
        </ul>
      </>
    ),
  },
  {
    id: "thanh-toan",
    title: "Dịch vụ và thanh toán",
    icon: Wallet,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Việc đăng ký tham gia các lớp học được thực hiện thông qua hệ thống thanh toán tích hợp trên Learnix.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li>Thanh toán được xử lý qua VNPay hoặc các cổng thanh toán được hỗ trợ.</Li>
          <Li>Học phí được hiển thị rõ ràng tại từng lớp học và chưa bao gồm các loại thuế phí bổ sung (nếu có).</Li>
          <Li>Mọi giao dịch thanh toán là tự nguyện và hoàn tất ngay khi xác nhận đặt chỗ thành công.</Li>
          <Li>Chính sách hoàn tiền chỉ được xem xét trong trường hợp lớp học bị hủy bởi giảng viên hoặc các sự cố kỹ thuật từ phía hệ thống Learnix.</Li>
        </ul>
      </>
    ),
  },
  {
    id: "so-huu-tri-tue",
    title: "Quyền sở hữu trí tuệ",
    icon: Copyright,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Mọi tài liệu, bài giảng, video và nội dung xuất hiện trên Learnix thuộc quyền sở hữu trí tuệ của nền tảng
          hoặc giảng viên sở hữu lớp học đó.
        </p>
        <p className="m-0 text-muted-foreground">
          Người dùng không được phép sao chép, phân phối hoặc sử dụng trái phép bất kỳ nội dung nào vì mục đích thương mại
          khi chưa được sự cho phép bằng văn bản từ chủ sở hữu.
        </p>
      </>
    ),
  },
  {
    id: "hanh-vi-bi-cam",
    title: "Hành vi bị cấm",
    icon: ShieldAlert,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Để duy trì môi trường học tập lành mạnh, Learnix nghiêm cấm người dùng thực hiện các hành vi sau:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <Li>Sử dụng ngôn từ xúc phạm, đe dọa hoặc quấy rối giảng viên và các học viên khác.</Li>
          <Li>Phát tán các phần mềm độc hại, virus hoặc thực hiện các hoạt động tấn công kỹ thuật nhằm vào hệ thống.</Li>
          <Li>Quảng bá các dịch vụ, trang web hoặc nội dung không liên quan đến mục đích học tập tại các khu vực lớp học và khóa học.</Li>
        </ul>
      </>
    ),
  },
  {
    id: "gioi-han-trach-nhiem",
    title: "Giới hạn trách nhiệm",
    icon: ScrollText,
    body: (
      <>
        <p className="m-0 mb-3 text-muted-foreground">
          Learnix đóng vai trò là cầu nối cung cấp không gian học tập. Chúng tôi không đảm bảo 100% kết quả đầu ra
          của học viên sau khóa học do hiệu quả phụ thuộc vào sự nỗ lực cá nhân.
        </p>
        <p className="m-0 text-muted-foreground">
          Chúng tôi không chịu trách nhiệm đối với các nội dung do giảng viên đăng tải, tuy nhiên chúng tôi sẽ nỗ lực
          hết sức để kiểm duyệt các nội dung vi phạm tiêu chuẩn đạo đức.
        </p>
      </>
    ),
  },
  {
    id: "hieu-luc",
    title: "Hiệu lực điều khoản",
    icon: Info,
    body: (
      <p className="m-0 text-muted-foreground">
        Learnix bảo lưu quyền chỉnh sửa hoặc thay thế các điều khoản này theo yêu cầu quản lý. Việc bạn tiếp tục
        sử dụng dịch vụ sau khi có thông báo về sự thay đổi đồng nghĩa với việc bạn chấp thuận các điều kiện mới.
      </p>
    ),
  },
];

export default function TermsOfServicePage() {
  const pathList = [
    { name: "Trang chủ", href: "/" },
    { name: "Điều khoản dịch vụ", href: "/dieu-khoan-dich-vu" },
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
            <h1 className="m-0 text-2xl md:text-3xl font-black tracking-tight text-foreground">Điều khoản dịch vụ</h1>
            <p className="m-0 mt-1 text-[13px] text-muted-foreground">Cập nhật lần cuối: 11/07/2026</p>
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