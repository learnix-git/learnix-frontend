import React from "react";
import { Lightbulb, HelpCircle, PhoneCall } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Danh sách các mẹo đăng bài hiệu quả
const POST_TIPS = [
  {
    title: "Tiêu đề rõ ràng",
    desc: "Nêu rõ môn dạy và cấp học để phụ huynh hiểu ngay bài đăng của bạn.",
  },
  {
    title: "Mô tả chi tiết",
    desc: "Nói rõ phương pháp dạy, kinh nghiệm và cam kết đầu ra bạn có thể mang lại.",
  },
  {
    title: "Học phí hợp lý",
    desc: "Khoảng học phí phù hợp với thị trường sẽ thu hút nhiều học sinh liên hệ hơn.",
  },
];

export function PostTips({ onContactSupport }: { onContactSupport: () => void }) {
  return (
    <>
      {/* Khung gợi ý mẹo đăng bài */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Lightbulb className="h-5 w-5 text-primary" />
          Mẹo đăng bài hiệu quả
        </div>
        <ul className="space-y-3">
          {POST_TIPS.map((tip) => (
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

      {/* Khung liên hệ hỗ trợ */}
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
