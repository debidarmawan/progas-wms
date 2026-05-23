import { apiRequest } from "@/lib/api/client";
import type {
  PaginatedList,
  PaginationParams,
  RoleResponse,
} from "@/lib/types/api";

export function listRoles(params?: PaginationParams) {
  return apiRequest<PaginatedList<RoleResponse>>("/roles/", { params });
}

export function getRole(id: string) {
  return apiRequest<RoleResponse>(`/roles/${id}`);
}
