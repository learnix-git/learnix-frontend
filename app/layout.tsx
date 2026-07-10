import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ChatProvider } from "@/components/providers/ChatProvider";
import { ChatStatus } from "@/components/chat/ChatStatus";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Sonner";
import { Hydrate } from "@/lib/stores/auth";
import { Be_Vietnam_Pro } from "next/font/google";
import type { Metadata } from "next";
import Support from "@/components/layout/Support";
import "./globals.css";

const vietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000/api/v1";

export const metadata: Metadata = {
  title: {
    default: "Learnix ",
    template: "%s — Learnix",
  },
  description:
    "Đơn giản hóa việc giảng dạy và học tập với nền tảng quản lý lớp học trực tuyến nhanh chóng, tiện lợi và hiệu quả.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
    languages: {
      vi: "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Learnix",
    title: "Learnix",
    description:
      "Hệ thống quản lý lớp học và học tập đỉnh cao dành cho giáo viên và học sinh.",
    url: BASE_URL,
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Learnix",
      },
    ],
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learnix",
    description:
      "Hệ thống quản lý lớp học và học tập đỉnh cao dành cho giáo viên và học sinh.",
    images: ["/images/og-default.png"],
  },
  icons: {
    icon: "/images/logo/logo-favicon.png",
    shortcut: "/images/logo/logo-favicon.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={vietnam.variable} suppressHydrationWarning>
      <head />
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Hydrate>
            <ChatProvider>
              <ChatStatus />
                <Toaster
                  position="top-right"
                  style={{ marginTop: "4.5rem" }}
                  toastOptions={{
                    className: "font-sans text-slate-800 dark:text-slate-200",
                  }}
                />
                <Header />
                  <main className="relative min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-background font-sans">
                    
                  {/* Glow Effects - Aura Gradient */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-15%] left-[-15%] w-[65%] h-[60%] bg-blue-500/25 rounded-full blur-[var(--glow-blur)] opacity-50 dark:bg-primary/30 dark:opacity-60 animate-blob" />
                    <div className="absolute top-[10%] right-[-10%] w-[60%] h-[55%] bg-sky-400/20 rounded-full blur-[var(--glow-blur)] opacity-40 dark:bg-purple-600/20 dark:opacity-50 animate-blob animation-delay-2000" />
                    <div className="absolute bottom-[-15%] left-[5%] w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-[var(--glow-blur)] opacity-40 dark:bg-blue-600/20 dark:opacity-50 animate-blob animation-delay-4000" />
                  </div>

                  <div className="relative z-10">
                    {children}
                  </div>
                  <div className="relative z-20">
                    <Support />
                  </div>
                </main>
              <Footer />
            </ChatProvider>
          </Hydrate>
        </ThemeProvider>
      </body>
    </html>
  );
}