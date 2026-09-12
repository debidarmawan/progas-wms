"use client";

import { useCallback, useState } from "react";
import { confirmCustomerPO, listCustomerPOs } from "@/lib/api/sales";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { DataTable, DataTableBody, DataTableEmpty, DataTableHead, DataTableLoading, DataTableRow, DataTableTd, DataTableTh } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

export default function CustomerPOsPage() {
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const fetcher = useCallback((params: { page: number; limit: number; search?: string }) => listCustomerPOs({ ...params, _refresh: refresh }), [refresh]);
  const { items, meta, setPage, loading, error } = usePaginatedList(fetcher, search);

  async function handleConfirm(id: string) {
    setActionError(null);
    try { await confirmCustomerPO(id); setRefresh((value) => value + 1); } catch (err) { setActionError(err instanceof Error ? err.message : "Gagal mengonfirmasi PO"); }
  }

  return <div className="animate-in">
    <PageHeader title="PO Pelanggan" description="Pesanan resmi pelanggan pada level master item." actionHref="/dashboard/sales/customer-pos/new" actionLabel="Buat PO" />
    <SearchInput className="mb-6" placeholder="Cari nomor PO atau pelanggan..." value={search} onChange={(event) => setSearch(event.target.value)} />
    {error || actionError ? <Alert variant="error" className="mb-4">{error || actionError}</Alert> : null}
    <Card><CardBody className="p-0"><DataTable><DataTableHead><DataTableTh>No. PO</DataTableTh><DataTableTh>Pelanggan</DataTableTh><DataTableTh>Tanggal</DataTableTh><DataTableTh>Status</DataTableTh><DataTableTh>Aksi</DataTableTh></DataTableHead><DataTableBody>
      {loading ? <DataTableLoading colSpan={5} /> : items.length === 0 ? <DataTableEmpty colSpan={5} /> : items.map((item) => <DataTableRow key={item.id}><DataTableTd className="font-mono font-medium">{item.po_number}</DataTableTd><DataTableTd>{item.customer_name || "—"}</DataTableTd><DataTableTd>{item.po_date}</DataTableTd><DataTableTd>{item.status}</DataTableTd><DataTableTd>{item.status === "DRAFT" ? <button className="font-medium text-indigo-600" onClick={() => handleConfirm(item.id)} type="button">Konfirmasi</button> : <span className="text-slate-500">Terkunci</span>}</DataTableTd></DataTableRow>)}
    </DataTableBody></DataTable>{meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}</CardBody></Card>
  </div>;
}