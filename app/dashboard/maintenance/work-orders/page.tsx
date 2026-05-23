"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listWorkOrders } from "@/lib/api/maintenance";
import { usePaginatedList } from "@/hooks/use-paginated-list";
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

export default function WorkOrdersPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listWorkOrders(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Work Order"
        description="Perintah kerja pemeliharaan dan konsumsi spare part."
        actionHref="/dashboard/maintenance/work-orders/new"
        actionLabel="Buat WO"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nomor WO atau judul..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>No. WO</DataTableTh>
              <DataTableTh>Judul</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Dibuat</DataTableTh>
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
                    <DataTableTd className="font-mono font-medium">
                      {item.wo_number}
                    </DataTableTd>
                    <DataTableTd className="font-medium">{item.title}</DataTableTd>
                    <DataTableTd>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium">
                        {item.status}
                      </span>
                    </DataTableTd>
                    <DataTableTd>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("id-ID")
                        : "—"}
                    </DataTableTd>
                    <DataTableTd>
                      <Link
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                        href={`/dashboard/maintenance/work-orders/${item.id}`}
                      >
                        Detail
                      </Link>
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
