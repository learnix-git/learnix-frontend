import client from "./client";
import type {
  ApiResponse,
  CreateRequestRequest,
  RequestModel,
} from "./types";

// POST /requests
export async function createRequest(data: CreateRequestRequest): Promise<ApiResponse<RequestModel>> {
  const res = await client.post<ApiResponse<RequestModel>>("/requests", data);
  return res.data;
}
