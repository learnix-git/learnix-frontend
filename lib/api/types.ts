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
export type Unit = "PER_SESSION" | "PER_MONTH";
export type Slot = "MORNING" | "AFTERNOON" | "EVENING";

export interface PostTopic {
  id: string;
  subject: { id: string; name: string; slug: string } | null;
  custom: string | null;
}

export type PostTopicInput = { subject: string } | { custom: string };

export interface PostTime {
  day: number;
  slot: Slot;
  start: string;
  end: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  level: Level;
  grades: number[];
  mode: Mode;
  venue: Venue | null;
  city: string | null;
  ward: string | null;
  street: string | null;
  lat: number | null;
  saved?: boolean;
  lng: number | null;
  from: number;
  to: number;
  unit: Unit;
  hours?: number | null;
  flexible: boolean;
  status: PostStatus;
  created: string;
  updated: string;
  topics: PostTopic[];
  times: PostTime[];
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
  grades: number[];
  mode: Mode;
  venue?: Venue;
  city?: string;
  ward?: string;
  street?: string;
  lat?: number;
  lng?: number;
  from: number;
  to: number;
  unit?: Unit;
  hours?: number;
  flexible?: boolean;
  topics: PostTopicInput[];
  times?: PostTime[];
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
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  unit?: Unit;
  minRating?: number;
}

export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateRequestRequest {
  topics: { subject?: string; custom?: string }[];
  title: string;
  desc: string;
  level?: Level;
  grades: number[];
  mode: Mode;
  city?: string;
  ward?: string;
  street?: string;
  lat?: number;
  lng?: number;
  from: number;
  to: number;
  unit: Unit;
  count?: number;
  venue?: Venue;
  flexible?: boolean;
  days?: number[];
  slot?: Slot;
  startTime?: string;
  endTime?: string;
}

export interface RequestModel {
  id: string;
  learner: string;
  topics: {
    id: string;
    topic: { name: string; slug: string } | null;
    custom: string | null;
  }[];
  title: string;
  desc: string;
  level: Level;
  grades: number[];
  mode: Mode;
  city: string | null;
  ward: string | null;
  street: string | null;
  lat: number | null;
  lng: number | null;
  from: string | number;
  to: string | number;
  unit: Unit;
  count: number;
  flexible?: boolean;
  days?: number[];
  startTime?: string | null;
  endTime?: string | null;
  slot?: "MORNING" | "AFTERNOON" | "EVENING" | null;
  status: string;
  created: string;
  updated: string;
  saved?: boolean;
  student?: {
    account: { name: string; alias: string | null; avatar: string | null };
  };
}

export interface RequestListParams {
  page?: number;
  limit?: number;
  topic?: string;
  level?: Level;
  mode?: Mode;
  city?: string;
  maxBudget?: number;
  sort?: string;
  type?: "match" | "all";
}

export interface RequestListResponse {
  items: RequestModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
