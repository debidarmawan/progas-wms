"use client";

import { useCallback, useMemo, useState } from "react";
import {
  accountTypeLabels,
  accountTypeOptions,
  deleteAccount,
  listAccounts,
} from "@/lib/api/accounts";
import { showToast } from "@/lib/flash";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableLoading,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { SearchableSelect } from "@/components/ui/searchable-select";

const typeFilterOptions = [
  { value: "", label: "Semua tipe" },
  ...accountTypeOptions,
];

const activeFilterOptions = [
  { value: "", label: "Semua status" },
  { value: "true", label: "Aktif" },
  { value: "false", label: "Nonaktif" },
];

export default function AccountsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listAccounts(params),
    [],
  );
  // Harus memo: objek baru tiap render memicu refetch terus-menerus di usePaginatedList.
  const extraParams = useMemo(
    () => ({
      type: typeFilter || undefined,
      is_active: activeFilter || undefined,
    }),
    [typeFilter, activeFilter],
  );
  const { items, meta, setPage, loading, error, reload } = usePaginatedList(
    fetcher,
    search,
    extraParams,
  );

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const { id, code } = pendingDelete;
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteAccount(id);
      setPendingDelete(null);
      reload();
      showToast(`Akun "${code}" berhasil dihapus.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal menghapus akun",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Chart of Accounts"
        description="Daftar akun (CoA) untuk jurnal double-entry."
        actionHref="/dashboard/finance/accounts/new"
        actionLabel="Tambah Akun"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchInput
          className="sm:flex-1"
          placeholder="Cari kode atau nama akun..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SearchableSelect
          aria-label="Filter tipe akun"
          className="sm:w-56"
          options={typeFilterOptions}
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        />
        <SearchableSelect
          aria-label="Filter status akun"
          className="sm:w-44"
          options={activeFilterOptions}
          value={activeFilter}
          onChange={(event) => setActiveFilter(event.target.value)}
        />
      </div>

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
      {actionError ? (
        <Alert variant="error" className="mb-4">{actionError}</Alert>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Aksi</DataTableTh>
              <DataTableTh>Kode</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Tipe</DataTableTh>
              <DataTableTh>Induk</DataTableTh>
              <DataTableTh>Saldo Normal</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={7} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={7} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd>
                      <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
                        <ButtonLink
                          href={`/dashboard/finance/accounts/${item.id}/edit`}
                          size="sm"
                          variant="secondary"
                        >
                          Edit
                        </ButtonLink>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          disabled={deletingId === item.id}
                          onClick={() =>
                            setPendingDelete({ id: item.id, code: item.code })
                          }
                        >
                          {deletingId === item.id ? "..." : "Hapus"}
                        </Button>
                      </div>
                    </DataTableTd>
                    <DataTableTd className="font-mono font-medium text-slate-800">
                      {item.code}
                    </DataTableTd>
                    <DataTableTd className="font-medium text-slate-900">
                      {item.name}
                    </DataTableTd>
                    <DataTableTd>
                      <Badge tone={item.type}>
                        {accountTypeLabels[item.type] ?? item.type}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd className="font-mono text-slate-500">
                      {item.parent_code || "-"}
                    </DataTableTd>
                    <DataTableTd className="uppercase text-slate-600">
                      {item.normal_balance}
                    </DataTableTd>
                    <DataTableTd>
                      <Badge tone={item.is_active ? "COMPLETED" : "CANCELLED"}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
          {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Hapus akun?"
        message={
          pendingDelete
            ? `Yakin ingin menghapus "${pendingDelete.code}"? Akun yang punya sub-akun atau sudah dipakai jurnal tidak bisa dihapus — nonaktifkan saja.`
            : ""
        }
        loading={!!pendingDelete && deletingId === pendingDelete.id}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deletingId) setPendingDelete(null);
        }}
      />
    </div>
  );
}
