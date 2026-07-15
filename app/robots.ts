import type { MetadataRoute } from "next";

// TODO
const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "Deploy thì thay đổi thành URL thật";

// ! robots.ts — allow all crawlers while disallowing API paths, static assets, and auth routes to keep crawlers focused on public content.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",                  
          "/contact",           
          "/about-us",          
          "/privacy-policy",    
          "/terms-of-service", 
        ],
        disallow: [
          "/api/",              
          "/_next/",          
        
          "/signin",
          "/signup",
          "/forgot-password",
          "/change-password",
          "/classrooms/",
          "/dashboard/",               
          "/banks/",            
          "/exams/",           
          "/scores",                   
          "/plans/",            
          "/profile/",          
          "/messages",
          "/submissions",          
          "/notifications",    
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}