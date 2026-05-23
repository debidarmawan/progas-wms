import { apiRequest } from "@/lib/api/client";
import type {
  DeliveryOrderResponse,
  ExchangeResponse,
  IssueDeliveryOrderRequest,
  PaginatedList,
  PaginationParams,
  ProcessExchangeRequest,
} from "@/lib/types/api";

export function listDeliveryOrders(params?: PaginationParams) {
  return apiRequest<PaginatedList<DeliveryOrderResponse>>(
    "/outbound/delivery-orders",
    { params },
  );
}

export function getDeliveryOrder(id: string) {
  return apiRequest<DeliveryOrderResponse>(`/outbound/delivery-orders/${id}`);
}

export function issueDeliveryOrder(payload: IssueDeliveryOrderRequest) {
  return apiRequest<DeliveryOrderResponse>("/outbound/delivery-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function processExchange(payload: ProcessExchangeRequest) {
  return apiRequest<ExchangeResponse>("/outbound/exchange", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
