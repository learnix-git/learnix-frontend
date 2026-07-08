"use client";

import type { User } from "@/lib/api/types";

const USER_KEY = "auth_user";
const TOKEN_KEY = "auth_token";
const PROVIDER_KEY = "auth_provider";
const REQUEST_ID_KEY = "request_id";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

export const LOGIN_PATH = "/signin";

/**
 * Tạo đường dẫn đăng nhập kèm callback URL nếu có.
 * @param text Đường dẫn cần quay lại sau khi đăng nhập.
 * @returns Đường dẫn đăng nhập có chứa callback URL.
 */
export function BuildCallback(callbackUrl?: string | null): string {
  const url = new URL(
    LOGIN_PATH,
    typeof window !== "undefined" ? window.location.origin : "http://localhost"
  );
  if (callbackUrl && typeof callbackUrl === "string") {
    url.searchParams.set("callbackUrl", callbackUrl);
  }
  return url.pathname + url.search;
}

/**
 * Kiểm tra môi trường hiện tại có hỗ trợ window/local storage hay không.
 * @returns true nếu đang chạy trên trình duyệt.
 */
function CheckStorage(): boolean {
  return typeof window !== "undefined";
}

/**
 * Tạo chuỗi thuộc tính cho Cookie.
 * @param number Thời gian sống của Cookie.
 * @returns Chuỗi thuộc tính Cookie.
 */
function GetAttributes(maxAge: number): string {
  const secure =
    CheckStorage() && window.location.protocol === "https:"
      ? "; secure"
      : "";
  return `path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

/**
 * Lưu Cookie vào trình duyệt.
 * @param string Tên Cookie.
 * @param string Giá trị Cookie.
 * @param number Thời gian sống của Cookie.
 * @returns Không trả về giá trị.
 */
function SetCookie(name: string, value: string, maxAge: number = SESSION_MAX_AGE): void {
  if (!CheckStorage()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${GetAttributes(maxAge)}`;
}

/**
 * Đọc giá trị của Cookie theo tên.
 * @param string Tên Cookie cần lấy.
 * @returns Giá trị Cookie hoặc null nếu không tồn tại.
 */
function ReadCookie(name: string): string | null {
  if (!CheckStorage()) return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    try {
      return decodeURIComponent(match[2]);
    } catch {
      return match[2];
    }
  }
  return null;
}

/**
 * Xóa Cookie khỏi trình duyệt.
 * @param name Tên Cookie cần xóa.
 * @returns Không trả về giá trị.
 */
function DeleteCookie(name: string): void {
  if (!CheckStorage()) return;
  document.cookie = `${name}=; ${GetAttributes(0)}`;
}

/**
 * Loại bỏ thông tin Token khỏi đối tượng người dùng.
 * @param user Đối tượng người dùng.
 * @returns Đối tượng người dùng không chứa Token.
 */
function StripToken<T extends Partial<User>>(user: T): T {
  if (!user || typeof user !== "object") return user;
  const { accessToken: _omit, ...rest } = user as User & { accessToken?: string; token?: string };
  return rest as T;
}

/**
 * Lấy Access Token từ Cookie.
 * @returns Access Token hoặc null nếu chưa đăng nhập.
 */
export function GetToken(): string | null {
  return ReadCookie(TOKEN_KEY);
}

/**
 * Lấy thông tin người dùng đã lưu trong Cookie.
 * @returns Thông tin người dùng hoặc null nếu không tồn tại.
 */
export function GetUser(): User | null {
  const stored = ReadCookie(USER_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as User;
    return StripToken(parsed);
  } catch {
    return null;
  }
}

/**
 * Sinh một UUID ngẫu nhiên dùng làm Request ID.
 * @returns Chuỗi UUID.
 */
export function GenerateUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

/**
 * Lấy Request ID từ Cookie.
 * @returns Request ID hoặc null nếu chưa tồn tại.
 */
export function GetRequestId(): string | null {
  return ReadCookie(REQUEST_ID_KEY);
}

/**
 * Tạo và lưu Request ID mới vào Cookie.
 * @returns Request ID vừa được tạo.
 */
export function SaveRequestId(): string {
  const uid = GenerateUID();
  SetCookie(REQUEST_ID_KEY, uid);
  return uid;
}

/**
 * Xóa Request ID khỏi Cookie.
 * @returns Không trả về giá trị.
 */
export function ClearRequestId(): void {
  DeleteCookie(REQUEST_ID_KEY);
}

/**
 * Lưu phiên đăng nhập của người dùng vào Cookie.
 * Bao gồm thông tin người dùng, Access Token, Provider và Request ID.
 * @param user Thông tin người dùng.
 * @param provider Nhà cung cấp đăng nhập.
 * @returns Không trả về giá trị.
 */
export function SaveSession(user: User, provider?: string): void {
  // Lấy token từ object trước khi loại bỏ nó
  const token = (user as any).token || (user as any).accessToken;
  const safeUser = StripToken(user);

  // Lưu Provider nếu có
  if (provider) {
    SetCookie(PROVIDER_KEY, provider);
  } else {
    DeleteCookie(PROVIDER_KEY);
  }

  // Lưu User và Token vào cookie
  SetCookie(USER_KEY, JSON.stringify(safeUser));
  if (token) {
    SetCookie(TOKEN_KEY, token);
  }

  // Tạo Idempotency Request ID mới
  SaveRequestId();
}

/**
 * Cập nhật thông tin người dùng trong phiên đăng nhập.
 * @param user Thông tin người dùng mới.
 * @returns Không trả về giá trị.
 */
export function UpdateSession(user: User): void {
  const safeUser = StripToken(user);
  SetCookie(USER_KEY, JSON.stringify(safeUser));
}

/**
 * Xóa toàn bộ thông tin phiên đăng nhập khỏi Cookie.
 * @returns Không trả về giá trị.
 */
export function ClearSession(): void {
  DeleteCookie(TOKEN_KEY);
  DeleteCookie(USER_KEY);
  DeleteCookie(PROVIDER_KEY);
  DeleteCookie(REQUEST_ID_KEY);
}

/**
 * Kiểm tra người dùng có đăng nhập bằng Google hay không.
 * @param user Thông tin người dùng.
 * @returns true nếu người dùng đăng nhập bằng Google.
 */
export function IsGoogleUser(user: User | null): boolean {
  if (!CheckStorage()) return false;
  if (!user) return false;

  if (ReadCookie(PROVIDER_KEY) === "google") return true;

  const data = user as unknown as Record<string, unknown>;

  if (
    data.googleId !== undefined ||
    data.google_id !== undefined ||
    data.isGoogle !== undefined ||
    (typeof data.provider === "string" && data.provider === "google")
  ) {
    return true;
  }

  if (typeof data.username === "string" && !data.username.includes("@")) {
    if (
      /^\d+$/.test(data.username) ||
      data.username.startsWith("google_") ||
      data.username.startsWith("oauth_")
    ) {
      return true;
    }
  }

  return false;
}