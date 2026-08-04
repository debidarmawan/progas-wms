import { apiRequest } from "@/lib/api/client";
import type {
  CreateDriverRequest,
  CreateFleetRequest,
  DriverResponse,
  FleetResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateDriverRequest,
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

export function listDrivers(params?: PaginationParams) {
  return apiRequest<PaginatedList<DriverResponse>>("/logistics/drivers", {
    params,
  });
}

export function getDriver(id: string) {
  return apiRequest<DriverResponse>(`/logistics/drivers/${id}`);
}

export function createDriver(payload: CreateDriverRequest) {
  return apiRequest<DriverResponse>("/logistics/drivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDriver(id: string, payload: UpdateDriverRequest) {
  return apiRequest<MessageResponse>(`/logistics/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDriver(id: string) {
  return apiRequest<MessageResponse>(`/logistics/drivers/${id}`, {
    method: "DELETE",
  });
}
