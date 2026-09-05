"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listMasterItems } from "@/lib/api/master-items";
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

export default function MasterItemsPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listMasterItems(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Master Items"
        description="Katalog produk gas (serialized) dan suku cadang."
        actionHref="/dashboard/master-items/new"
        actionLabel="Tambah Item"
      />
      <div className="mb-4">
        <Link
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          href="/dashboard/master-items/new-bulk"
        >
          + Tambah banyak item sekaligus
        </Link>
      </div>

      <SearchInput
        className="mb-6"
        placeholder="Cari nama, SKU, atau jenis gas..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>SKU</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Jenis</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>Tipe</DataTableTh>
              <DataTableTh>Maks di Customer</DataTableTh>
              <DataTableTh>Stok</DataTableTh>
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
                    <DataTableTd className="font-mono text-slate-800">
                      {item.sku}
                    </DataTableTd>
                    <DataTableTd className="font-medium text-slate-900">
                      {item.name}
                    </DataTableTd>
                    <DataTableTd className="capitalize">{item.item_type}</DataTableTd>
                    <DataTableTd>{item.gas_type || "—"}</DataTableTd>
                    <DataTableTd>
                      <Badge>
                        {item.is_serialized ? "Tabung" : "Spare part"}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd>
                      {item.is_serialized
                        ? (item.max_days_at_customer ?? 0) > 0
                          ? `${item.max_days_at_customer} hari`
                          : "Tanpa batas"
                        : "—"}
                    </DataTableTd>
                    <DataTableTd>
                      {item.is_serialized ? "—" : (item.stock_quantity ?? 0)}
                    </DataTableTd>
                    <DataTableTd>
                      <Link
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                        href={`/dashboard/master-items/${item.id}/edit`}
                      >
                        Edit
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
