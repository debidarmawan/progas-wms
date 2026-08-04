"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { deleteDriver, listDrivers } from "@/lib/api/logistics";
import { showToast } from "@/lib/flash";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listDrivers(params),
    [],
  );
  const { items, meta, setPage, loading, error, reload } = usePaginatedList(
    fetcher,
    search,
  );

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const { id, name } = pendingDelete;
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteDriver(id);
      setPendingDelete(null);
      reload();
      showToast(`Driver "${name}" berhasil dihapus.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Driver"
        description="Data master sopir pengiriman."
        actionHref="/dashboard/logistics/drivers/new"
        actionLabel="Tambah Driver"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nama, telepon, atau nomor SIM..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert variant="error" className="mb-4">
          {actionError}
        </Alert>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>No. Telepon</DataTableTh>
              <DataTableTh>No. SIM</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={5} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={5} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-medium text-slate-900">
                      {item.name}
                    </DataTableTd>
                    <DataTableTd>{item.phone || "—"}</DataTableTd>
                    <DataTableTd>{item.license_number || "—"}</DataTableTd>
                    <DataTableTd>
                      <Badge>
                        {item.is_active === false ? "Nonaktif" : "Aktif"}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                          href={`/dashboard/logistics/drivers/${item.id}/edit`}
                        >
                          Edit
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          disabled={deletingId === item.id}
                          onClick={() =>
                            setPendingDelete({ id: item.id, name: item.name })
                          }
                        >
                          {deletingId === item.id ? "..." : "Hapus"}
                        </Button>
                      </div>
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
        title="Hapus driver?"
        message={
          pendingDelete
            ? `Yakin ingin menghapus "${pendingDelete.name}"? Tindakan ini tidak dapat dibatalkan.`
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
