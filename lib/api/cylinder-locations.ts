import { apiRequest } from "@/lib/api/client";
import type {
  CreateCylinderLocationRequest,
  CylinderLocationResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateCylinderLocationRequest,
} from "@/lib/types/api";

export function listCylinderLocations(params?: PaginationParams) {
  return apiRequest<PaginatedList<CylinderLocationResponse>>(
    "/cylinder-locations",
    { params },
  );
}

export function getCylinderLocation(id: string) {
  return apiRequest<CylinderLocationResponse>(`/cylinder-locations/${id}`);
}

export function createCylinderLocation(
  payload: CreateCylinderLocationRequest,
) {
  return apiRequest<MessageResponse>("/cylinder-locations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCylinderLocation(
  id: string,
  payload: UpdateCylinderLocationRequest,
) {
  return apiRequest<MessageResponse>(`/cylinder-locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCylinderLocation(id: string) {
  return apiRequest<MessageResponse>(`/cylinder-locations/${id}`, {
    method: "DELETE",
  });
}
