import client from "./client";
import type { ApiResponse, Course } from "./types";

export type Payload = Pick<Course, "name" | "fee" | "grade" | "description" | "thumbnail" | "status" | "active">;

export const CoursesAPI = {
  // ! In use
  getAll: async (params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<Course[]>> => {
    const res = await client.get<ApiResponse<Course[]>>("/courses", { params });
    return res.data;
  },

  // ! In use
  getById: async (id: string): Promise<ApiResponse<Course>> => {
    const res = await client.get<ApiResponse<Course>>(`/courses/${id}`);
    return res.data;
  },

  // ! In use
  getMy: async (): Promise<ApiResponse<Course[]>> => {
    const res = await client.get<ApiResponse<Course[]>>("/courses/my");
    return res.data;
  },

  // ! In use
  create: async (data: Payload): Promise<ApiResponse<Course>> => {
    const res = await client.post<ApiResponse<Course>>("/courses", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Payload>): Promise<ApiResponse<Course>> => {
    const res = await client.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return res.data;
  },

  enroll: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.post<ApiResponse<any>>(`/courses/${id}/enroll`);
    return res.data;
  },

  unenroll: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.post<ApiResponse<any>>(`/courses/${id}/unenroll`);
    return res.data;
  },
};