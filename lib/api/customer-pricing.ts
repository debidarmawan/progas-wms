import { apiRequest } from "@/lib/api/client";
import type {
  CreateCustomerItemPriceRequest,
  CustomerItemPriceResponse,
  MasterItemResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
} from "@/lib/types/api";

export function listCustomerPricing(
  customerId: string,
  params?: PaginationParams,
) {
  return apiRequest<PaginatedList<CustomerItemPriceResponse>>(
    `/customers/${customerId}/pricing`,
    { params },
  );
}

export function resolveCustomerItemPrice(customerId: string, masterItemId: string) {
  return apiRequest<CustomerItemPriceResponse>(
    `/customers/${customerId}/items/${masterItemId}/pricing`,
  );
}

export function createCustomerPrice(
  customerId: string,
  payload: CreateCustomerItemPriceRequest,
) {
  return apiRequest<MessageResponse>(`/customers/${customerId}/pricing`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomerPrice(customerId: string, priceId: string) {
  return apiRequest<MessageResponse>(
    `/customers/${customerId}/pricing/${priceId}`,
    { method: "DELETE" },
  );
}

export function listPricingMasterItems(search = "") {
  return apiRequest<PaginatedList<MasterItemResponse>>("/master-items", {
    params: { page: 1, limit: 10, search: search || undefined },
  });
}