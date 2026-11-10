"use client";

import { useCallback, useState } from "react";
import { deleteUom, listUoms } from "@/lib/api/uoms";
import { showToast } from "@/lib/flash";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
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

export default function UomsPage() {
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listUoms(params),
    [],
  );
  const { items, meta, setPage, loading, error, reload } = usePaginatedList(
    fetcher,
    search,
  );

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const { id, code } = pendingDelete;
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteUom(id);
      setPendingDelete(null);
      reload();
      showToast(`UOM "${code}" berhasil dihapus.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus UOM");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="UOM"
        description="Satuan unit barang yang dipakai pada master item."
        actionHref="/dashboard/uoms/new"
        actionLabel="Tambah UOM"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari kode atau nama satuan..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

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
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={3} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={3} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd>
                      <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
                        <ButtonLink
                          href={`/dashboard/uoms/${item.id}/edit`}
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
        title="Hapus UOM?"
        message={
          pendingDelete
            ? `Yakin ingin menghapus "${pendingDelete.code}"? UOM yang masih dipakai master item tidak bisa dihapus.`
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
