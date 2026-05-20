import { apiRequest } from "@/lib/api/client";
import type {
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RefreshTokenRequest,
} from "@/lib/types/api";

export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export function logout() {
  return apiRequest<MessageResponse>("/logout", { method: "POST" });
}

export function refreshToken(payload: RefreshTokenRequest) {
  return apiRequest<LoginResponse>("/refresh-token", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}
