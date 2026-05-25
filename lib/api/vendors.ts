import { apiRequest } from "@/lib/api/client";
import type {
  CreateVendorRequest,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateVendorRequest,
  VendorDetailResponse,
  VendorResponse,
} from "@/lib/types/api";

export function listVendors(params?: PaginationParams) {
  return apiRequest<PaginatedList<VendorResponse>>("/vendors", { params });
}

export function getVendor(id: string) {
  return apiRequest<VendorDetailResponse>(`/vendors/${id}`);
}

export function createVendor(payload: CreateVendorRequest) {
  return apiRequest<VendorResponse>("/vendors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateVendor(id: string, payload: UpdateVendorRequest) {
  return apiRequest<MessageResponse>(`/vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteVendor(id: string) {
  return apiRequest<MessageResponse>(`/vendors/${id}`, {
    method: "DELETE",
  });
}
