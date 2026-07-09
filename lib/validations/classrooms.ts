import { z } from "zod";

export const GRADE = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12", "Đại học"] as const;

export const classroomSchema = z
  .object({
    name: z
      .string()
      .min(1, "Vui lòng nhập tên lớp học")
      .min(5, "Tên lớp học phải có ít nhất 5 ký tự")
      .max(255, "Tên lớp học quá dài"),
    code: z
      .string()
      .min(1, "Vui lòng nhập mã lớp học")
      .min(3, "Mã lớp học phải có ít nhất 3 ký tự")
      .regex(/^[A-Z0-9-]+$/, "Mã lớp chỉ gồm chữ hoa, số và dấu gạch ngang"),
    grade: z
      .enum(GRADE)
      .optional()
      .default("Lớp 6"),
    fee: z.coerce
      .number()
      .min(0, "Học phí không được âm"),
    capacity: z.coerce
      .number()
      .min(10, "Sĩ số tối thiểu là 10")
      .max(500, "Sĩ số tối đa là 500"),
    description: z
      .string()
      .max(1000, "Mô tả tối đa 1000 ký tự")
      .optional()
      .default(""),
  });

export type ClassroomFormData = z.infer<typeof classroomSchema>;