"use client";

import { useCallback, useState } from "react";
import { cancelSalesOrder, confirmSalesOrder, listSalesOrders } from "@/lib/api/sales";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { DataTable, DataTableBody, DataTableEmpty, DataTableHead, DataTableLoading, DataTableRow, DataTableTd, DataTableTh } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

export default function SalesOrdersPage() {
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const fetcher = useCallback((params: { page: number; limit: number; search?: string }) => listSalesOrders({ ...params, _refresh: refresh }), [refresh]);
  const { items, meta, setPage, loading, error } = usePaginatedList(fetcher, search);
  async function transition(id: string, action: "confirm" | "cancel") { setActionError(null); setPendingId(id); try { if (action === "confirm") await confirmSalesOrder(id); else await cancelSalesOrder(id); setRefresh((value) => value + 1); } catch (err) { setActionError(err instanceof Error ? err.message : "Gagal mengubah status SO"); } finally { setPendingId(null); } }
  return <div className="animate-in"><PageHeader title="Sales Order" description="Verifikasi pesanan sebelum diteruskan menjadi Surat Jalan." actionHref="/dashboard/sales/sales-orders/new" actionLabel="Buat SO" /><SearchInput className="mb-6" placeholder="Cari nomor SO atau pelanggan..." value={search} onChange={(event) => setSearch(event.target.value)} />{error || actionError ? <Alert variant="error" className="mb-4">{error || actionError}</Alert> : null}<Card><CardBody className="p-0"><DataTable><DataTableHead><DataTableTh>Aksi</DataTableTh><DataTableTh>No. SO</DataTableTh><DataTableTh>No. PO</DataTableTh><DataTableTh>Pelanggan</DataTableTh><DataTableTh>Status</DataTableTh></DataTableHead><DataTableBody>{loading ? <DataTableLoading colSpan={5} /> : items.length === 0 ? <DataTableEmpty colSpan={5} /> : items.map((item) => <DataTableRow key={item.id}><DataTableTd><div className="flex items-center gap-2 whitespace-nowrap"><ButtonLink href={`/dashboard/sales/sales-orders/${item.id}`} size="sm" variant="secondary">Detail</ButtonLink>{item.status === "DRAFT" ? <><Button disabled={pendingId === item.id} onClick={() => transition(item.id, "confirm")} size="sm" type="button">Konfirmasi</Button><Button disabled={pendingId === item.id} onClick={() => transition(item.id, "cancel")} size="sm" type="button" variant="danger">Batalkan</Button></> : <span className="text-xs text-slate-500">Terkunci</span>}</div></DataTableTd><DataTableTd className="font-mono font-medium">{item.so_number}</DataTableTd><DataTableTd className="font-mono">{item.po_number || "—"}</DataTableTd><DataTableTd>{item.customer_name || "—"}</DataTableTd><DataTableTd><Badge tone={item.status}>{item.status}</Badge></DataTableTd></DataTableRow>)}</DataTableBody></DataTable>{meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}</CardBody></Card></div>;
}