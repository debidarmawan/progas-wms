import { apiRequest } from "@/lib/api/client";
import type {
  CreateCustomerPORequest,
  CreateSalesOrderRequest,
  CustomerPOResponse,
  PaginatedList,
  PaginationParams,
  SalesOrderResponse,
} from "@/lib/types/api";

export function listCustomerPOs(params?: PaginationParams) {
  return apiRequest<PaginatedList<CustomerPOResponse>>("/sales/customer-pos", { params });
}

export function getCustomerPO(id: string) {
  return apiRequest<CustomerPOResponse>(`/sales/customer-pos/${id}`);
}

export function createCustomerPO(payload: CreateCustomerPORequest) {
  return apiRequest<CustomerPOResponse>("/sales/customer-pos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmCustomerPO(id: string) {
  return apiRequest<CustomerPOResponse>(`/sales/customer-pos/${id}/confirm`, { method: "PUT" });
}

export function listSalesOrders(params?: PaginationParams) {
  return apiRequest<PaginatedList<SalesOrderResponse>>("/sales/sales-orders", { params });
}

export function getSalesOrder(id: string) {
  return apiRequest<SalesOrderResponse>(`/sales/sales-orders/${id}`);
}

export function createSalesOrder(payload: CreateSalesOrderRequest) {
  return apiRequest<SalesOrderResponse>("/sales/sales-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmSalesOrder(id: string) {
  return apiRequest<SalesOrderResponse>(`/sales/sales-orders/${id}/confirm`, { method: "PUT" });
}

export function cancelSalesOrder(id: string) {
  return apiRequest<SalesOrderResponse>(`/sales/sales-orders/${id}/cancel`, { method: "PUT" });
}