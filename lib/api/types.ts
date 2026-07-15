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
  role?: "STUDENT" | "TEACHER";
}