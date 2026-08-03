import client from "./client";
import type {
  ApiResponse,
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostListParams,
  PostListResponse,
} from "./types";

// GET /posts
export async function getPosts(
  params?: PostListParams
): Promise<ApiResponse<PostListResponse>> {
  const res = await client.get<ApiResponse<PostListResponse>>("/posts", { params });
  return res.data;
}

// GET /posts/my
export async function getMyPosts(
  params?: PostListParams & { status?: string; search?: string }
): Promise<ApiResponse<PostListResponse & { stats?: Record<string, number> }>> {
  const res = await client.get<ApiResponse<PostListResponse & { stats?: Record<string, number> }>>("/posts/my", { params });
  return res.data;
}

// GET /posts/:id 
export async function getPost(id: string): Promise<ApiResponse<Post>> {
  const res = await client.get<ApiResponse<Post>>(`/posts/${id}`);
  return res.data;
}

// POST /posts
export async function createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
  const res = await client.post<ApiResponse<Post>>("/posts", data);
  return res.data;
}

// PATCH /posts/:id 
export async function updatePost(
  id: string,
  data: UpdatePostRequest
): Promise<ApiResponse<Post>> {
  const res = await client.patch<ApiResponse<Post>>(`/posts/${id}`, data);
  return res.data;
}

// DELETE /posts/:id 
export async function deletePost(id: string): Promise<ApiResponse<null>> {
  const res = await client.delete<ApiResponse<null>>(`/posts/${id}`);
  return res.data;
}

// POST /bookmarks/posts/:id
export async function bookmarkPost(postId: string) {
  const res = await client.post(`/bookmarks`, { postId });
  return res.data;
}

// Bỏ bookmark bài đăng
export async function unbookmarkPost(postId: string) {
  const res = await client.delete(`/bookmarks/${postId}?type=post`);
  return res.data;
}

// GET /bookmarks?type=post 
export async function getSavedPosts(
  params?: PostListParams
): Promise<ApiResponse<PostListResponse>> {
  const res = await client.get<ApiResponse<any>>("/bookmarks", {
    params: { ...params, type: "post" },
  });

  if (res.data?.data?.items) {
    res.data.data.items = res.data.data.items.map((item: any) => {
      return { ...item.post, saved: true };
    });
  }

  return res.data;
}