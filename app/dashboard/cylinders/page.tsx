"use client";

import { useCallback, useState } from "react";
import { listCylinders } from "@/lib/api/cylinders";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

export default function CylindersPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listCylinders(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Tabung Gas"
        description="Database tabung ber-barcode dengan status dan kepemilikan."
        actionHref="/dashboard/cylinders/new"
        actionLabel="Registrasi Tabung"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari barcode, status, ownership..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Barcode</DataTableTh>
              <DataTableTh>Produk</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Ownership</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={5} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={5} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-mono text-slate-800">
                      {item.barcode_sn}
                    </DataTableTd>
                    <DataTableTd className="font-medium text-slate-900">
                      {item.item_name || item.item_id}
                    </DataTableTd>
                    <DataTableTd>{item.gas_type || "—"}</DataTableTd>
                    <DataTableTd>
                      <Badge tone={item.status}>{item.status}</Badge>
                    </DataTableTd>
                    <DataTableTd>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {item.ownership_type}
                      </span>
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
