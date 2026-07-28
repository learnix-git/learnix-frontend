import { z } from "zod";
import { PostFormData } from "@/app/tutor-post/page";

// === SCHEMA VALIDATE FORM ĐĂNG BÀI GIA SƯ ===

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bài đăng.")
    .max(150, "Tiêu đề tối đa 150 ký tự."),

  content: z
    .string()
    .min(1, "Vui lòng mô tả nội dung dạy.")
    .max(5000, "Nội dung tối đa 5000 ký tự."),

  topics: z
    .array(z.any())
    .min(1, "Chọn hoặc thêm ít nhất 1 môn dạy."),

  grades: z
    .array(z.number())
    .min(1, "Vui lòng chọn ít nhất 1 khối lớp."),

  from: z
    .number()
    .min(1000, "Học phí tối thiểu từ 1.000đ."),

  to: z
    .number()
    .min(1000, "Học phí tối đa từ 1.000đ."),
});

// Hàm validate toàn bộ form và trả về object lỗi chuẩn hóa
export function validatePostForm(
  form: PostFormData
): Partial<Record<keyof PostFormData, string>> {
  const errors: Partial<Record<keyof PostFormData, string>> = {};

  if (!form.title.trim()) {
    errors.title = "Vui lòng nhập tiêu đề bài đăng.";
  } else if (form.title.length > 150) {
    errors.title = "Tiêu đề tối đa 150 ký tự.";
  }

  if (!form.content.trim()) {
    errors.content = "Vui lòng mô tả nội dung dạy.";
  } else if (form.content.length > 5000) {
    errors.content = "Nội dung tối đa 5000 ký tự.";
  }

  if (form.topics.length === 0) {
    errors.topics = "Chọn hoặc thêm ít nhất 1 môn dạy.";
  }

  if (form.grades.length === 0) {
    errors.grades = "Vui lòng chọn ít nhất 1 khối lớp.";
  }

  if (form.mode === "OFFLINE" && form.venue === "TUTOR" && !form.city.trim()) {
    errors.city = "Nhập khu vực dạy khi chọn hình thức Offline.";
  }

  if (!form.from || form.from < 1000) {
    errors.from = "Học phí tối thiểu từ 1.000đ.";
  }

  if (!form.to || form.to < 1000) {
    errors.to = "Học phí tối đa từ 1.000đ.";
  }

  if (form.from && form.to && form.from > form.to) {
    errors.to = "Học phí tối đa phải lớn hơn hoặc bằng tối thiểu.";
  }

  if (!form.flexible && !form.slot) {
    errors.slot = "Vui lòng chọn buổi học.";
  }

  if (!form.flexible && form.days.length === 0) {
    errors.days = "Vui lòng chọn ít nhất 1 ngày dạy trong tuần.";
  }

  if (!form.flexible && (!form.startTime || !form.endTime || form.startTime >= form.endTime)) {
    errors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu.";
  } else if (!form.flexible && form.startTime && form.endTime && form.unit === "PER_SESSION" && form.duration) {
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const diffHours = (eh + em / 60) - (sh + sm / 60);
    if (Math.abs(diffHours - form.duration) > 0.05) {
      errors.endTime = `Lịch dạy phải kéo dài đúng ${form.duration} giờ/buổi như đã thiết lập.`;
    }
  }

  return errors;
}
