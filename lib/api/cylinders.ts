import { apiRequest } from "@/lib/api/client";
import type {
  CreateCylinderRequest,
  CylinderHistoryResponse,
  CylinderLabel,
  CylinderResponse,
  CylinderScanMenu,
  CylinderScanResponse,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateCylinderRequest,
} from "@/lib/types/api";

export function listCylinders(params?: PaginationParams) {
  return apiRequest<PaginatedList<CylinderResponse>>("/cylinders", { params });
}

export function getCylinder(id: string) {
  return apiRequest<CylinderResponse>(`/cylinders/${id}`);
}

export function getCylinderByBarcode(sn: string) {
  return apiRequest<CylinderResponse>(
    `/cylinders/by-barcode/${encodeURIComponent(sn)}`,
  );
}

export function getCylinderHistory(id: string) {
  return apiRequest<CylinderHistoryResponse>(`/cylinders/${id}/history`);
}

export function createCylinder(payload: CreateCylinderRequest) {
  return apiRequest<CylinderResponse>("/cylinders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resolveCylinderScan(sn: string, menu: CylinderScanMenu) {
  return apiRequest<CylinderScanResponse>(
    `/cylinders/scan/${encodeURIComponent(sn)}`,
    { params: { menu } },
  );
}

export function listCylinderLabels(params: {
  ids?: string;
  labeled?: "true" | "false";
  limit?: number;
}) {
  return apiRequest<CylinderLabel[]>("/cylinders/labels", {
    params: { ...params, format: "json" },
  });
}

export function markCylinderLabelsPrinted(ids: string[]) {
  return apiRequest<MessageResponse>("/cylinders/labels/printed", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function updateCylinder(id: string, payload: UpdateCylinderRequest) {
  return apiRequest<MessageResponse>(`/cylinders/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
