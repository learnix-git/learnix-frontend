const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function parseDate(input: string): Date | null {
  if (!input) return null;
  const normalized = input.includes("T") ? input : input.replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function formatTimeAgo(input: string, now: Date = new Date()): string {
  const d = parseDate(input);
  if (!d) return input || "";

  const diff = now.getTime() - d.getTime();
  if (diff < 0) return "Vừa xong";

  if (diff < MINUTE) return "Vừa xong";
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

  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function buildSummaryLine(
  creators: string[],
  count: number,
  verb: string = "đã gửi thông báo",
): string {
  if (!creators || creators.length === 0) return verb;
  if (count <= 1) {
    return `${creators[0]} ${verb}`;
  }
  if (creators.length === 1) {
    return `${creators[0]} ${verb} (${count})`;
  }
  const head = creators.slice(0, 2).join(", ");
  const extra = count - creators.length;
  if (extra > 0) {
    return `${head} và ${extra} người khác ${verb} (${count})`;
  }
  return `${head} ${verb} (${count})`;
}
