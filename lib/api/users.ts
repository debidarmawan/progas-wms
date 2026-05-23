import { apiRequest } from "@/lib/api/client";
import type {
  CreateUserRequest,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateUserRequest,
  UserListResponse,
} from "@/lib/types/api";

export function listUsers(params?: PaginationParams) {
  return apiRequest<PaginatedList<UserListResponse>>("/users", { params });
}

export function getUser(id: string) {
  return apiRequest<UserListResponse>(`/users/${id}`);
}

export function createUser(payload: CreateUserRequest) {
  return apiRequest<MessageResponse>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id: string, payload: UpdateUserRequest) {
  return apiRequest<MessageResponse>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string) {
  return apiRequest<MessageResponse>(`/users/${id}`, {
    method: "DELETE",
  });
}
