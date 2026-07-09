import client from "./client";
import type { ApiResponse, Classroom, Schedule } from "./types";

export const DashboardTeacher = {
  getClasses: async (): Promise<ApiResponse<Classroom[]>> => {
    const res = await client.get<ApiResponse<Classroom[]>>("/classrooms");
    return res.data;
  },

  getSchedule: async (): Promise<ApiResponse<Schedule[]>> => {
    const res = await client.get<ApiResponse<Schedule[]>>("/schedule");
    return res.data;
  },
};

// TODO: sau này làm cái DashboardStudent vào đây luôn cho gọn