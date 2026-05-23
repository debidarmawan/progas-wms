import { apiRequest } from "@/lib/api/client";
import type {
  CreateFleetRequest,
  FleetResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateFleetRequest,
} from "@/lib/types/api";

export function listFleet(params?: PaginationParams) {
  return apiRequest<PaginatedList<FleetResponse>>("/logistics/fleet", {
    params,
  });
}

export function getFleet(id: string) {
  return apiRequest<FleetResponse>(`/logistics/fleet/${id}`);
}

export function createFleet(payload: CreateFleetRequest) {
  return apiRequest<FleetResponse>("/logistics/fleet", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateFleet(id: string, payload: UpdateFleetRequest) {
  return apiRequest<MessageResponse>(`/logistics/fleet/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
