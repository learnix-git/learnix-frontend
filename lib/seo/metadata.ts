import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://learnix.io.vn";

const SITE_NAME = "Learnix";
const SITE_DESCRIPTION =
  "Khám phá và tham gia các lớp học chất lượng cao. Nền tảng kết nối giáo dục và quản lý không gian học tập trực tuyến thông minh dành cho giảng viên và học viên.";
const DEFAULT_IMAGE = "/images/og-default.png";

interface BuildMetadataOptions {
  title?: string | undefined;
  description?: string | undefined;
  path?: string | undefined;
  image?: string | undefined;
  type?: "website" | "article" | "profile";
  keywords?: string[] | undefined;
}

const BASE_KEYWORDS = [
  "học trực tuyến",
  "quản lý lớp học",
  "tìm lớp học",
  "giáo dục",
  "e-learning",
  "Việt Nam",
  "Learnix",
];

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image,
  type = "website",
  keywords,
}: BuildMetadataOptions = {}): Metadata {
  const url = path ? `${BASE_URL}${path}` : BASE_URL;
  const ogImage = image ?? DEFAULT_IMAGE;

  return {
    title: title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Nền tảng học tập thông minh`,
    description,
    keywords: keywords ? [...BASE_KEYWORDS, ...keywords] : BASE_KEYWORDS,
    alternates: {
      canonical: url,
      languages: {
        vi: `${url}`,
      },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title: title ? `${title} — ${SITE_NAME}` : SITE_NAME,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} — ${SITE_NAME}` : SITE_NAME,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}