"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { listMasterItems } from "@/lib/api/master-items";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { PaginationParams } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input, Select } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";

type SortField = "sku" | "name" | "hna_price";

export default function MasterItemsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [itemType, setItemType] = useState("");
  const [gasType, setGasType] = useState("");
  const [isSerialized, setIsSerialized] = useState("");
  const fetcher = useCallback(
    (params: PaginationParams) => listMasterItems(params),
    [],
  );
  const listParams = useMemo(
    () => ({
      sort_by: sortBy,
      sort_order: sortOrder,
      item_type: itemType || undefined,
      gas_type: gasType || undefined,
      is_serialized: isSerialized || undefined,
    }),
    [gasType, isSerialized, itemType, sortBy, sortOrder],
  );
  const { items, meta, setPage, loading, error } = usePaginatedList(
    fetcher,
    search,
    listParams,
  );

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortOrder("asc");
  }

  function resetControls() {
    setSearch("");
    setSortBy("name");
    setSortOrder("asc");
    setItemType("");
    setGasType("");
    setIsSerialized("");
  }

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

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SearchInput
          className="mb-0 xl:col-span-2"
          placeholder="Cari nama, SKU, atau jenis gas..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          aria-label="Filter berdasarkan jenis"
          value={itemType}
          onChange={(event) => setItemType(event.target.value)}
        >
          <option value="">Semua jenis</option>
          <option value="gas">Gas</option>
          <option value="liquid">Liquid</option>
          <option value="mix">Mix</option>
        </Select>
        <Input
          aria-label="Filter berdasarkan gas"
          placeholder="Filter gas..."
          value={gasType}
          onChange={(event) => setGasType(event.target.value)}
        />
        <Select
          aria-label="Filter berdasarkan tipe item"
          value={isSerialized}
          onChange={(event) => setIsSerialized(event.target.value)}
        >
          <option value="">Semua tipe</option>
          <option value="true">Tabung</option>
          <option value="false">Spare part</option>
        </Select>
        <Button
          className="md:col-span-2 xl:col-span-1"
          type="button"
          variant="secondary"
          size="sm"
          onClick={resetControls}
        >
          Reset filter
        </Button>
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
              <DataTableTh>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-indigo-600"
                  onClick={() => handleSort("sku")}
                >
                  SKU
                  {sortBy === "sku" ? (sortOrder === "asc" ? " ↑" : " ↓") : null}
                </button>
              </DataTableTh>
              <DataTableTh>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-indigo-600"
                  onClick={() => handleSort("name")}
                >
                  Nama
                  {sortBy === "name" ? (sortOrder === "asc" ? " ↑" : " ↓") : null}
                </button>
              </DataTableTh>
              <DataTableTh>Jenis</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-indigo-600"
                  onClick={() => handleSort("hna_price")}
                >
                  HNA Price
                  {sortBy === "hna_price"
                    ? sortOrder === "asc"
                      ? " ↑"
                      : " ↓"
                    : null}
                </button>
              </DataTableTh>
              <DataTableTh>Tipe</DataTableTh>
              <DataTableTh>Maks di Customer</DataTableTh>
              <DataTableTh>Stok</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={9} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={9} />
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
                      {item.hna_price.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 2,
                      })}
                    </DataTableTd>
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
