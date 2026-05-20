import type { UserResponse } from "@/lib/types/api";
import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
} from "@/lib/auth/constants";

function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ACCESS_TOKEN_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function getStoredUser(): UserResponse | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${USER_COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(
      decodeURIComponent(match.split("=").slice(1).join("=")),
    ) as UserResponse;
  } catch {
    return null;
  }
}

export function setSession(
  accessToken: string,
  refreshToken: string,
  user: UserResponse,
) {
  setCookie(ACCESS_TOKEN_COOKIE, accessToken);
  setCookie(REFRESH_TOKEN_COOKIE, refreshToken);
  setCookie(USER_COOKIE, JSON.stringify(user));
}

export function clearSession() {
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
  deleteCookie(USER_COOKIE);
}
