import { apiRequest } from "@/lib/api/client";
import type {
  CreateCustomerSiteRequest,
  CustomerSiteResponse,
  MessageResponse,
  UpdateCustomerSiteRequest,
} from "@/lib/types/api";

export function listCustomerSites(customerId: string) {
  return apiRequest<{ items: CustomerSiteResponse[] }>(
    `/customers/${customerId}/sites`,
  );
}

export function createCustomerSite(
  customerId: string,
  payload: CreateCustomerSiteRequest,
) {
  return apiRequest<MessageResponse>(`/customers/${customerId}/sites`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCustomerSite(
  customerId: string,
  id: string,
  payload: UpdateCustomerSiteRequest,
) {
  return apiRequest<MessageResponse>(`/customers/${customerId}/sites/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomerSite(customerId: string, id: string) {
  return apiRequest<MessageResponse>(`/customers/${customerId}/sites/${id}`, {
    method: "DELETE",
  });
}
