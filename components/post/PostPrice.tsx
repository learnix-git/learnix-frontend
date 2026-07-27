import React from "react";
import { Banknote, Clock, Hourglass } from "lucide-react";
import { Cn } from "@/lib/utils";
import { Unit } from "@/lib/api/types";
import { PostFormData } from "@/app/tutor-post/page";
import { GetInputCls, FieldError } from "@/app/tutor-post/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

// Danh sách các lựa chọn thời lượng buổi học
const DURATIONS = [
  { value: 1, label: "1 giờ (60 phút)" },
  { value: 1.5, label: "1.5 giờ (90 phút)" },
  { value: 2, label: "2 giờ (120 phút)" },
  { value: 2.5, label: "2.5 giờ (150 phút)" },
  { value: 3, label: "3 giờ (180 phút)" },
  { value: 0, label: "Thỏa thuận" },
];

interface PostPriceProps {
  form: PostFormData;
  errors: Partial<Record<keyof PostFormData, string>>;
  handleUpdate: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
}

export function PostPrice({ form, errors, handleUpdate }: PostPriceProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nhập học phí tối thiểu */}
        <div id="from">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-primary" /> Học phí tối thiểu <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="VD: 150.000"
              value={form.from > 0 ? form.from.toLocaleString("vi-VN") : ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleUpdate("from", val ? parseInt(val || "0") : 0);
              }}
              className={Cn(GetInputCls(!!errors.from), "pl-8")}
            />
          </div>
          <FieldError message={errors.from} />
        </div>

        {/* Nhập học phí tối đa */}
        <div id="to">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-primary" /> Học phí tối đa <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="VD: 250.000"
              value={form.to > 0 ? form.to.toLocaleString("vi-VN") : ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleUpdate("to", val ? parseInt(val || "0") : 0);
              }}
              className={Cn(GetInputCls(!!errors.to), "pl-8")}
            />
          </div>
          <FieldError message={errors.to} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Chọn đơn vị tính học phí */}
        <div id="unit">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> Đơn vị tính <span className="text-rose-500">*</span>
          </label>
          <Select
            value={form.unit}
            onValueChange={(v) => handleUpdate("unit", (v || "PER_SESSION") as Unit)}
            items={[
              { value: "PER_SESSION", label: "VNĐ / buổi" },
              { value: "PER_MONTH", label: "VNĐ / tháng" },
            ]}
          >
            <SelectTrigger className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3">
              <SelectValue placeholder="Chọn đơn vị tính học phí" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
              <SelectItem value="PER_SESSION">VNĐ / buổi (Theo từng buổi học)</SelectItem>
              <SelectItem value="PER_MONTH">VNĐ / tháng (Trọn gói tháng)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chọn thời lượng (Chỉ hiện khi chọn tính theo buổi) */}
        {form.unit === "PER_SESSION" && (
          <div id="duration" className="animate-in fade-in zoom-in-95 duration-200">
            <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hourglass className="h-3.5 w-3.5 text-primary" /> Thời lượng
            </label>
            <Select
              value={form.duration.toString()}
              onValueChange={(v) => handleUpdate("duration", parseFloat(v || "0"))}
              items={DURATIONS.map((d) => ({ value: d.value.toString(), label: d.label }))}
            >
              <SelectTrigger className="w-full h-12 rounded-2xl border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3">
                <SelectValue placeholder="Chọn thời lượng buổi học" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80">
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value.toString()}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
}
