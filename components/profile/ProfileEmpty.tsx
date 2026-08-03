"use client";

import { useRouter } from "next/navigation";
import { Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ProfileEmptyProps {
  onCreate: () => void;
}

export function ProfileEmpty({ onCreate }: ProfileEmptyProps) {
  const router = useRouter();

  return (
    <Card className="mx-auto max-w-3xl p-10 text-center space-y-6 shadow-xl">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <Briefcase size={32} />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Chưa có hồ sơ học sinh/phụ huynh
        </h1>
        <p className="mx-auto max-w-md text-slate-500 dark:text-zinc-400 leading-relaxed">
          Hãy tạo hồ sơ chủ dự án để freelancer có thể tìm hiểu về bạn trước
          khi gửi đề xuất cho các dự án sắp tới.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={onCreate}
          className="bg-primary text-white rounded-full px-8 py-6 font-semibold hover:bg-primary/90 shadow-[0_4px_15px_rgba(168,85,247,0.3)] transition-all hover:scale-105"
        >
          <Sparkles size={16} className="mr-2" />
          Tạo hồ sơ ngay
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/dang-tin-du-an")}
          className="rounded-full px-6 py-6 font-semibold"
        >
          Đăng dự án trước
        </Button>
      </div>
    </Card>
  );
}
