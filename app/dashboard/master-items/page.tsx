"use client";

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

      <SearchInput
        className="mb-6"
        placeholder="Cari nama, SKU, atau jenis gas..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>SKU</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>Tipe</DataTableTh>
              <DataTableTh>Stok</DataTableTh>
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
                      {item.sku}
                    </DataTableTd>
                    <DataTableTd className="font-medium text-slate-900">
                      {item.name}
                    </DataTableTd>
                    <DataTableTd>{item.gas_type || "—"}</DataTableTd>
                    <DataTableTd>
                      <Badge>
                        {item.is_serialized ? "Tabung" : "Spare part"}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd>
                      {item.is_serialized ? "—" : (item.stock_quantity ?? 0)}
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
