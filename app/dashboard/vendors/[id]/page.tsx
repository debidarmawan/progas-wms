"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getVendor } from "@/lib/api/vendors";
import type { VendorDetailResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVendor(params.id)
      .then(setVendor)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat vendor"),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (error || !vendor) {
    return (
      <div className="animate-in">
        <Alert variant="error">{error || "Data tidak ditemukan"}</Alert>
        <Link href="/dashboard/vendors" className="mt-4 inline-block text-sm text-indigo-600">
          ← Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title={vendor.name}
        description={`${vendor.code} · ${vendor.contact_person || vendor.phone || "—"}`}
        actionHref={`/dashboard/vendors/${vendor.id}/edit`}
        actionLabel="Edit"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1">
              <Badge>{vendor.is_active === false ? "Nonaktif" : "Aktif"}</Badge>
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Total Tabung</p>
            <p className="mt-1 text-2xl font-semibold">{vendor.cylinder_count ?? 0}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Kontrak Mulai</p>
            <p className="mt-1 font-medium">
              {vendor.contract_start_date
                ? new Date(vendor.contract_start_date).toLocaleDateString("id-ID")
                : "—"}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Kontrak Akhir</p>
            <p className="mt-1 font-medium">
              {vendor.contract_end_date
                ? new Date(vendor.contract_end_date).toLocaleDateString("id-ID")
                : "—"}
            </p>
          </CardBody>
        </Card>
      </div>

      {(vendor.email || vendor.address || vendor.notes) && (
        <Card>
          <CardBody className="space-y-2 text-sm text-slate-700">
            {vendor.email ? <p>Email: {vendor.email}</p> : null}
            {vendor.address ? <p>Alamat: {vendor.address}</p> : null}
            {vendor.notes ? <p>Catatan: {vendor.notes}</p> : null}
          </CardBody>
        </Card>
      )}

      {vendor.cylinders_by_status &&
      Object.keys(vendor.cylinders_by_status).length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries(vendor.cylinders_by_status).map(([status, count]) => (
            <span
              key={status}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <span className="font-mono text-xs text-slate-500">{status}</span>
              <span className="ml-2 font-semibold">{count}</span>
            </span>
          ))}
        </div>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Tabung Terdaftar</h2>
          </div>
          <DataTable>
            <DataTableHead>
              <DataTableTh>Barcode</DataTableTh>
              <DataTableTh>Produk</DataTableTh>
              <DataTableTh>Gas</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {(vendor.cylinders ?? []).length === 0 ? (
                <DataTableEmpty colSpan={4} />
              ) : (
                (vendor.cylinders ?? []).map((cyl) => (
                  <DataTableRow key={cyl.id}>
                    <DataTableTd className="font-mono">{cyl.barcode_sn}</DataTableTd>
                    <DataTableTd>{cyl.item_name || "—"}</DataTableTd>
                    <DataTableTd>{cyl.gas_type || "—"}</DataTableTd>
                    <DataTableTd>{cyl.status}</DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>

      <Link
        href="/dashboard/vendors"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        ← Kembali ke daftar
      </Link>
    </div>
  );
}
