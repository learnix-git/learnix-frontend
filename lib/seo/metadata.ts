import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://learnix.edu.vn";

const SITE_NAME = "Learnix";
const SITE_DESCRIPTION =
  "Khám phá và tham gia các lớp học chất lượng cao. Nền tảng kết nối giáo dục và quản lý không gian học tập trực tuyến thông minh dành cho giảng viên và học viên.";
const DEFAULT_IMAGE = "/images/og-default.png";

interface BuildMetadataOptions {
  /** Page title — appended after SITE_NAME if provided. */
  title?: string | undefined;
  /** Meta description override. Falls back to SITE_DESCRIPTION. */
  description?: string | undefined;
  /** Absolute URL path (e.g. "/find-classrooms"). Used to build canonical + og:url. */
  path?: string | undefined;
  /** Override og:image. Defaults to DEFAULT_IMAGE. */
  image?: string | undefined;
  /** Additional Metadata type overrides (e.g. "website", "profile"). */
  type?: "website" | "article" | "profile";
  /** Additional keywords for the <meta name="keywords"> tag. Appended to base keywords. */
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

/**
 * buildMetadata — helper for per-route `generateMetadata` calls.
 *
 * Usage:
 *   export function generateMetadata({ params }: Props) {
 *     return buildMetadata({ title: "Khám phá lớp học", path: "/find-classrooms" });
 *   }
 *
 * The function always returns the full Metadata object so callers don't
 * need to handle the "partial Metadata override" pattern — it merges with
 * the root layout metadata automatically through Next.js metadata
 * inheritance, but returns a complete object for type safety.
 */
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