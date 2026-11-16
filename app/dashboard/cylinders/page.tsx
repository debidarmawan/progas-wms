"use client";

import { useCallback, useState } from "react";
import { listCylinders } from "@/lib/api/cylinders";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { cylinderLocationTypeLabel } from "@/components/ui/cylinder-location-fields";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
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

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchInput
          className="flex-1"
          placeholder="Cari barcode, status, ownership..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <ButtonLink href="/dashboard/cylinders/labels" variant="secondary">
          Cetak Label
        </ButtonLink>
      </div>

      {error ? (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh className="w-24"> </DataTableTh>
              <DataTableTh>Barcode</DataTableTh>
              <DataTableTh>Produk</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Hari di Customer</DataTableTh>
              <DataTableTh>Ownership</DataTableTh>
              <DataTableTh>Lokasi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={8} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={8} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd>
                      <ButtonLink
                        href={`/dashboard/cylinders/${item.id}/edit`}
                        size="sm"
                        variant="secondary"
                      >
                        Edit
                      </ButtonLink>
                    </DataTableTd>
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
                      <CylinderAging
                        days={item.days_at_customer}
                        maxDays={item.max_days_at_customer}
                        isOverdue={item.is_overdue}
                        isAtCustomer={!!item.outstanding_since}
                      />
                    </DataTableTd>
                    <DataTableTd>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {item.ownership_type}
                      </span>
                    </DataTableTd>
                    <DataTableTd className="text-slate-600">
                      {item.location_name ||
                        cylinderLocationTypeLabel(item.location_type)}
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

function CylinderAging({
  days,
  maxDays,
  isOverdue,
  isAtCustomer,
}: {
  days: number;
  maxDays: number;
  isOverdue: boolean;
  isAtCustomer: boolean;
}) {
  if (!isAtCustomer) {
    return <span className="text-slate-400">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className={isOverdue ? "font-medium text-rose-700" : "text-slate-700"}>
        {maxDays > 0 ? `${days}/${maxDays} hari` : `${days} hari`}
      </span>
      {isOverdue ? (
        <Badge className="bg-rose-50 text-rose-800 ring-rose-200/60">
          Overdue
        </Badge>
      ) : null}
    </div>
  );
}
