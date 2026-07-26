// !==========================================
// ! API REQUEST / RESPONSE TYPES
// !==========================================

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  pagination?: {
    items: number;
    pages: number;
    current: number;
    limit: number;
  };
}

export interface LoginRequest {
  email: string; 
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  gender: number;
  role?: "STUDENT" | "TUTOR";
  dob?: string;
  phone?: string;
}

// !==========================================
// ! USER
// !==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  alias: string | null;
  dob: string | null;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  gender: "MALE" | "FEMALE" | "OTHER";
  avatar: string | null;
  phone: string | null;
  token: string | null;
  expire: string | null;
  active: boolean;
  created: string;
  updated: string;
}

// !==========================================
// ! SUBJECT
// !==========================================

export interface Subject {
  id: string;
  name: string;
  slug: string;
}

// !==========================================
// ! POST
// !==========================================

export type Level = "PRIMARY" | "MIDDLE" | "HIGH" | "ALL";
export type Mode = "ONLINE" | "OFFLINE";
export type Venue = "TUTOR" | "STUDENT" | "BOTH";
export type PostStatus = "OPEN" | "DONE" | "CANCEL" | "HOLD";

export interface PostTopic {
  id: string;
  subject: { id: string; name: string; slug: string } | null;
  custom: string | null;
}

export type PostTopicInput = { subject: string } | { custom: string };

export interface Post {
  id: string;
  title: string;
  content: string;
  level: Level;
  grade: number;
  mode: Mode;
  venue: Venue | null;
  city: string | null;
  district: string | null;
  ward: string | null;
  street: string | null;
  lat: number | null;
  lng: number | null;
  from: number;
  to: number;
  status: PostStatus;
  created: string;
  updated: string;
  topics: PostTopic[];
  tutor?: {
    id: string;
    rating: number;
    reviews: number;
    account: { name: string; alias: string | null; avatar: string | null };
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  level?: Level;
  grade: number;
  mode: Mode;
  venue?: Venue;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
  lat?: number;
  lng?: number;
  from: number;
  to: number;
  topics: PostTopicInput[];
}

export type UpdatePostRequest = Partial<CreatePostRequest> & {
  status?: PostStatus;
};

export interface PostListParams {
  page?: number;
  limit?: number;
  topic?: string;
  level?: Level;
  grade?: number;
  mode?: Mode;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}