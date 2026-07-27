import React from "react";
import { PostFormData } from "@/app/tutor-post/page";
import { GetInputCls, FieldError } from "@/app/tutor-post/page";

interface PostDescProps {
  form: PostFormData;
  errors: Partial<Record<keyof PostFormData, string>>;
  handleUpdate: <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => void;
}

export function PostDesc({ form, errors, handleUpdate }: PostDescProps) {
  return (
    <>
      {/* Khung nhập mô tả nội dung bài đăng */}
      <div id="content">
        <label htmlFor="content-input" className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Nội dung <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="content-input"
          value={form.content}
          onChange={(e) => handleUpdate("content", e.target.value)}
          placeholder="Giới thiệu phương pháp dạy, kinh nghiệm, cam kết đầu ra,..."
          className={GetInputCls(!!errors.content, true)}
          maxLength={5000}
        />
        
        {/* Thanh công cụ báo lỗi và đếm ký tự */}
        <div className="mt-1.5 flex items-center justify-between">
          <FieldError message={errors.content} />
          <span className="text-[12px] text-muted-foreground ml-auto">
            {form.content.length}/5000
          </span>
        </div>
      </div>
    </>
  );
}
