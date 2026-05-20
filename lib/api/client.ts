import { getAccessToken } from "@/lib/auth/session";
import type { ApiResponse } from "@/lib/types/api";

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
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE}${path}`,
  );
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, params, headers: initHeaders, ...init } = options;
  const headers = new Headers(initHeaders);
  headers.set("Content-Type", "application/json");

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers,
  });

  let body: ApiResponse<T>;
  try {
    body = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Invalid response from server", response.status);
  }

  // Backend (Go) uses status "OK" on success; keep "success" for compatibility.
  const envelopeStatus = (body.status || "").toUpperCase();
  const isSuccess =
    envelopeStatus === "OK" || envelopeStatus === "SUCCESS";

  if (!response.ok || !isSuccess) {
    throw new ApiError(
      body.message || "Request failed",
      body.code ?? response.status,
      body.error_code,
    );
  }

  return body.data;
}
