import client from "./client";
import type { ApiResponse, Subject } from "./types";

// GET /subjects
export async function getSubjects(): Promise<ApiResponse<Subject[]>> {
  const res = await client.get<ApiResponse<Subject[]>>("/subjects");
  return res.data;
}