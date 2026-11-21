"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
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

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const fetcher = useCallback(
    (params: { page: number; limit: number; search?: string }) =>
      listCustomers(params),
    [],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Pelanggan"
        description="Database pelanggan dengan kuota outstanding tabung."
        actionHref="/dashboard/customers/new"
        actionLabel="Tambah Pelanggan"
      />

      <SearchInput
        className="mb-6"
        placeholder="Cari kode, nama, atau telepon..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Aksi</DataTableTh>
              <DataTableTh>Kode</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Termin</DataTableTh>
              <DataTableTh>Limit Kredit</DataTableTh>
              <DataTableTh>Outstanding</DataTableTh>
              <DataTableTh>Kuota</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={7} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={7} />
              ) : (
                items.map((item) => {
                  const overQuota =
                    (item.outstanding_count ?? 0) >
                    (item.cylinder_quota_limit ?? 0);
                  return (
                    <DataTableRow key={item.id}>
                      <DataTableTd>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <ButtonLink
                            href={`/dashboard/customers/${item.id}`}
                            size="sm"
                            variant="secondary"
                          >
                            Detail
                          </ButtonLink>
                          <ButtonLink
                            href={`/dashboard/customers/${item.id}/pricing`}
                            size="sm"
                            variant="secondary"
                          >
                            Harga
                          </ButtonLink>
                          <ButtonLink
                            href={`/dashboard/customers/${item.id}/edit`}
                            size="sm"
                            variant="secondary"
                          >
                            Edit
                          </ButtonLink>
                        </div>
                      </DataTableTd>
                      <DataTableTd className="font-mono text-slate-800">
                        {item.code}
                      </DataTableTd>
                      <DataTableTd className="font-medium text-slate-900">
                        <Link
                          href={`/dashboard/customers/${item.id}`}
                          className="hover:text-indigo-600"
                        >
                          {item.name}
                        </Link>
                      </DataTableTd>
                      <DataTableTd>
                        {item.term_of_payment_code ? (
                          <span title={item.term_of_payment_name}>
                            {item.term_of_payment_code}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </DataTableTd>
                      <DataTableTd>
                        {(item.credit_limit ?? 0).toLocaleString("id-ID")}
                      </DataTableTd>
                      <DataTableTd>
                        <span
                          className={
                            overQuota
                              ? "inline-flex rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-semibold text-rose-700 ring-1 ring-rose-200/60 ring-inset"
                              : "font-medium text-slate-700"
                          }
                        >
                          {item.outstanding_count ?? 0}
                        </span>
                      </DataTableTd>
                      <DataTableTd>{item.cylinder_quota_limit ?? 0}</DataTableTd>
                    </DataTableRow>
                  );
                })
              )}
            </DataTableBody>
          </DataTable>
          {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
        </CardBody>
      </Card>
    </div>
  );
}
