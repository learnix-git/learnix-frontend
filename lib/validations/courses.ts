import { z } from "zod";

export const coursesSchema = z.object({
  name: z
    .string()
    .min(5, "Tên khóa học phải trên 5 ký tự"),
  grade: z
    .string()
    .min(1, "Chọn khối lớp"),
  fee: z.coerce
    .number()
    .min(0, "Học phí không âm"),
  description: z
    .string()
    .optional(),
  thumbnail: z
    .string()
    .optional(),
  address: z
    .string()
    .optional(), 
});

export type CoursesFormData = z.infer<typeof coursesSchema>;