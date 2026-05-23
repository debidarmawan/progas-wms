import { apiRequest } from "@/lib/api/client";
import type {
  StockOpnameRequest,
  StockOpnameResponse,
  VirtualWarehouseResponse,
} from "@/lib/types/api";

export function getVirtualWarehouse() {
  return apiRequest<VirtualWarehouseResponse>("/inventory/virtual-warehouse");
}

export function submitStockOpname(payload: StockOpnameRequest) {
  return apiRequest<StockOpnameResponse>(
    "/inventory/spareparts/stock-opname",
    { method: "POST", body: JSON.stringify(payload) },
  );
}
