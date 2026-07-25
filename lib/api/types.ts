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
  active: boolean;
  created: string;
  updated: string;
}