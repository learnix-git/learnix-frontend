import React from "react";
import { Lightbulb, HelpCircle, PhoneCall, CheckCircle2, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const REQUEST_TIPS = [
  {
    title: "Tiêu đề rõ ràng",
    desc: "Nêu rõ môn học, khối lớp và khu vực để gia sư phù hợp dễ tìm thấy bài đăng của bạn.",
  },
  {
    title: "Mô tả chi tiết",
    desc: "Nói rõ mục tiêu học tập, tình trạng học lực hiện tại và yêu cầu với gia sư.",
  },
  {
    title: "Học phí hợp lý",
    desc: "Mức học phí sát thị trường sẽ thu hút nhiều gia sư chất lượng liên hệ hơn.",
  },
  {
    title: "Phản hồi nhanh",
    desc: "Thường xuyên kiểm tra thông báo để trao đổi kịp thời với các gia sư ứng tuyển.",
  },
];

const GUARANTEES = [
  "Gia sư xác minh danh tính & bằng cấp",
  "Đánh giá trung thực từ học sinh thực",
  "Miễn phí đăng bài, không phí môi giới",
];

export function RequestTips({ onContactSupport }: { onContactSupport: () => void }) {
  return (
    <>
      {/* Mẹo tìm gia sư */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Lightbulb className="h-5 w-5 text-primary" />
          Mẹo tìm gia sư hiệu quả
        </div>
        <ul className="space-y-3">
          {REQUEST_TIPS.map((tip) => (
            <li key={tip.title} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="text-[13px] font-semibold text-foreground">{tip.title}</p>
                <p className="text-[13px] text-muted-foreground">{tip.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Cam kết chất lượng */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Star className="h-5 w-5 text-primary" />
          Cam kết của Learnix
        </div>
        <ul className="space-y-2.5">
          {GUARANTEES.map((g) => (
            <li key={g} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-muted-foreground">{g}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* Liên hệ hỗ trợ */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <HelpCircle className="h-5 w-5 text-primary" />
          Cần hỗ trợ?
        </div>
        <p className="text-[13px] text-muted-foreground">
          Gặp khó khăn khi đăng bài? Đội ngũ hỗ trợ luôn sẵn sàng giúp bạn.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onContactSupport}
          className="w-full rounded-2xl h-11 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 font-bold text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <PhoneCall className="h-4 w-4 mr-1.5" />
          Liên hệ hỗ trợ
        </Button>
      </Card>
    </>
  );
}
