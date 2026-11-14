"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cancelSalesOrder, confirmSalesOrder, getSalesOrder } from "@/lib/api/sales";
import { showToast } from "@/lib/flash";
import type { SalesOrderResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("id-ID") : "—";
}

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [so, setSO] = useState<SalesOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"confirm" | "cancel" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = useCallback(() => {
    return getSalesOrder(params.id)
      .then(setSO)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat sales order"),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(action: "confirm" | "cancel") {
    if (!so) return;
    setPending(action);
    setError(null);
    try {
      if (action === "confirm") await confirmSalesOrder(so.id);
      else await cancelSalesOrder(so.id);
      setRejectOpen(false);
      showToast(
        action === "confirm"
          ? `SO ${so.so_number} berhasil dikonfirmasi.`
          : `SO ${so.so_number} berhasil ditolak.`,
      );
      await load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status SO");
    } finally {
      setPending(null);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (error && !so) {
    return (
      <div className="animate-in">
        <Alert variant="error">{error || "Data tidak ditemukan"}</Alert>
        <Link
          href="/dashboard/sales/sales-orders"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
        >
          <span aria-hidden="true">←</span>
          Kembali ke daftar SO
        </Link>
      </div>
    );
  }

  if (!so) return null;

  const lines = so.lines ?? [];
  const totalOrdered = lines.reduce((sum, line) => sum + line.qty_ordered, 0);
  const totalDelivered = lines.reduce((sum, line) => sum + line.qty_delivered, 0);
  const canConfirm = so.status === "DRAFT";
  const canReject = so.status === "DRAFT" || so.status === "CONFIRMED";
  const canCreateDO = so.status === "CONFIRMED" || so.status === "PARTIAL";
  const rejectLabel = canConfirm ? "Tolak SO" : "Batalkan SO";

  return (
    <div className="animate-in space-y-6">
      <Link
        href="/dashboard/sales/sales-orders"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
      >
        <span aria-hidden="true">←</span>
        Kembali ke daftar SO
      </Link>
      <PageHeader
        title={`SO ${so.so_number}`}
        description={`${so.customer_name || "—"} · detail sales order`}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {canCreateDO || canConfirm || canReject ? (
        <div className="flex flex-wrap items-center gap-2">
          {canCreateDO ? (
            <Link
              href={`/dashboard/outbound/delivery-orders/new?sales_order_id=${so.id}&customer_id=${so.customer_id}`}
            >
              <Button>Proses ke Surat Jalan</Button>
            </Link>
          ) : null}
          {canConfirm ? (
            <Button
              disabled={pending !== null}
              onClick={() => transition("confirm")}
            >
              {pending === "confirm" ? "Memproses..." : "Konfirmasi SO"}
            </Button>
          ) : null}
          {canReject ? (
            <Button
              variant="danger"
              disabled={pending !== null}
              onClick={() => setRejectOpen(true)}
            >
              {rejectLabel}
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Status</p>
            <div className="mt-1">
              <Badge tone={so.status}>{so.status}</Badge>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Pelanggan</p>
            <p className="mt-1 font-semibold text-slate-900">{so.customer_name || "—"}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">No. PO</p>
            {so.customer_po_id ? (
              <Link
                href={`/dashboard/sales/customer-pos/${so.customer_po_id}`}
                className="mt-1 block font-mono font-semibold text-indigo-700 hover:underline"
              >
                {so.po_number || "—"}
              </Link>
            ) : (
              <p className="mt-1 font-semibold text-slate-900">—</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Tanggal Dibuat</p>
            <p className="mt-1 font-semibold text-slate-900">{formatDate(so.created_at)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Progres Pengiriman</p>
            <p className="mt-1 font-semibold text-slate-900">
              {totalDelivered} / {totalOrdered} item
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>SKU</DataTableTh>
              <DataTableTh>Nama Item</DataTableTh>
              <DataTableTh>Qty Dipesan</DataTableTh>
              <DataTableTh>Qty Terkirim</DataTableTh>
              <DataTableTh>Sisa</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {lines.length === 0 ? (
                <DataTableEmpty colSpan={5} />
              ) : (
                lines.map((line) => (
                  <DataTableRow key={line.id}>
                    <DataTableTd className="font-mono">{line.sku || "—"}</DataTableTd>
                    <DataTableTd>{line.item_name || "—"}</DataTableTd>
                    <DataTableTd className="font-semibold">{line.qty_ordered}</DataTableTd>
                    <DataTableTd>{line.qty_delivered}</DataTableTd>
                    <DataTableTd
                      className={
                        line.qty_ordered - line.qty_delivered > 0
                          ? "font-semibold text-amber-700"
                          : "font-semibold text-emerald-700"
                      }
                    >
                      {line.qty_ordered - line.qty_delivered}
                    </DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={rejectOpen}
        title={`${rejectLabel}?`}
        message={
          canConfirm
            ? `SO ${so.so_number} akan ditolak dan tidak bisa diproses menjadi surat jalan. Lanjutkan?`
            : `SO ${so.so_number} sudah dikonfirmasi. Membatalkan akan menghentikan proses pengiriman. Lanjutkan?`
        }
        confirmLabel={rejectLabel}
        loading={pending === "cancel"}
        onConfirm={() => transition("cancel")}
        onCancel={() => setRejectOpen(false)}
      />
    </div>
  );
}
