import client from "./client";
import type { ApiResponse, Classroom } from "./types";

export type Payload = Pick<Classroom, "name" | "code" | "fee" | "grade" | "description" | "capacity">;

export const ClassroomsAPI = {
  getAll: async (): Promise<ApiResponse<Classroom[]>> => {
    const res = await client.get<ApiResponse<Classroom[]>>("/classrooms");
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Classroom>> => {
    const res = await client.get<ApiResponse<Classroom>>(`/classrooms/${id}`);
    return res.data;
  },

  createClass: async (data: Payload): Promise<ApiResponse<Classroom>> => {
    const res = await client.post<ApiResponse<Classroom>>("/classrooms/create", data);
    return res.data;
  },

  updateClass: async (id: string, data: Payload): Promise<ApiResponse<Classroom>> => {
    const res = await client.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data);
    return res.data;
  },

  getMembers: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>(`/classrooms/${id}/members`);
    return res.data;
  },

  getExams: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>(`/classrooms/${id}/exams`);
    return res.data;
  },

  getFeed: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>(`/classrooms/${id}/feed`);
    return res.data;
  },

  getResources: async (id: string): Promise<ApiResponse<any>> => {
    const res = await client.get<ApiResponse<any>>(`/classrooms/${id}/resources`);
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