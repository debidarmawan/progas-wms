"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listDeliveryOrders } from "@/lib/api/outbound";
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

export default function DeliveryOrdersPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listDeliveryOrders(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Surat Jalan"
        description="Daftar delivery order dan pengiriman tabung ke pelanggan."
        actionHref="/dashboard/outbound/delivery-orders/new"
        actionLabel="Buat DO"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari nomor DO, pelanggan, atau plat..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>No. DO</DataTableTh>
              <DataTableTh>Pelanggan</DataTableTh>
              <DataTableTh>Armada</DataTableTh>
              <DataTableTh>Qty</DataTableTh>
              <DataTableTh>Berat (kg)</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={7} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={7} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-mono font-medium text-slate-800">
                      {item.do_number}
                    </DataTableTd>
                    <DataTableTd>{item.customer_name || "—"}</DataTableTd>
                    <DataTableTd>{item.plate_number || "—"}</DataTableTd>
                    <DataTableTd>{item.cylinder_qty}</DataTableTd>
                    <DataTableTd>
                      {item.total_weight_kg != null
                        ? item.total_weight_kg.toFixed(1)
                        : "—"}
                    </DataTableTd>
                    <DataTableTd>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium">
                        {item.status}
                      </span>
                    </DataTableTd>
                    <DataTableTd>
                      <Link
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                        href={`/dashboard/outbound/delivery-orders/${item.id}`}
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
