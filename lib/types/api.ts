export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  error_code?: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedList<T> {
  items: T[];
  meta: PaginationMeta;
}

export type PaginationParams = Record<string, string | number | undefined> & {
  page?: number;
  limit?: number;
  search?: string;
};

export interface MessageResponse {
  message: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role_id: string;
  role_name: string;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expired_at: string;
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface MasterItemResponse {
  id: string;
  name: string;
  sku: string;
  gas_type?: string;
  is_serialized: boolean;
  empty_weight_kg?: number;
  gas_weight_kg?: number;
  min_stock_alert?: number;
  max_days_at_customer?: number;
  stock_quantity?: number;
}

export interface CreateMasterItemRequest {
  name: string;
  sku: string;
  gas_type?: string;
  is_serialized?: boolean;
  empty_weight_kg?: number;
  gas_weight_kg?: number;
  min_stock_alert?: number;
  max_days_at_customer?: number;
}

export interface BulkCreateMasterItemRequest {
  items: CreateMasterItemRequest[];
}

export interface UpdateMasterItemRequest {
  name: string;
  gas_type?: string;
  empty_weight_kg?: number;
  gas_weight_kg?: number;
  min_stock_alert?: number;
  max_days_at_customer?: number;
}

export interface CylinderResponse {
  id: string;
  barcode_sn: string;
  item_id: string;
  item_name?: string;
  gas_type?: string;
  ownership_type: string;
  owner_id?: string;
  status: string;
  last_hydrotest_date?: string;
  remarks?: string;
}

export interface CreateCylinderRequest {
  barcode_sn: string;
  item_id: string;
  ownership_type: string;
  owner_id?: string;
  last_hydrotest_date: string;
  remarks?: string;
}

export interface UpdateCylinderRequest {
  barcode_sn: string;
  item_id: string;
  ownership_type: string;
  owner_id?: string;
  last_hydrotest_date: string;
  remarks?: string;
}

export interface CustomerResponse {
  id: string;
  code: string;
  name: string;
  pic?: string;
  npwp?: string;
  fax?: string;
  email?: string;
  phone?: string;
  address?: string;
  cylinder_quota_limit?: number;
  outstanding_count?: number;
  is_active?: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  pic?: string;
  npwp?: string;
  fax?: string;
  email?: string;
  phone?: string;
  address?: string;
  cylinder_quota_limit?: number;
}

export interface UpdateCustomerRequest {
  name: string;
  pic?: string;
  npwp?: string;
  fax?: string;
  email?: string;
  phone?: string;
  address?: string;
  cylinder_quota_limit?: number;
  is_active?: boolean;
}

export interface FillingBatchDetailResponse {
  id: string;
  cylinder_id: string;
  barcode_sn: string;
}

export interface FillingBatchResponse {
  id: string;
  batch_number: string;
  item_id: string;
  item_name?: string;
  gas_type?: string;
  status: string;
  cylinder_qty: number;
  notes?: string;
  created_at?: string;
  details?: FillingBatchDetailResponse[];
}

export interface SubmitFillingBatchRequest {
  item_id: string;
  barcodes: string[];
  notes?: string;
}

export interface BarcodeListRequest {
  barcodes: string[];
}

export interface BarcodeOperationResponse {
  processed_count: number;
  barcodes: string[];
}

export interface RoleResponse {
  id: string;
  name: string;
}

export interface UserListResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role_id: string;
  role_name: string;
  is_active?: boolean;
  created_at?: string;
  last_logged_in_at?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role_id?: string;
  is_active?: boolean;
}

export interface CustomerQuotaAlert {
  customer_id: string;
  customer_code: string;
  customer_name: string;
  outstanding_count: number;
  quota_limit: number;
}

export interface LowStockSparepartAlert {
  item_id: string;
  item_name: string;
  sku: string;
  quantity: number;
  min_stock: number;
}

export interface DashboardSummaryResponse {
  total_outstanding_cylinders: number;
  cylinders_by_status: Record<string, number>;
  hydrotest_due_soon_count: number;
  hydrotest_expired_count: number;
  customers_over_quota: CustomerQuotaAlert[];
  overdue_cylinders_count: number;
  overdue_cylinders: OverdueCylinderAlert[];
  low_stock_spareparts: LowStockSparepartAlert[];
}

export interface DeliveryOrderDetailResponse {
  id: string;
  cylinder_id: string;
  barcode_sn: string;
  weight_kg?: number;
}

export interface DeliveryOrderResponse {
  id: string;
  do_number: string;
  customer_id: string;
  customer_name?: string;
  fleet_id?: string;
  plate_number?: string;
  status: string;
  cylinder_qty: number;
  total_weight_kg?: number;
  notes?: string;
  created_at?: string;
  details?: DeliveryOrderDetailResponse[];
}

export interface IssueDeliveryOrderRequest {
  customer_id: string;
  fleet_id: string;
  barcodes: string[];
  notes?: string;
}

export interface ProcessExchangeRequest {
  customer_id: string;
  in_barcodes: string[];
  out_barcodes: string[];
  force_approve?: boolean;
}

export interface ExchangeResponse {
  customer_id: string;
  in_count: number;
  out_count: number;
  in_barcodes: string[];
  out_barcodes: string[];
  outstanding_before: number;
  outstanding_after: number;
  outstanding_delta: number;
  cross_customer_alerts?: string[];
}

export interface FleetResponse {
  id: string;
  plate_number: string;
  max_weight_kg: number;
  is_active?: boolean;
}

export interface CreateFleetRequest {
  plate_number: string;
  max_weight_kg: number;
}

export interface UpdateFleetRequest {
  max_weight_kg?: number;
  is_active?: boolean;
}

export interface DriverResponse {
  id: string;
  name: string;
  phone?: string;
  license_number?: string;
  is_active?: boolean;
}

export interface CreateDriverRequest {
  name: string;
  phone?: string;
  license_number?: string;
}

export interface UpdateDriverRequest {
  name?: string;
  phone?: string;
  license_number?: string;
  is_active?: boolean;
}

export interface WorkOrderSparepartResponse {
  item_id: string;
  item_name?: string;
  sku?: string;
  quantity: number;
}

export interface WorkOrderResponse {
  id: string;
  wo_number: string;
  title: string;
  description?: string;
  status: string;
  created_at?: string;
  spareparts?: WorkOrderSparepartResponse[];
}

export interface WorkOrderSparepartLine {
  item_id: string;
  quantity: number;
}

export interface CreateWorkOrderRequest {
  title: string;
  description?: string;
  spareparts: WorkOrderSparepartLine[];
}

export interface HydrotestDueCylinder {
  id: string;
  barcode_sn: string;
  status: string;
  last_hydrotest_date?: string;
  expiry_date?: string;
  is_expired: boolean;
}

export interface HydrotestDueResponse {
  due_within_days: number;
  items: HydrotestDueCylinder[];
}

export interface RecordHydrotestRequest {
  last_hydrotest_date: string;
  notes?: string;
}

export interface VirtualWarehouseCylinder {
  barcode_sn: string;
  days_at_customer: number;
  max_days: number;
  is_overdue: boolean;
}

export interface VirtualWarehouseCustomer {
  customer_id: string;
  customer_code: string;
  customer_name: string;
  outstanding_count: number;
  overdue_count: number;
  cylinders: VirtualWarehouseCylinder[];
}

export interface VirtualWarehouseResponse {
  customers: VirtualWarehouseCustomer[];
}

export interface OverdueCylinderAlert {
  customer_id: string;
  customer_code: string;
  customer_name: string;
  barcode_sn: string;
  days_at_customer: number;
  max_days: number;
}

export interface StockOpnameRequest {
  item_id: string;
  actual_quantity: number;
  notes?: string;
}

export interface StockOpnameResponse {
  item_id: string;
  item_name?: string;
  quantity_before: number;
  quantity_after: number;
  quantity_delta: number;
}

export interface CylinderLedgerEntryResponse {
  id: string;
  barcode_sn: string;
  action: string;
  from_status?: string;
  to_status?: string;
  reference_type?: string;
  reference_id?: string;
  created_at?: string;
}

export interface StockLedgerReportResponse {
  barcode_sn: string;
  entries: CylinderLedgerEntryResponse[];
}

export interface TurnaroundSample {
  barcode_sn: string;
  started_at?: string;
  completed_at?: string;
  days: number;
}

export interface TurnaroundReportResponse {
  from_date?: string;
  to_date?: string;
  sample_count: number;
  average_days: number;
  samples: TurnaroundSample[];
}

export interface CylinderHistoryChange {
  field: string;
  label: string;
  old: string;
  new: string;
}

export interface CylinderHistoryEntry {
  id: string;
  action: string;
  action_label: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  changes?: CylinderHistoryChange[];
}

export interface CylinderHistoryResponse {
  cylinder_id: string;
  barcode_sn: string;
  entries: CylinderHistoryEntry[];
}

export interface VendorResponse {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  notes?: string;
  is_active?: boolean;
  cylinder_count?: number;
}

export interface VendorCylinderSummary {
  id: string;
  barcode_sn: string;
  item_name?: string;
  gas_type?: string;
  status: string;
}

export interface VendorDetailResponse extends VendorResponse {
  cylinders?: VendorCylinderSummary[];
  cylinders_by_status?: Record<string, number>;
}

export interface CreateVendorRequest {
  code: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  notes?: string;
}

export interface UpdateVendorRequest {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  notes?: string;
  is_active?: boolean;
}
