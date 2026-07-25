import type { Payload } from "./invalidate-bus";

// Kiểm tra dữ liệu socket có hợp lệ không
export function CheckSocketNotification(
  x: unknown,
): x is Payload {
  if (!x || typeof x !== "object") 
    return false;
  
  const raw = x as Record<string, unknown>;
  
  return (
    typeof raw.id === "string" &&
    typeof raw.owner === "string" &&
    typeof raw.title === "string" &&
    typeof raw.content === "string" &&
    typeof raw.type === "string" &&
    typeof raw.read === "boolean" &&
    typeof raw.created === "string" &&
    (raw.link === null || typeof raw.link === "string")
  );
}

// Chuẩn hóa dữ liệu socket
export function NormalizeSocketNotification(
  raw: unknown,
): Payload | null {
  if (!CheckSocketNotification(raw)) 
    return null;
  return raw;
}