"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listInvoices } from "@/lib/api/finance";
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

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listInvoices(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Invoice"
        description="Invoice dibuat otomatis per Delivery Order saat Issue DO."
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nomor invoice atau pelanggan..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>No. Invoice</DataTableTh>
              <DataTableTh>Pelanggan</DataTableTh>
              <DataTableTh>No. DO</DataTableTh>
              <DataTableTh>Jatuh Tempo</DataTableTh>
              <DataTableTh>Total</DataTableTh>
              <DataTableTh>Terbayar</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={8} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={8} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-mono font-medium text-slate-800">
                      {item.invoice_number}
                    </DataTableTd>
                    <DataTableTd>{item.customer_name || "—"}</DataTableTd>
                    <DataTableTd className="font-mono">
                      {item.do_number || "—"}
                    </DataTableTd>
                    <DataTableTd>{item.due_date?.slice(0, 10)}</DataTableTd>
                    <DataTableTd>{item.total_amount.toLocaleString("id-ID")}</DataTableTd>
                    <DataTableTd>{item.paid_amount.toLocaleString("id-ID")}</DataTableTd>
                    <DataTableTd>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium">
                        {item.status}
                      </span>
                    </DataTableTd>
                    <DataTableTd>
                      <Link
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                        href={`/dashboard/finance/invoices/${item.id}`}
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
