import React from "react";
import { Banknote, Clock } from "lucide-react";
import { Cn } from "@/lib/utils";
import { Unit } from "@/lib/api/types";
import { RequestFormData, GetInputCls, FieldError } from "@/app/client-post/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface RequestBudgetProps {
  form: RequestFormData;
  errors: Partial<Record<keyof RequestFormData, string>>;
  handleUpdate: <K extends keyof RequestFormData>(field: K, value: RequestFormData[K]) => void;
}

export function RequestBudget({ form, errors, handleUpdate }: RequestBudgetProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nhập mức giá tối thiểu */}
        <div id="from">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-primary" /> Mức giá tối thiểu <span className="text-rose-500">*</span>
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

        {/* Nhập mức giá tối đa */}
        <div id="to">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-primary" /> Mức giá tối đa <span className="text-rose-500">*</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Chọn đơn vị tính */}
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

        {/* Số buổi/tuần */}
        <div id="count">
          <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Số buổi học / tuần
          </label>
          <div className="flex items-center gap-3 h-12">
            <button
              type="button"
              onClick={() => handleUpdate("count", Math.max(1, form.count - 1))}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 hover:bg-white/40 dark:hover:bg-white/10 font-bold text-lg transition-all"
            >
              −
            </button>
            <div className="flex-1 h-12 flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 text-primary font-bold text-base">
              {form.count} <span className="text-[13px] font-medium ml-1.5 text-muted-foreground">buổi</span>
            </div>
            <button
              type="button"
              onClick={() => handleUpdate("count", Math.min(14, form.count + 1))}
              className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/50 dark:border-white/10 bg-white/20 dark:bg-white/3 hover:bg-white/40 dark:hover:bg-white/10 font-bold text-lg transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
