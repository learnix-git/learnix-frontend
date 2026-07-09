import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "Deploy thì thay đổi thành URL thật";

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

  { url: `${BASE_URL}/dashboard/teacher`, changeFrequency: "daily", priority: 0.8 }, 
  { url: `${BASE_URL}/dashboard/student`, changeFrequency: "daily", priority: 0.8 }, 

  { url: `${BASE_URL}/classrooms`, changeFrequency: "daily", priority: 0.9 }, 
  { url: `${BASE_URL}/classrooms/edit`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/classrooms/detail`, changeFrequency: "daily", priority: 0.7 },
  { url: `${BASE_URL}/classrooms/create`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/classrooms/schedule`, changeFrequency: "daily", priority: 0.7 }, 

  { url: `${BASE_URL}/banks`, changeFrequency: "daily", priority: 0.8 },            
  { url: `${BASE_URL}/banks/create`, changeFrequency: "monthly", priority: 0.6 },  
  { url: `${BASE_URL}/banks/edit`, changeFrequency: "monthly", priority: 0.6 },   

  { url: `${BASE_URL}/exams`, changeFrequency: "daily", priority: 0.8 },             
  { url: `${BASE_URL}/exams/create`, changeFrequency: "weekly", priority: 0.7 },  
  { url: `${BASE_URL}/exams/edit`, changeFrequency: "weekly", priority: 0.7 },   

  { url: `${BASE_URL}/scores`, changeFrequency: "daily", priority: 0.7 },
  { url: `${BASE_URL}/submissions`, changeFrequency: "daily", priority: 0.8 },                 

  { url: `${BASE_URL}/plans`, changeFrequency: "daily", priority: 0.7 },            
  { url: `${BASE_URL}/plans/create`, changeFrequency: "weekly", priority: 0.6 },  
  { url: `${BASE_URL}/plans/edit`, changeFrequency: "weekly", priority: 0.6 },  

  { url: `${BASE_URL}/profile`, changeFrequency: "weekly", priority: 0.7 },         
  { url: `${BASE_URL}/profile/create`, changeFrequency: "monthly", priority: 0.5 }, 
  { url: `${BASE_URL}/profile/edit`, changeFrequency: "monthly", priority: 0.5 }, 

  { url: `${BASE_URL}/messages`, changeFrequency: "daily", priority: 0.8 }, 
  { url: `${BASE_URL}/notifications`, changeFrequency: "daily", priority: 0.6 },     
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES;
}