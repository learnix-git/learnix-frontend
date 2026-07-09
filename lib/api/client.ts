import axios, { AxiosHeaders } from "axios";
import {
  ClearSession,
  GetToken,
  SaveSession,
  GetRequestId,
  LOGIN_PATH,
  SaveRequestId,
} from "@/lib/auth/session";

let refreshing = false;

type PendingEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
const PendingRequests: PendingEntry[] = [];

export class RefreshEndpointMissingError extends Error {
  constructor() {
    super("Refresh endpoint not implemented");
    this.name = "RefreshEndpointMissingError";
  }
}

export class RefreshFailedError extends Error {
  constructor(message = "Refresh failed") {
    super(message);
    this.name = "RefreshFailedError";
  }
}

async function doRefresh(): Promise<string> {
  try {
    const res = await axios.post<{ token?: string; accessToken?: string }>(
      "/api/v1/u/refresh-token",
      {},
      { withCredentials: true },
    );
    const newToken = res.data?.token ?? res.data?.accessToken ?? "";
    if (!newToken) throw new RefreshFailedError("Refresh returned empty token");
    return newToken;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      throw new RefreshEndpointMissingError();
    }
    throw new RefreshFailedError(err?.message || "Refresh request failed");
  }
}

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = GetToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get or create request_id (works even without login)
    let requestId = GetRequestId();
    if (!requestId) {
      requestId = SaveRequestId();
    }
    config.headers["X-Request-ID"] = requestId;
  }

  if (config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers);
    headers.delete("Content-Type");
    headers.delete("content-type");
    config.headers = headers;
  }

  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const hasToken = Boolean(GetToken());

    // ── 401 — attempt token refresh ─────────────────────────────────────
    if (status === 401 && hasToken) {
      if (!refreshing) {
        refreshing = true;

        doRefresh()
          .then((newToken) => {
            // Refresh succeeded — replay all queued requests
            PendingRequests.forEach((entry) => entry.resolve(newToken));
            PendingRequests.length = 0;
            try {
              document.cookie = `auth_token=${encodeURIComponent(
                newToken,
              )}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
              localStorage.removeItem("auth_token");
            } catch {
              /* noop */
            }
          })
          .catch((refreshErr) => {
            const queue = PendingRequests.slice();
            PendingRequests.length = 0;

            if (refreshErr instanceof RefreshEndpointMissingError) {
              console.warn(
                "[auth] refresh endpoint chưa có — giữ session, reject",
                queue.length,
                "request(s).",
              );
              queue.forEach((entry) => entry.reject(refreshErr));
              return;
            }

            if (refreshErr instanceof RefreshFailedError) {
              queue.forEach((entry) => entry.reject(refreshErr));
              ClearSession();
              window.location.href = LOGIN_PATH;
              return;
            }

            console.warn(
              "[auth] refresh lỗi không xác định — giữ session, reject",
              queue.length,
              "request(s).",
              refreshErr,
            );
            queue.forEach((entry) => entry.reject(refreshErr));
          })
          .finally(() => {
            refreshing = false;
          });
      }

      return new Promise((resolve, reject) => {
        PendingRequests.push({
          resolve: (token: string) => {
            // Retry with the new token
            const config = { ...error.config };
            config.headers = {
              ...(config.headers ?? {}),
              Authorization: `Bearer ${token}`,
            };
            client
              .request(config)
              .then(resolve)
              .catch(reject);
          },
          reject,
        });
      });
    }

    const msg =
      error.response?.data?.message || error.message || "Có lỗi xảy ra";
    return Promise.reject(new Error(msg));
  },
);

export default client;