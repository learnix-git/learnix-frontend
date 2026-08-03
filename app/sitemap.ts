import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://learnix.io.vn";

/**
 * sitemap.ts — định nghĩa các route công khai cho sitemap.xml
 * giúp Google bot index đúng các trang quan trọng.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/tim-gia-su`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/tim-lop-hoc`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/dang-tin-gia-su`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/dang-tin-tim-gia-su`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/dieu-khoan-dich-vu`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/chinh-sach-bao-mat`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/dang-nhap`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/dang-ky`, changeFrequency: "yearly", priority: 0.2 },
  ];
}