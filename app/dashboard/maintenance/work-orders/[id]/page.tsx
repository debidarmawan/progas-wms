"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { completeWorkOrder, getWorkOrder } from "@/lib/api/maintenance";
import type { WorkOrderResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

export default function WorkOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [wo, setWo] = useState<WorkOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getWorkOrder(params.id)
      .then(setWo)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat WO"),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function handleComplete() {
    setCompleting(true);
    setError(null);
    try {
      await completeWorkOrder(params.id);
      load();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyelesaikan WO");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (!wo) {
    return <Alert variant="error">{error || "Data tidak ditemukan"}</Alert>;
  }

  const canComplete = wo.status !== "COMPLETED" && wo.status !== "CANCELLED";

  return (
    <div className="animate-in space-y-6">
      <PageHeader title={`WO ${wo.wo_number}`} description={wo.title} />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 font-semibold">{wo.status}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Dibuat</p>
            <p className="mt-1 font-semibold">
              {wo.created_at
                ? new Date(wo.created_at).toLocaleString("id-ID")
                : "—"}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Spare Part</p>
            <p className="mt-1 font-semibold">{wo.spareparts?.length ?? 0} item</p>
          </CardBody>
        </Card>
      </div>

      {wo.description ? (
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Deskripsi</p>
            <p className="mt-1 text-sm">{wo.description}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>SKU</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Qty</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {(wo.spareparts ?? []).length === 0 ? (
                <DataTableEmpty colSpan={3} />
              ) : (
                (wo.spareparts ?? []).map((sp) => (
                  <DataTableRow key={sp.item_id}>
                    <DataTableTd className="font-mono">{sp.sku || "—"}</DataTableTd>
                    <DataTableTd>{sp.item_name || "—"}</DataTableTd>
                    <DataTableTd>{sp.quantity}</DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>

      {canComplete ? (
        <Button disabled={completing} onClick={handleComplete}>
          {completing ? "Memproses..." : "Selesaikan WO"}
        </Button>
      ) : null}

      <Link
        href="/dashboard/maintenance/work-orders"
        className="block text-sm font-medium text-indigo-600"
      >
        ← Kembali
      </Link>
    </div>
  );
}
