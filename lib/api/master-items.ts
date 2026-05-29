import { apiRequest } from "@/lib/api/client";
import type {
  BulkCreateMasterItemRequest,
  CreateMasterItemRequest,
  MasterItemResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateMasterItemRequest,
} from "@/lib/types/api";

export function listMasterItems(params?: PaginationParams) {
  return apiRequest<PaginatedList<MasterItemResponse>>("/master-items", {
    params,
  });
}

export function getMasterItem(id: string) {
  return apiRequest<MasterItemResponse>(`/master-items/${id}`);
}

export function createMasterItem(payload: CreateMasterItemRequest) {
  return apiRequest<MessageResponse>("/master-items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createMasterItemsBulk(payload: BulkCreateMasterItemRequest) {
  return apiRequest<MessageResponse>("/master-items/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMasterItem(id: string, payload: UpdateMasterItemRequest) {
  return apiRequest<MessageResponse>(`/master-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
