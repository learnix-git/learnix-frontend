// * Accept * //

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  const app = process.env.NEXT_PUBLIC_APP_URL;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const is_local = host?.includes("localhost");
  const baseUrl = app && !is_local ? app : `${protocol}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", baseUrl));
  }

  return NextResponse.redirect(
    new URL(`/auth/google-callback?code=${encodeURIComponent(code)}`, baseUrl)
  );
}