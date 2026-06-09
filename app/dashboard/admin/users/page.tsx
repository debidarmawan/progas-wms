"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { deleteUser, listUsers } from "@/lib/api/users";
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

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listUsers(params),
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
      await deleteUser(id);
      setPendingDelete(null);
      reload();
      showToast(`Pengguna "${name}" berhasil dihapus.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Pengguna"
        description="Kelola akun operator dan peran akses (RBAC)."
        actionHref="/dashboard/admin/users/new"
        actionLabel="Tambah Pengguna"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nama, email, atau telepon..."
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
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Email</DataTableTh>
              <DataTableTh>Peran</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Login Terakhir</DataTableTh>
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
                    <DataTableTd className="font-medium text-slate-900">
                      {item.name}
                    </DataTableTd>
                    <DataTableTd>{item.email}</DataTableTd>
                    <DataTableTd>{item.role_name}</DataTableTd>
                    <DataTableTd>
                      <Badge>
                        {item.is_active === false ? "Nonaktif" : "Aktif"}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd className="text-sm text-slate-600">
                      {item.last_logged_in_at
                        ? new Date(item.last_logged_in_at).toLocaleString(
                            "id-ID",
                          )
                        : "—"}
                    </DataTableTd>
                    <DataTableTd>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                          href={`/dashboard/admin/users/${item.id}/edit`}
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
        title="Hapus pengguna?"
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
