// !==========================================
// ! API REQUEST / RESPONSE TYPES
// !==========================================

export interface ApiResponse<T = any> {
  success: true | false;
  message: string;
  data?: T;
  errors?: any;
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

// !==========================================
// ! SHARED TYPES
// !==========================================

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface GeneralItem {
  id: number | string;
  name: string;
  alias?: string;
}

// !==========================================
// ! MODELS
// !==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: number;
  role: Role;
  avatar: string | null;
  active: boolean;
  token?: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  teacher: string;
  capacity: number;
  active: boolean;
  created: string;
  updated: string;
  deleted?: string | null;
  fee: number;
  grade: number;
  address?: string;

  // ! Tham số cho giao diện
  price?: string;
  rating?: number;
  lessons?: number;
  count?: number;
  status?: "active" | "draft";
}

export interface Schedule {
  id: string;
  time: string;
  title: string;
  class: string;
  url: string;
}

export interface Member {
  id: string;
  classroom: string;
  student: string;
  role: string;
  joined: string;
}

export interface Bank {
  id: string;
  name: string;
  subject: string;
  description?: string | null;
  teacher: string;
  public: boolean;
  created: string;
  updated: string;
  deleted?: string | null;
}

export interface Question {
  id: string;
  bank: string;
  content: string;
  type: string;
  difficulty: string;
  topic?: string | null;
  options?: any | null;  // Prisma Json
  solution?: any | null; // Prisma Json
  points: number;
  active: boolean;
  created: string;
  updated: string;
  deleted?: string | null;
}

export interface Exam {
  id: string;
  title: string;
  description?: string | null;
  duration: number;
  threshold: number;
  teacher: string;
  classroom?: string | null;
  questions: any;       // Prisma Json
  config: any;          // Prisma Json
  status: string;
  start?: string | null;
  end?: string | null;
  created: string;
  updated: string;
  deleted?: string | null;

  // ! Relations
  classroomRef?: Classroom | null;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  exam: string;
  student: string;
  start: string;
  submitted?: string | null;
  elapsed: number;
  cheats: number;
  logs?: any | null;    // Prisma Json
  answers?: any | null; // Prisma Json
  status: string;
  created: string;
  updated: string;
}

export interface Score {
  id: string;
  student: string;
  exam: string;
  classroom?: string | null;
  submission: string;
  total: number;
  max: number;
  passed: boolean;
  feedback?: string | null;
  graded: string;
  created: string;
  updated: string;
}

export interface Plan {
  id: string;
  user: string;
  title: string;
  subject?: string | null;
  content: any;         // Prisma Json
  status: string;
  completed?: string | null;
  created: string;
  updated: string;
}

export interface Notification {
  id: string;
  user: string;
  title: string;
  message?: string | null;
  type: string;
  read: boolean;
  opened?: string | null;
  created: string;
}