import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "@/lib/auth/session";
import type { ApiResponse } from "@/lib/types/api";
import type { LoginResponse } from "@/lib/types/api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3131/api/v1";

export class ApiError extends Error {
  code: number;
  errorCode?: string;

  constructor(message: string, code: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.errorCode = errorCode;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  params?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const base = API_BASE.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let url = path.startsWith("http") ? path : `${base}${normalizedPath}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }
    const query = searchParams.toString();
    if (query) {
      url += `${url.includes("?") ? "&" : "?"}${query}`;
    }
  }

  return url;
}

function isSuccessStatus(status?: string) {
  const envelopeStatus = (status || "").toUpperCase();
  return envelopeStatus === "OK" || envelopeStatus === "SUCCESS";
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Invalid response from server", response.status);
  }
}

async function requestRefreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(buildUrl("/refresh-token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const body = await parseResponse<LoginResponse>(response);
  if (!response.ok || !isSuccessStatus(body.status)) {
    return null;
  }

  setSession(body.data.access_token, body.data.refresh_token, body.data.user);
  return body.data.access_token;
}

function handleAuthExpired() {
  clearSession();
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (currentPath !== "/login") {
    const from = encodeURIComponent(currentPath);
    window.location.replace(`/login?from=${from}`);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, params, headers: initHeaders, ...init } = options;
  const makeRequest = async (tokenOverride?: string) => {
    const headers = new Headers(initHeaders);
    headers.set("Content-Type", "application/json");

    if (auth) {
      const token = tokenOverride ?? getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    try {
      return await fetch(buildUrl(path, params), {
        ...init,
        headers,
      });
    } catch {
      throw new ApiError(
        "Tidak dapat terhubung ke server API. Periksa koneksi jaringan atau konfigurasi API.",
        0,
      );
    }
  };

  let response: Response;
  try {
    response = await makeRequest();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "Tidak dapat terhubung ke server API. Periksa koneksi jaringan atau konfigurasi API.",
      0,
    );
  }
  let body = await parseResponse<T>(response);

  // Try refresh once on auth failure and retry original request.
  const isAuthError =
    auth &&
    (response.status === 401 ||
      (body.message || "").toLowerCase().includes("token"));
  if (isAuthError && path !== "/refresh-token" && path !== "/login") {
    const newAccessToken = await requestRefreshToken();
    if (newAccessToken) {
      response = await makeRequest(newAccessToken);
      body = await parseResponse<T>(response);
    } else {
      handleAuthExpired();
      throw new ApiError("Session expired. Silakan login ulang.", 401);
    }
  }

  if (!response.ok || !isSuccessStatus(body.status)) {
    if (auth && response.status === 401) {
      handleAuthExpired();
    }
    throw new ApiError(
      body.message || "Request failed",
      body.code ?? response.status,
      body.error_code,
    );
  }

  // Some endpoints return success with data: null and message on the envelope.
  if (body.data == null) {
    return { message: body.message } as T;
  }

  return body.data;
}
