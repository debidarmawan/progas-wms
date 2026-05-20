"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFillingBatch } from "@/lib/api/production";
import type { FillingBatchResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function FillingBatchDetailPage() {
  const params = useParams<{ id: string }>();
  const [batch, setBatch] = useState<FillingBatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFillingBatch(params.id)
      .then(setBatch)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat batch"),
      );
  }, [params.id]);

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  if (!batch) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  return (
    <div className="animate-in max-w-3xl">
      <PageHeader
        title={`Batch ${batch.batch_number}`}
        description={`${batch.item_name || "-"} · ${batch.gas_type || "-"}`}
      />

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium">{batch.status}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Jumlah Tabung</dt>
              <dd className="font-medium">{batch.cylinder_qty}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Dibuat</dt>
              <dd className="font-medium">{batch.created_at || "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Catatan</dt>
              <dd className="font-medium">{batch.notes || "-"}</dd>
            </div>
          </dl>
        </CardHeader>
        <CardBody>
          <h2 className="mb-3 font-semibold text-slate-900">Tabung dalam batch</h2>
          <ul className="space-y-2 font-mono text-sm">
            {(batch.details ?? []).map((detail) => (
              <li
                key={detail.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2.5 text-slate-800"
              >
                {detail.barcode_sn}
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/production/filling-batches"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Kembali ke daftar
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
