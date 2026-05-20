"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listFillingBatches } from "@/lib/api/production";
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

export default function FillingBatchesPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listFillingBatches(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Filling Batch"
        description="Riwayat batch pengisian gas massal di manifold."
        actionHref="/dashboard/production/filling-batches/new"
        actionLabel="Batch Baru"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nomor batch atau jenis gas..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Batch</DataTableTh>
              <DataTableTh>Produk</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>Qty</DataTableTh>
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
                      {item.batch_number}
                    </DataTableTd>
                    <DataTableTd>{item.item_name || "—"}</DataTableTd>
                    <DataTableTd>{item.gas_type || "—"}</DataTableTd>
                    <DataTableTd>{item.cylinder_qty}</DataTableTd>
                    <DataTableTd>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium">
                        {item.status}
                      </span>
                    </DataTableTd>
                    <DataTableTd>
                      <Link
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                        href={`/dashboard/production/filling-batches/${item.id}`}
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
