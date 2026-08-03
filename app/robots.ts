import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://learnix.io.vn";

/**
 * robots.txt — allow all crawlers while disallowing API paths, static
 * assets, and auth/private routes to keep crawlers focused on public content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",

          // Tiếng anh
          "/signin",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/profile",
          "/order/",
          "/my-posts",
          "/my-requests",
          "/my-bookings",
          "/my-schedule",
          "/notifications",
          "/chat",
          "/favorite-tutors",
          "/favorite-posts",
          "/recommended-tutors",
          "/recommended-posts",
          "/settings",

          // Tiếng việt
          "/dang-nhap",
          "/dang-ky",
          "/quen-mat-khau",
          "/dat-lai-mat-khau",
          "/ho-so",
          "/don-hang/",
          "/lop-hoc-cua-toi",
          "/yeu-cau-cua-toi",
          "/lich-dat-cua-toi",
          "/thoi-khoa-bieu",
          "/thong-bao",
          "/tin-nhan",
          "/gia-su-da-luu",
          "/lop-hoc-da-luu",
          "/gia-su-phu-hop",
          "/lop-hoc-phu-hop",
          "/cai-dat",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",

          // Tiếng anh
          "/signin",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/profile",
          "/order/",
          "/my-posts",
          "/my-requests",
          "/my-bookings",
          "/my-schedule",
          "/notifications",
          "/chat",
          "/favorite-tutors",
          "/favorite-posts",
          "/recommended-tutors",
          "/recommended-posts",
          "/settings",

          // Tiếng việt
          "/dang-nhap",
          "/dang-ky",
          "/quen-mat-khau",
          "/dat-lai-mat-khau",
          "/ho-so",
          "/don-hang/",
          "/lop-hoc-cua-toi",
          "/yeu-cau-cua-toi",
          "/lich-dat-cua-toi",
          "/thoi-khoa-bieu",
          "/thong-bao",
          "/tin-nhan",
          "/gia-su-da-luu",
          "/lop-hoc-da-luu",
          "/gia-su-phu-hop",
          "/lop-hoc-phu-hop",
          "/cai-dat",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}