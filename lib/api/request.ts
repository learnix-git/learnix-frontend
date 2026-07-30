import client from "./client";
import type {
  ApiResponse,
  CreateRequestRequest,
  RequestModel,
  RequestListParams,
  RequestListResponse,
} from "./types";

// GET /requests (danh sách)
export async function getRequests(
  params?: RequestListParams
): Promise<ApiResponse<RequestListResponse>> {
  const res = await client.get<ApiResponse<RequestListResponse>>("/requests", { params });
  return res.data;
}

// GET /requests/:id
export async function getRequest(id: string): Promise<ApiResponse<RequestModel>> {
  const res = await client.get<ApiResponse<RequestModel>>(`/requests/${id}`);
  return res.data;
}

// POST /requests
export async function createRequest(data: CreateRequestRequest): Promise<ApiResponse<RequestModel>> {
  const res = await client.post<ApiResponse<RequestModel>>("/requests", data);
  return res.data;
}

// POST /bookmarks (save request)
export async function bookmarkRequest(requestId: string) {
  const res = await client.post(`/bookmarks`, { requestId });
  return res.data;
}

// DELETE /bookmarks/:id?type=request
export async function unbookmarkRequest(requestId: string) {
  const res = await client.delete(`/bookmarks/${requestId}?type=request`);
  return res.data;
}

// GET /bookmarks?type=request 
export async function getSavedRequests(
  params?: RequestListParams
): Promise<ApiResponse<RequestListResponse>> {
  const res = await client.get<ApiResponse<any>>("/bookmarks", {
    params: { ...params, type: "request" },
  });

  if (res.data?.data?.items) {
    res.data.data.items = res.data.data.items.map((item: any) => {
      return { ...item.request, saved: true };
    });
  }

  return res.data;
}
