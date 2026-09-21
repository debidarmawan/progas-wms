import { apiRequest } from "@/lib/api/client";
import type {
  InvoiceResponse,
  PaginatedList,
  PaginationParams,
  RecordPaymentRequest,
} from "@/lib/types/api";

export function listInvoices(params?: PaginationParams) {
  return apiRequest<PaginatedList<InvoiceResponse>>("/finance/invoices", { params });
}

export function getInvoice(id: string) {
  return apiRequest<InvoiceResponse>(`/finance/invoices/${id}`);
}

export function recordPayment(invoiceId: string, payload: RecordPaymentRequest) {
  return apiRequest<InvoiceResponse>(`/finance/invoices/${invoiceId}/payments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
