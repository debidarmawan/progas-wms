"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listFleet } from "@/lib/api/logistics";
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

export default function FleetPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listFleet(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Armada"
        description="Data kendaraan pengiriman dan kapasitas muat maksimum."
        actionHref="/dashboard/logistics/fleet/new"
        actionLabel="Tambah Armada"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari plat nomor..."
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
              <DataTableTh>Plat</DataTableTh>
              <DataTableTh>Max Berat (kg)</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={4} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={4} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-mono font-medium">
                      {item.plate_number}
                    </DataTableTd>
                    <DataTableTd>{item.max_weight_kg}</DataTableTd>
                    <DataTableTd>
                      <Badge>
                        {item.is_active === false ? "Nonaktif" : "Aktif"}
                      </Badge>
                    </DataTableTd>
                    <DataTableTd>
                      <Link
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                        href={`/dashboard/logistics/fleet/${item.id}/edit`}
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
