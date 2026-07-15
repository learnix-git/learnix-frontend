import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "Deploy thì thay đổi thành URL thật";

// TODO: Làm xong nhớ kiểm tra lại

// ! sitemap.ts — define static routes for the sitemap.xml file to help search engines index the site.
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
  { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE_URL}/about-us`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.4 },
  { url: `${BASE_URL}/terms-of-service`, changeFrequency: "yearly", priority: 0.4 },

  { url: `${BASE_URL}/signin`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/signup`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/forgot-password`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${BASE_URL}/change-password`, changeFrequency: "yearly", priority: 0.3 },  
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES;
}