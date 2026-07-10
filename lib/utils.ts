import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function Cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Chuyển đổi chuỗi ngày tháng sang định dạng thời gian tương đối
 * @param dateString Chuỗi ngày tháng
 * @returns Chuỗi thời gian tương đối
 */
export function FormatTime(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) 
    return "Hồi nãy";
  
  const now = new Date();

  // Tính khoảng cách thời gian theo giây
  const diffInSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  // Xử lý trường hợp thời gian ở tương lai
  if (diffInSeconds < 0) {
    return "Vừa xong";
  }

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 1) {
    return "Hôm qua";
  }

  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInDays / 365);

  return `${diffInYears} năm trước`;
}

/**
 * Định dạng số thành tiền tệ Việt Nam
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi định dạng VND
 */
export function FormatMoney(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Chuẩn hóa chuỗi tiếng Việt để hỗ trợ tìm kiếm bằng cách loại bỏ dấu
 * @param str Chuỗi cần chuẩn hóa
 * @returns Chuỗi đã loại bỏ dấu tiếng Việt
 */
export function NormalizeString(str: string): string {
  if (!str) return "";

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") 
    .replace(/[đĐ]/g, "d"); 
}

/**
 * Kiểm tra chuỗi có chứa từ khóa tìm kiếm hay không 
 * @param text Chuỗi cần tìm
 * @param query Từ khóa tìm kiếm
 * @returns true nếu chuỗi chứa từ khóa
 */
export function SearchText(
  text: string,
  query: string
): boolean {
  if (!text || !query) return true;

  return NormalizeString(text).includes(
    NormalizeString(query)
  );
}

/**
 * Cắt ngắn chuỗi tại độ dài chỉ định
 * @param string Chuỗi cần cắt
 * @param number Độ dài tối đa 
 * @param string Ký tự hiển thị khi cắt 
 * @param boolean Có cắt theo ranh giới từ hay không 
 * @returns Chuỗi đã được cắt
 */
export function TruncateText(
  text: string,
  maxLength: number = 50,
  ellipsis: string = "...",
  breakOnWord: boolean = true
): string {
  if (!text) return "";

  // Nếu chuỗi ngắn hơn hoặc bằng độ dài tối đa thì trả về nguyên bản
  if (text.length <= maxLength) {
    return text;
  }

  // Tính số ký tự còn lại sau khi thêm dấu cắt
  const availableLength = maxLength - ellipsis.length;

  // Cắt chuỗi theo độ dài còn lại
  let truncated = text.slice(0, availableLength);

  // Nếu yêu cầu cắt theo ranh giới từ
  if (breakOnWord) {
    // Tìm khoảng trắng cuối cùng
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    // Nếu tìm thấy thì cắt tại vị trí đó
    if (lastSpaceIndex > 0) {
      truncated = truncated.slice(0, lastSpaceIndex);
    }
  }

  // Loại bỏ khoảng trắng ở cuối chuỗi
  truncated = truncated.trimEnd();

  // Thêm dấu cắt vào cuối chuỗi
  return truncated + ellipsis;
}