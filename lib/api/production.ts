import { apiRequest } from "@/lib/api/client";
import type {
  BarcodeListRequest,
  BarcodeOperationResponse,
  FillingBatchResponse,
  PaginatedList,
  PaginationParams,
  SubmitFillingBatchRequest,
} from "@/lib/types/api";

export function listFillingBatches(params?: PaginationParams) {
  return apiRequest<PaginatedList<FillingBatchResponse>>(
    "/production/filling-batches",
    { params },
  );
}

export function getFillingBatch(id: string) {
  return apiRequest<FillingBatchResponse>(
    `/production/filling-batches/${id}`,
  );
}

export function submitFillingBatch(payload: SubmitFillingBatchRequest) {
  return apiRequest<FillingBatchResponse>("/production/filling-batches", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function preFillQc(payload: BarcodeListRequest) {
  return apiRequest<BarcodeOperationResponse>("/production/qc/pre-fill", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
