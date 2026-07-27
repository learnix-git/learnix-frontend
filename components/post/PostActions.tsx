import React from "react";
import { Button } from "@/components/ui/Button";

export function PostActions({
  onCancel,
  submitting,
  formId,
}: {
  onCancel: () => void;
  submitting: boolean;
  formId: string;
}) {
  return (
    // Thanh công cụ hành động (Nằm cố định ở dưới cùng màn hình)
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/10 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] p-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between">
        
        {/* Lời nhắn hiển thị trên màn hình lớn */}
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-foreground">Sẵn sàng đăng bài?</p>
          <p className="text-xs text-muted-foreground">Kiểm tra kỹ thông tin trước khi đăng</p>
        </div>

        {/* Các nút hành động */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Nút hủy bỏ */}
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 sm:flex-none rounded-2xl h-12 px-6 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:bg-white/30 dark:hover:bg-white/10 transition-all font-bold text-xs tracking-widest shadow-sm"
          >
            Hủy bỏ
          </Button>

          {/* Nút đăng bài liên kết với formId */}
          <Button
            size="lg"
            type="submit"
            form={formId}
            loading={submitting}
            className="flex-1 sm:flex-none rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 font-bold text-xs tracking-widest transition-all hover:scale-[1.02]"
          >
            Đăng bài ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
