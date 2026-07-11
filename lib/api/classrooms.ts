import client from "./client";
import type { ApiResponse, Classroom } from "./types";

export type Payload = Pick<Classroom, "name" | "fee" | "grade" | "description" | "capacity">;

export const ClassroomsAPI = {
  // ! In use
  getAll: async (params?: { search?: string; page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>("/classrooms", { params });
    return res.data;
  },

  // ! In use
  getById: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>(`/classrooms/${id}`);
    return res.data;
  },

  // ! In use
  getMy: async (): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>('/classrooms');
    return res.data;
  },

  // ! In use
  createClass: async (data: Payload): Promise<ApiResponse<Classroom>> => {
    const res = await client.post<ApiResponse<Classroom>>("/classrooms", data);
    return res.data;
  },

  updateClass: async (id: string, data: Payload): Promise<ApiResponse<Classroom>> => {
    const res = await client.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data);
    return res.data;
  },

  joinClass: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.post<ApiResponse<any>>(`/classrooms/${id}/join`);
    return res.data;
  },

  leaveClass: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.post<ApiResponse<any>>(`/classrooms/${id}/leave`);
    return res.data;
  },
};