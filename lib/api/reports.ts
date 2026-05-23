import { apiRequest } from "@/lib/api/client";
import type {
  StockLedgerReportResponse,
  TurnaroundReportResponse,
} from "@/lib/types/api";

export function getStockLedger(barcode: string) {
  return apiRequest<StockLedgerReportResponse>("/reports/stock-ledger", {
    params: { barcode },
  });
}

export function getTurnaroundReport(params?: {
  from?: string;
  to?: string;
}) {
  return apiRequest<TurnaroundReportResponse>("/reports/turnaround", {
    params,
  });
}
