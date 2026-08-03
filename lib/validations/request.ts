import { z } from "zod";
import { RequestFormData } from "@/app/client-post/page";

export const requestSchema = z.object({
  title: z
    .string()
    .min(1, "Vui lòng nhập tiêu đề bài đăng.")
    .max(150, "Tiêu đề tối đa 150 ký tự."),

  topics: z
    .array(z.any())
    .min(1, "Vui lòng chọn ít nhất 1 môn học."),

  grades: z
    .array(z.number())
    .min(1, "Vui lòng chọn ít nhất 1 khối lớp."),

  from: z
    .number()
    .min(10000, "Mức giá tối thiểu là 10.000đ."),

  to: z
    .number()
    .min(10000, "Mức giá tối thiểu là 10.000đ."),

  desc: z
    .string()
    .min(1, "Vui lòng mô tả chi tiết.")
    .max(5000, "Mô tả tối đa 5000 ký tự."),
});

export function validateRequestForm(
  form: RequestFormData
): Partial<Record<keyof RequestFormData, string>> {
  const errors: Partial<Record<keyof RequestFormData, string>> = {};

  if (!form.title.trim()) {
    errors.title = "Vui lòng nhập tiêu đề bài đăng.";
  } else if (form.title.length > 150) {
    errors.title = "Tiêu đề tối đa 150 ký tự.";
  }

  if (
    !form.topics ||
    form.topics.length === 0
  ) {
    errors.topics = "Vui lòng chọn môn học cần tìm gia sư.";
  }

  if (
    !form.grades ||
    form.grades.length === 0
  ) {
    errors.grades = "Vui lòng chọn khối lớp.";
  }

  if (
    form.mode === "OFFLINE" &&
    form.venue === "STUDENT"
  ) {
    if (!form.city.trim()) {
      errors.city = "Vui lòng chọn Tỉnh/Thành phố.";
    }

    if (!form.ward.trim()) {
      errors.ward = "Vui lòng chọn Quận/Huyện.";
    }

    if (!form.street.trim()) {
      errors.street = "Vui lòng nhập địa chỉ chi tiết.";
    }
  }

  if (
    !form.from ||
    form.from < 10000
  ) {
    errors.from = "Mức giá tối thiểu là 10.000đ.";
  }

  if (
    !form.to ||
    form.to < 10000
  ) {
    errors.to = "Mức giá tối thiểu là 10.000đ.";
  } else if (
    form.from > form.to
  ) {
    errors.to = "Mức giá tối đa phải lớn hơn hoặc bằng mức tối thiểu.";
  }

  if (!form.desc.trim()) {
    errors.desc = "Vui lòng mô tả yêu cầu chi tiết.";
  } else if (
    form.desc.length > 5000
  ) {
    errors.desc = "Mô tả tối đa 5000 ký tự.";
  }

  if (!form.flexible) {
    if (
      form.days.length === 0
    ) {
      errors.days = "Vui lòng chọn ít nhất 1 ngày học trong tuần.";
    } else if (
      form.count > 0 &&
      form.days.length !== form.count
    ) {
      errors.days =
        `Vui lòng chọn đủ ${form.count} ngày học tương ứng với ${form.count} buổi.`;
    }

    if (!form.slot) {
      errors.slot = "Vui lòng chọn buổi học.";
    }

    if (
      !form.startTime ||
      !form.endTime ||
      form.startTime >= form.endTime
    ) {
      errors.endTime = "Giờ kết thúc phải lớn hơn giờ bắt đầu.";
    }
  }

  return errors;
}