import type { NextConfig } from "next";

const vietnameseRouteRewrites = [
  { source: "/gioi-thieu", destination: "/about-us" },
  { source: "/tim-gia-su", destination: "/find-tutors" },
  { source: "/tim-gia-su/mon-hoc/:slug", destination: "/find-tutors?subject=:slug" },
  { source: "/tim-gia-su/khu-vuc/:slug", destination: "/find-tutors?location=:slug" },
  { source: "/tim-lop-hoc", destination: "/find-posts" },
  { source: "/tim-lop-hoc/mon-hoc/:slug", destination: "/find-posts?subject=:slug" },
  { source: "/tim-lop-hoc/khu-vuc/:slug", destination: "/find-posts?location=:slug" },
  { source: "/lop-hoc/:slug", destination: "/requests/:slug" },
  { source: "/gia-su/:slug", destination: "/tutor/:slug" },
  { source: "/dang-tin-gia-su", destination: "/tutor-post" },
  { source: "/dang-tin-tim-gia-su", destination: "/client-post" },
  { source: "/dang-nhap", destination: "/signin" },
  { source: "/dang-ky", destination: "/signup" },
  { source: "/quen-mat-khau", destination: "/forgot-password" },
  { source: "/dat-lai-mat-khau", destination: "/reset-password" },
  { source: "/ho-so", destination: "/profile" },
  { source: "/don-hang", destination: "/order" },
  { source: "/don-hang/:code", destination: "/order/:code" },
  { source: "/lop-hoc-cua-toi", destination: "/my-posts" },
  { source: "/yeu-cau-cua-toi", destination: "/my-requests" },
  { source: "/lich-dat-cua-toi", destination: "/my-bookings" },
  { source: "/thoi-khoa-bieu", destination: "/my-schedule" },
  { source: "/thong-bao", destination: "/notifications" },
  { source: "/tin-nhan", destination: "/chat" },
  { source: "/gia-su-da-luu", destination: "/favorite-tutors" },
  { source: "/lop-hoc-da-luu", destination: "/favorite-posts" },
  { source: "/gia-su-phu-hop", destination: "/recommended-tutors" },
  { source: "/lop-hoc-phu-hop", destination: "/recommended-posts" },
  { source: "/dieu-khoan-dich-vu", destination: "/terms-of-service" },
  { source: "/chinh-sach-bao-mat", destination: "/privacy-policy" },
  { source: "/cai-dat", destination: "/settings" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      ...vietnameseRouteRewrites,
    ];
  },
};

export default nextConfig;