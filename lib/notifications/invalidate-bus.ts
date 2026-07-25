"use client";

// Nội dung
export interface Payload {
  id: string;
  owner: string;
  title: string;
  content: string;
  link: string | null;
  type: string;
  read: boolean;
  created: string;
}

// Lắng nghe
export type Listener = (payload: Payload) => void;

// Danh sách lắng nghe
const listeners = new Set<Listener>();

// Hàm đăng kí sự kiện
export function Subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Hàm lắng nghe sự kiện
export function Emit(payload: Payload): void {
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (err) {
      console.error(err);
    }
  });
}

// Hàm hủy đăng kí sự kiện
export function Reset(): void {
  listeners.clear();
}