"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCustomerPO } from "@/lib/api/sales";
import type { CustomerPOResponse } from "@/lib/types/api";
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

export default function CustomerPODetailPage() {
  const params = useParams<{ id: string }>();
  const [po, setPO] = useState<CustomerPOResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCustomerPO(params.id)
      .then(setPO)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat PO pelanggan"),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (error || !po) {
    return (
      <div className="animate-in">
        <Alert variant="error">{error || "Data tidak ditemukan"}</Alert>
        <Link
          href="/dashboard/sales/customer-pos"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
        >
          <span aria-hidden="true">←</span>
          Kembali ke daftar PO
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <Link
        href="/dashboard/sales/customer-pos"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
      >
        <span aria-hidden="true">←</span>
        Kembali ke daftar PO
      </Link>
      <PageHeader
        title={`PO ${po.po_number}`}
        description={`${po.customer_name || "—"} · detail pesanan pelanggan`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-900">{po.status}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Pelanggan</p>
            <p className="mt-1 font-semibold text-slate-900">{po.customer_name || "—"}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Tanggal PO</p>
            <p className="mt-1 font-semibold text-slate-900">{po.po_date}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Berlaku sampai</p>
            <p className="mt-1 font-semibold text-slate-900">{po.valid_until || "—"}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>SKU</DataTableTh>
              <DataTableTh>Nama Item</DataTableTh>
              <DataTableTh>Quantity</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {(po.lines ?? []).length === 0 ? (
                <DataTableEmpty colSpan={3} />
              ) : (
                (po.lines ?? []).map((line) => (
                  <DataTableRow key={line.id}>
                    <DataTableTd className="font-mono">{line.sku || "—"}</DataTableTd>
                    <DataTableTd>{line.item_name || "—"}</DataTableTd>
                    <DataTableTd className="font-semibold">{line.quantity}</DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>

    </div>
  );
}
