import { apiRequest } from "@/lib/api/client";
import type {
  CreateWorkOrderRequest,
  HydrotestDueResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  RecordHydrotestRequest,
  WorkOrderResponse,
} from "@/lib/types/api";

export function listWorkOrders(params?: PaginationParams) {
  return apiRequest<PaginatedList<WorkOrderResponse>>(
    "/maintenance/work-orders",
    { params },
  );
}

export function getWorkOrder(id: string) {
  return apiRequest<WorkOrderResponse>(`/maintenance/work-orders/${id}`);
}

export function createWorkOrder(payload: CreateWorkOrderRequest) {
  return apiRequest<WorkOrderResponse>("/maintenance/work-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeWorkOrder(id: string) {
  return apiRequest<MessageResponse>(
    `/maintenance/work-orders/${id}/complete`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export function listHydrotestDue(params?: { days?: number }) {
  return apiRequest<HydrotestDueResponse>("/maintenance/hydrotest/due", {
    params,
  });
}

export function recordHydrotest(
  cylinderId: string,
  payload: RecordHydrotestRequest,
) {
  return apiRequest<MessageResponse>(
    `/maintenance/cylinders/${cylinderId}/hydrotest`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
