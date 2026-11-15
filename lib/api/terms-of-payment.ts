import { apiRequest } from "@/lib/api/client";
import type {
  CreateTermOfPaymentRequest,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  TermOfPaymentResponse,
  UpdateTermOfPaymentRequest,
} from "@/lib/types/api";

export function listTermOfPayments(params?: PaginationParams) {
  return apiRequest<PaginatedList<TermOfPaymentResponse>>("/terms-of-payment", {
    params,
  });
}

export function getTermOfPayment(id: string) {
  return apiRequest<TermOfPaymentResponse>(`/terms-of-payment/${id}`);
}

export function createTermOfPayment(payload: CreateTermOfPaymentRequest) {
  return apiRequest<MessageResponse>("/terms-of-payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTermOfPayment(
  id: string,
  payload: UpdateTermOfPaymentRequest,
) {
  return apiRequest<MessageResponse>(`/terms-of-payment/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTermOfPayment(id: string) {
  return apiRequest<MessageResponse>(`/terms-of-payment/${id}`, {
    method: "DELETE",
  });
}
