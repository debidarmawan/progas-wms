import { apiRequest } from "@/lib/api/client";
import type {
  BarcodeListRequest,
  BarcodeOperationResponse,
} from "@/lib/types/api";

export function emptyReceive(payload: BarcodeListRequest) {
  return apiRequest<BarcodeOperationResponse>("/inbound/empty-receive", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
