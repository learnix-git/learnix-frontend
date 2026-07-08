const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const SCOPES = ["email", "profile"].join(" ");

export function get() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/api/auth/callback/google`,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function sign() {
  window.location.href = get();
}