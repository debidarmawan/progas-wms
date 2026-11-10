import { apiRequest } from "@/lib/api/client";
import type {
  AccountResponse,
  CreateAccountRequest,
  MessageResponse,
  PaginatedList,
  PaginationParams,
  UpdateAccountRequest,
} from "@/lib/types/api";

export type AccountListParams = PaginationParams & {
  type?: string;
  is_active?: string;
};

export function listAccounts(params?: AccountListParams) {
  return apiRequest<PaginatedList<AccountResponse>>("/accounts", { params });
}

export function getAccount(id: string) {
  return apiRequest<AccountResponse>(`/accounts/${id}`);
}

export function createAccount(payload: CreateAccountRequest) {
  return apiRequest<MessageResponse>("/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAccount(id: string, payload: UpdateAccountRequest) {
  return apiRequest<MessageResponse>(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAccount(id: string) {
  return apiRequest<MessageResponse>(`/accounts/${id}`, {
    method: "DELETE",
  });
}

export const accountTypeLabels: Record<string, string> = {
  ASSET: "Aset",
  LIABILITY: "Liabilitas",
  EQUITY: "Ekuitas",
  REVENUE: "Pendapatan",
  EXPENSE: "Beban",
};

export const accountTypeOptions = Object.entries(accountTypeLabels).map(
  ([value, label]) => ({ value, label }),
);
