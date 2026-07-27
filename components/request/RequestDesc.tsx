import React from "react";
import { RequestFormData, GetInputCls, FieldError } from "@/app/client-post/page";

interface RequestDescProps {
  form: RequestFormData;
  errors: Partial<Record<keyof RequestFormData, string>>;
  handleUpdate: <K extends keyof RequestFormData>(field: K, value: RequestFormData[K]) => void;
}

export function RequestDesc({ form, errors, handleUpdate }: RequestDescProps) {
  return (
    <div id="desc">
      <label htmlFor="req-desc" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        Mô tả chi tiết <span className="text-rose-500">*</span>
      </label>
      <textarea
        id="req-desc"
        value={form.desc}
        onChange={(e) => handleUpdate("desc", e.target.value)}
        placeholder="Nêu rõ mục tiêu học, yêu cầu với gia sư (kinh nghiệm, giới tính...) và bất kỳ điều gì bạn muốn nhắn thêm."
        className={GetInputCls(!!errors.desc, true)}
        maxLength={5000}
      />
      <div className="flex items-center justify-between mt-1.5">
        <FieldError message={errors.desc} />
        <span className="text-[12px] text-muted-foreground ml-auto">{form.desc.length}/5000</span>
      </div>
    </div>
  );
}
