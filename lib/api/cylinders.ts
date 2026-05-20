import { apiRequest } from "@/lib/api/client";
import type {
  CreateCylinderRequest,
  CylinderResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
} from "@/lib/types/api";

export function listCylinders(params?: PaginationParams) {
  return apiRequest<PaginatedList<CylinderResponse>>("/cylinders", { params });
}

export function getCylinder(id: string) {
  return apiRequest<CylinderResponse>(`/cylinders/${id}`);
}

export function createCylinder(payload: CreateCylinderRequest) {
  return apiRequest<MessageResponse>("/cylinders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
