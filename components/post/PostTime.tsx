import React from "react";
import { Clock, Shuffle, Calendar } from "lucide-react";
import { Cn } from "@/lib/utils";
import { Slot } from "@/lib/api/types";
import { PostFormData } from "@/app/tutor-post/page";
import { FieldError, TimeScrollPicker } from "@/app/tutor-post/page";

// Danh sách các ngày trong tuần
const DAYS = [
  { value: 1, label: "Thứ 2", short: "T2" },
  { value: 2, label: "Thứ 3", short: "T3" },
  { value: 3, label: "Thứ 4", short: "T4" },
  { value: 4, label: "Thứ 5", short: "T5" },
  { value: 5, label: "Thứ 6", short: "T6" },
  { value: 6, label: "Thứ 7", short: "T7" },
  { value: 0, label: "Chủ nhật", short: "CN" },
];

// Danh sách các buổi học chuẩn
const SLOTS: { value: Slot; label: string; desc: string; defaultStart: string; defaultEnd: string }[] = [
  { value: "MORNING", label: "Buổi Sáng", desc: "Từ 07:00 đến 11:30", defaultStart: "08:00", defaultEnd: "10:00" },
  { value: "AFTERNOON", label: "Buổi Chiều", desc: "Từ 13:30 đến 17:00", defaultStart: "14:00", defaultEnd: "16:00" },
  { value: "EVENING", label: "Buổi Tối", desc: "Từ 17:30 đến 21:30", defaultStart: "18:00", defaultEnd: "20:00" },
];

interface PostTimeProps {
  form: PostFormData;
  errors: Partial<Record<keyof PostFormData, string>>;
  handleUpdate: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
  handleSlotChange: (slot: Slot) => void;
  toggleDay: (day: number) => void;
}

export function PostTime({ form, errors, handleUpdate, handleSlotChange, toggleDay }: PostTimeProps) {
  return (
    <>
      <p className="text-[13px] text-muted-foreground -mt-2">
        Thiết lập lịch dạy để học sinh / phụ huynh tiện theo dõi và sắp xếp
      </p>

      {/* Nút chọn lịch dạy thỏa thuận */}
      <button
        type="button"
        onClick={() => handleUpdate("flexible", !form.flexible)}
        className={Cn(
          "w-full group relative overflow-hidden flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 text-left",
          form.flexible
            ? "border-primary bg-primary/5 shadow-md shadow-primary/5 dark:border-primary/50 dark:bg-primary/10 ring-1 ring-primary/20"
            : "border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 text-foreground hover:border-primary/30 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm"
        )}
      >
        {/* Hiệu ứng nền khi bật lịch thỏa thuận */}
        {form.flexible && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        )}

        <div className="relative flex items-center gap-3.5 z-10 flex-1">
          {/* Icon minh họa */}
          <div className={Cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 shadow-sm",
            form.flexible
              ? "bg-primary text-white shadow-primary/25 scale-105"
              : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700 group-hover:text-primary group-hover:border-primary/20"
          )}>
            <Shuffle className="h-5 w-5" />
          </div>
          {/* Thông tin mô tả lịch thỏa thuận */}
          <div>
            <p className={Cn(
              "text-[14px] font-bold transition-colors",
              form.flexible ? "text-primary dark:text-primary" : "text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"
            )}>
              Lịch dạy thỏa thuận
            </p>
            <p className={Cn(
              "text-[12px] mt-0.5 transition-colors leading-tight",
              form.flexible ? "text-primary/80 font-medium" : "text-slate-500 dark:text-slate-400"
            )}>
              {form.flexible ? "Đang bật — lịch học chưa cố định" : "Đang tắt — lịch học đã được cố định"}
            </p>
          </div>
        </div>

        {/* Nút công tắc (Toggle switch) */}
        <div className={Cn(
          "relative z-10 flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-300",
          form.flexible
            ? "bg-primary"
            : "bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
        )}>
          <div className={Cn(
            "absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 flex items-center justify-center",
            form.flexible ? "translate-x-[22px]" : "translate-x-[2px]"
          )} />
        </div>
      </button>

      {/* Hiển thị chi tiết thiết lập lịch học nếu KHÔNG chọn lịch thỏa thuận */}
      {!form.flexible && (
        <div className="p-5 rounded-2xl border border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/3 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* 1. Chọn Buổi học */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Clock className="h-4 w-4 text-primary" /> 1. Buổi học:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SLOTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleSlotChange(s.value)}
                  className={Cn(
                    "p-3 rounded-xl font-bold text-left transition-all border flex flex-col justify-center",
                    form.slot === s.value
                      ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                      : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-foreground hover:border-primary/40"
                  )}
                >
                  <span className="text-sm">{s.label}</span>
                  <span className={Cn("text-[11px] font-normal mt-0.5", form.slot === s.value ? "text-white/80" : "text-muted-foreground")}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
            <FieldError message={errors.slot} />
          </div>

          {/* 2. Chọn Ngày học */}
          <div id="days">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-primary" /> 2. Ngày học:
              </label>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((d) => {
                const isSelected = form.days.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={Cn(
                      "h-11 rounded-xl font-bold text-xs sm:text-sm transition-all border flex items-center justify-center",
                      isSelected
                        ? "border-primary bg-primary/15 text-primary ring-2 ring-primary/20 font-black"
                        : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.days} />
          </div>

          {/* 3. Chọn Giờ học cụ thể */}
          <div id="endTime" className="pt-2 border-t border-white/20 dark:border-white/10">
            <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3">
              <Clock className="h-4 w-4 text-primary" /> 3. Giờ dạy:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TimeScrollPicker
                label="Bắt đầu:"
                value={form.startTime}
                onChange={(val) => handleUpdate("startTime", val)}
              />
              <TimeScrollPicker
                label="Kết thúc:"
                value={form.endTime}
                onChange={(val) => handleUpdate("endTime", val)}
                error={errors.endTime}
              />
            </div>
          </div>

          {/* Hiển thị tóm tắt lịch đã chọn */}
          <div className="pt-1">
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
              <Calendar className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <span>Lịch dạy: </span>
                <span className="font-black">
                  {form.slot ? SLOTS.find((s) => s.value === form.slot)?.label : "Chưa chọn buổi"}
                </span>
                <span> • Các ngày: </span>
                <span className="font-black bg-primary/15 px-2 py-0.5 rounded-md mx-0.5">
                  {form.days.length === 0
                    ? "Chưa chọn ngày"
                    : form.days.map((d) => DAYS.find((dayObj) => dayObj.value === d)?.short).join(", ")}
                </span>
                <span> • {(!form.startTime || !form.endTime) ? "(Chưa chọn giờ)" : `(${form.startTime} - ${form.endTime})`}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
