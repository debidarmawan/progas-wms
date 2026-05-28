"use client";

import { useCallback, useState } from "react";
import { listRoles } from "@/lib/api/roles";
import { Alert } from "@/components/ui/alert";
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
import { usePaginatedList } from "@/hooks/use-paginated-list";

export default function RolesPage() {
  const [search, setSearch] = useState("");

  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listRoles(params),
    [],
  );

  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Peran Akses"
        description="Daftar role backend yang digunakan untuk kontrol akses (RBAC)."
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nama peran..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Nama Peran</DataTableTh>
              <DataTableTh>ID</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={2} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={2} />
              ) : (
                items.map((role) => (
                  <DataTableRow key={role.id}>
                    <DataTableTd className="font-medium text-slate-900">
                      {role.name}
                    </DataTableTd>
                    <DataTableTd className="font-mono text-xs text-slate-500">
                      {role.id}
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
