// !==========================================
// ! API REQUEST / RESPONSE TYPES
// !==========================================

export interface ApiResponse<T = any> {
  success: true | false;
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

// !==========================================
// ! SHARED TYPES
// !==========================================

export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export type Status = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface GeneralItem {
  id: number | string;
  name: string;
  alias?: string;
}

// !==========================================
// ! MODELS - USER & TUTOR
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

  // ! Thông tin dành riêng cho Gia sư
  cccd?: string | null;
  degree?: string | null;
  major?: string | null;
  bio?: string | null;
  fee?: number | null;

  // ! Relations
  courses?: Course[];
  posts?: Post[];
  teachingRef?: Booking[];
  bookingRef?: Booking[];
}

// !==========================================
// ! MODELS - COURSES 
// !==========================================

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  teacher: string;
  thumbnail?: string | null;
  feed?: any; // Prisma Json
  active: boolean;
  created: string;
  updated: string;
  deleted?: string | null;
  fee: number;
  grade: number;

  // ! Tham số cho giao diện
  price?: string;
  rating?: number;
  lessons?: number;
  count?: number;
  status?: "active" | "draft" | boolean;

  // ! Relations
  teacherRef?: User | null;
  members?: Member[];
  chapters?: Chapter[];
  exams?: Exam[];
}

export interface Chapter {
  id: string;
  title: string;
  courseId: string;
  created: string;

  // ! Relations
  courseRef?: Course | null;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  video?: string | null;
  content?: string | null;
  chapterId: string;
  created: string;

  // ! Relations
  chapterRef?: Chapter | null;
}

export interface Member {
  id: string;
  course: string;
  student: string;
  role: string;
  joined: string;

  // ! Relations
  courseRef?: Course | null;
  studentRef?: User | null;
}

// !==========================================
// ! MODELS - TUTORS
// !==========================================

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: "FIND_CLASS" | "FIND_TUTOR" | string;
  subject: string;
  budget: number;
  address?: string | null;
  contact?: string | null;
  created: string;
  updated: string;

  // ! Relations
  userRef?: User | null;
}

export interface Booking {
  id: string;
  teacherId: string;
  studentId: string;
  start?: string | null;
  schedule?: string | null;
  online: boolean;
  address?: string | null;
  meet?: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
  fee: number;
  created: string;
  updated: string;

  // ! Relations
  teacherRef?: User | null;
  studentRef?: User | null;
}

export interface Order {
  id: string;
  userId: string;
  courseId?: string | null;
  bookingId?: string | null;
  amount: number;
  status: Status;
  gateway: string;
  created: string;
  updated: string;

  // ! Relations
  userRef?: User | null;
  courseRef?: Course | null;
  bookingRef?: Booking | null;
}

// !==========================================
// ! MODELS - THI CỬ & CHẤM ĐIỂM
// !==========================================

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
  course?: string | null;
  questions: any;       // Prisma Json
  config: any;          // Prisma Json
  status: string;
  start?: string | null;
  end?: string | null;
  created: string;
  updated: string;
  deleted?: string | null;

  // ! Relations
  courseRef?: Course | null;
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
  course?: string | null;
  submission: string;
  total: number;
  max: number;
  passed: boolean;
  feedback?: string | null;
  graded: string;
  created: string;
  updated: string;
}

// !==========================================
// ! MODELS - TIỆN ÍCH KHÁC
// !==========================================

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