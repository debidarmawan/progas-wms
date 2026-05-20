import { apiRequest } from "@/lib/api/client";
import type {
  CreateCustomerRequest,
  CustomerResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateCustomerRequest,
} from "@/lib/types/api";

export function listCustomers(params?: PaginationParams) {
  return apiRequest<PaginatedList<CustomerResponse>>("/customers", { params });
}

export function getCustomer(id: string) {
  return apiRequest<CustomerResponse>(`/customers/${id}`);
}

export function createCustomer(payload: CreateCustomerRequest) {
  return apiRequest<MessageResponse>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCustomer(id: string, payload: UpdateCustomerRequest) {
  return apiRequest<MessageResponse>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
