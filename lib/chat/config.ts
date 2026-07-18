// SOCKET_URL dùng NEXT_PUBLIC_CHAT_URL trực tiếp (vd https://freelancer.minasoft.vn).
// Vì FE (creator.minasoft.vn) và BE chat (freelancer.minasoft.vn) là 2 server khác nhau,
// không thể same-origin. BE đã cấu hình CORS cho phép origin FE (xác nhận qua curl:
// `Access-Control-Allow-Origin: https://creator.minasoft.vn`,
// `Access-Control-Allow-Credentials: true`).
export const CHAT_CONFIG = {
  SOCKET_URL: process.env.NEXT_PUBLIC_API_URL || "",
} as const;