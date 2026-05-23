"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDeliveryOrder } from "@/lib/api/outbound";
import type { DeliveryOrderResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
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

export default function DeliveryOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<DeliveryOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDeliveryOrder(params.id)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat DO"),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (error || !order) {
    return (
      <div className="animate-in">
        <Alert variant="error">{error || "Data tidak ditemukan"}</Alert>
        <Link
          href="/dashboard/outbound/delivery-orders"
          className="mt-4 inline-block text-sm text-indigo-600"
        >
          ← Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title={`DO ${order.do_number}`}
        description={`${order.customer_name || "—"} · ${order.plate_number || "—"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-900">{order.status}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Jumlah Tabung</p>
            <p className="mt-1 font-semibold text-slate-900">{order.cylinder_qty}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Total Berat</p>
            <p className="mt-1 font-semibold text-slate-900">
              {order.total_weight_kg != null
                ? `${order.total_weight_kg.toFixed(1)} kg`
                : "—"}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Dibuat</p>
            <p className="mt-1 font-semibold text-slate-900">
              {order.created_at
                ? new Date(order.created_at).toLocaleString("id-ID")
                : "—"}
            </p>
          </CardBody>
        </Card>
      </div>

      {order.notes ? (
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Catatan</p>
            <p className="mt-1 text-sm text-slate-800">{order.notes}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Barcode</DataTableTh>
              <DataTableTh>Berat (kg)</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {(order.details ?? []).length === 0 ? (
                <DataTableEmpty colSpan={2} />
              ) : (
                (order.details ?? []).map((detail) => (
                  <DataTableRow key={detail.id}>
                    <DataTableTd className="font-mono">{detail.barcode_sn}</DataTableTd>
                    <DataTableTd>
                      {detail.weight_kg != null
                        ? detail.weight_kg.toFixed(1)
                        : "—"}
                    </DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>

      <Link
        href="/dashboard/outbound/delivery-orders"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Kembali ke daftar
      </Link>
    </div>
  );
}
