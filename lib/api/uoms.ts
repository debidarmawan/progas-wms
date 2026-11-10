import { apiRequest } from "@/lib/api/client";
import type {
  CreateUomRequest,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UomResponse,
  UpdateUomRequest,
} from "@/lib/types/api";

export function listUoms(params?: PaginationParams) {
  return apiRequest<PaginatedList<UomResponse>>("/uoms", { params });
}

export function getUom(id: string) {
  return apiRequest<UomResponse>(`/uoms/${id}`);
}

export function createUom(payload: CreateUomRequest) {
  return apiRequest<MessageResponse>("/uoms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUom(id: string, payload: UpdateUomRequest) {
  return apiRequest<MessageResponse>(`/uoms/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUom(id: string) {
  return apiRequest<MessageResponse>(`/uoms/${id}`, {
    method: "DELETE",
  });
}
