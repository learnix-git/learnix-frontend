import client from "./client";
import type { ApiResponse, User, LoginRequest, RegisterRequest} from "./types";
import { ClearSession, GetToken, SaveSession } from "@/lib/auth/session";

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await client.post<ApiResponse<AuthResponse>>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await client.post<ApiResponse<AuthResponse>>("/auth/register", data);
  return res.data;
}

export async function loginViaGoogle(code: string): Promise<ApiResponse<AuthResponse>> {
  const uri = `${window.location.origin}/api/auth/callback/google`;
  const res = await client.post<ApiResponse<AuthResponse>>(
    "/auth/google-login",
    { code, uri }
  );
  return res.data;
}

export function getToken(): string | null {
  return GetToken();
}

export function setSession(user: User): void {
  SaveSession(user);
}

export function removeSession(): void {
  ClearSession();
}

export async function getInfo(): Promise<ApiResponse<User>> {
  const res = await client.get<ApiResponse<User>>("/auth/info");
  return res.data;
}

// export async function forgotPassword(email: string): Promise<ApiResponse<null>> {}

// export async function resetPassword(data: { token: string; password: string; confirmPassword: string }): Promise<ApiResponse<null>> {}

// export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {}

// export async function updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<AuthResponse>> {}