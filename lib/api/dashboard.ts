import { apiRequest } from "@/lib/api/client";
import type { DashboardSummaryResponse } from "@/lib/types/api";

export function getDashboardSummary() {
  return apiRequest<DashboardSummaryResponse>("/dashboard/summary");
}
