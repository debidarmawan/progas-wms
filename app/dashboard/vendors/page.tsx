"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { deleteVendor, listVendors } from "@/lib/api/vendors";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
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

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listVendors(params),
    [],
  );
  const { items, meta, setPage, loading, error, reload } = usePaginatedList(
    fetcher,
    search,
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus vendor "${name}"?`)) return;
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteVendor(id);
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Vendor"
        description="Vendor penyedia tabung sewa, kontrak, dan inventori terkait."
        actionHref="/dashboard/vendors/new"
        actionLabel="Tambah Vendor"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari kode, nama, atau kontak..."
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
              <DataTableTh>Kode</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Kontak</DataTableTh>
              <DataTableTh>Tabung</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={6} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={6} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-mono font-medium text-slate-800">
                      {item.code}
                    </DataTableTd>
                    <DataTableTd className="font-medium text-slate-900">
                      {item.name}
                    </DataTableTd>
                    <DataTableTd>{item.contact_person || item.phone || "—"}</DataTableTd>
                    <DataTableTd>{item.cylinder_count ?? 0}</DataTableTd>
                    <DataTableTd>
                      <Badge>
                        {item.is_active === false ? "Nonaktif" : "Aktif"}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                          href={`/dashboard/vendors/${item.id}`}
                        >
                          Detail
                        </Link>
                        <Link
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                          href={`/dashboard/vendors/${item.id}/edit`}
                        >
                          Edit
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id, item.name)}
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
    </div>
  );
}
