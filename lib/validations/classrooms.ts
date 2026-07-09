import { z } from "zod";
export const GRADE = ["Khối 10", "Khối 11", "Khối 12", "Đại học / Khác"] as const;

export const classroomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Tên lớp học phải có ít nhất 5 ký tự"),
  code: z
    .string()
    .trim()
    .min(3, "Mã lớp học phải có ít nhất 3 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã lớp chỉ gồm chữ hoa, số và dấu gạch dưới"),
  grade: z.enum(GRADE, {
    message: "Vui lòng chọn khối lớp",
  }),
  fee: z.coerce
    .number({ message: "Học phí phải là số" })
    .min(0, "Học phí không được âm"),
  capacity: z.coerce
    .number({ message: "Sĩ số phải là số" })
    .min(10, "Sĩ số tối thiểu là 10")
    .max(500, "Sĩ số tối đa là 500"),
  description: z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự").optional(),
});

export type ClassroomFormValues = z.infer<typeof classroomSchema>;