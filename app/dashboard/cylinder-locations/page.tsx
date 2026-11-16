"use client";

import { useCallback, useState } from "react";
import {
  deleteCylinderLocation,
  listCylinderLocations,
} from "@/lib/api/cylinder-locations";
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
import { cylinderLocationTypeLabel } from "@/components/ui/cylinder-location-fields";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

export default function CylinderLocationsPage() {
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listCylinderLocations(params),
    [],
  );
  const { items, meta, setPage, loading, error, reload } =
    usePaginatedList(fetcher, search);

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    const { id, code } = pendingDelete;
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteCylinderLocation(id);
      setPendingDelete(null);
      reload();
      showToast(`Lokasi "${code}" berhasil dihapus.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal menghapus lokasi",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Lokasi Tabung"
        description="Master gudang, stasiun pengisian, dan workshop milik perusahaan."
        actionHref="/dashboard/cylinder-locations/new"
        actionLabel="Tambah Lokasi"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <SearchInput
          className="sm:flex-1"
          placeholder="Cari kode atau nama lokasi..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

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
              <DataTableTh>Aksi</DataTableTh>
              <DataTableTh>Kode</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Tipe</DataTableTh>
              <DataTableTh>Alamat</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={6} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={6} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd>
                      <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
                        <ButtonLink
                          href={`/dashboard/cylinder-locations/${item.id}/edit`}
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
                    <DataTableTd className="text-slate-600">
                      {cylinderLocationTypeLabel(item.type)}
                    </DataTableTd>
                    <DataTableTd className="text-slate-600">
                      {item.address || "—"}
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
        title="Hapus lokasi tabung?"
        message={
          pendingDelete
            ? `Yakin ingin menghapus "${pendingDelete.code}"? Nonaktifkan saja jika masih dipakai tabung.`
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
