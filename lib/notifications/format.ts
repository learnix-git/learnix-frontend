const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

// Phân tích thời gian
function ParseDate(input: string): Date | null {
  // Tham số rỗng trả null
  if (!input) 
    return null;
  
  const normalized = input.includes("T") ? input : input.replace(" ", "T");
  const date = new Date(normalized);
  
  if (Number.isNaN(date.getTime())) 
    return null;
  return date;
}

// Định dạng thời gina
export function FormatDate(input: string, now: Date = new Date()): string {
  const date = ParseDate(input);
  if (!date) 
    return input || "";

  const diff = now.getTime() - date.getTime();
  if (diff < 0) 
    return "Vừa xong";

  if (diff < MINUTE) 
    return "Vừa xong";
  
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return `${m} phút trước`;
  }
  
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `${h} giờ trước`;
  }
  
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return days === 1 ? "Hôm qua" : `${days} ngày trước`;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}