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
}

export interface UpdateMasterItemRequest {
  name: string;
  gas_type?: string;
  empty_weight_kg?: number;
  gas_weight_kg?: number;
  min_stock_alert?: number;
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
}

export interface CreateCylinderRequest {
  barcode_sn: string;
  item_id: string;
  ownership_type: string;
  owner_id?: string;
  last_hydrotest_date: string;
}

export interface CustomerResponse {
  id: string;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  cylinder_quota_limit?: number;
  outstanding_count?: number;
  is_active?: boolean;
}

export interface CreateCustomerRequest {
  code: string;
  name: string;
  phone?: string;
  address?: string;
  cylinder_quota_limit?: number;
}

export interface UpdateCustomerRequest {
  name: string;
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

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role_id: string;
}
