"use client";

import { FormEvent, useState } from "react";
import { getStockLedger } from "@/lib/api/reports";
import type { StockLedgerReportResponse } from "@/lib/types/api";
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
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function StockLedgerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<StockLedgerReportResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const barcode = String(form.get("barcode")).trim();
    if (!barcode) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const data = await getStockLedger(barcode);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat ledger");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Stock Ledger"
        description="Riwayat perubahan status tabung per barcode."
      />

      <form onSubmit={handleSubmit} className="flex max-w-md flex-wrap gap-3">
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" name="barcode" required placeholder="Scan atau ketik" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Memuat..." : "Cari"}
          </Button>
        </div>
      </form>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {report ? (
        <Card>
          <CardBody className="p-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="font-mono font-semibold text-slate-900">
                {report.barcode_sn}
              </p>
              <p className="text-sm text-slate-500">
                {report.entries.length} entri riwayat
              </p>
            </div>
            <DataTable>
              <DataTableHead>
                <DataTableTh>Waktu</DataTableTh>
                <DataTableTh>Aksi</DataTableTh>
                <DataTableTh>Dari</DataTableTh>
                <DataTableTh>Ke</DataTableTh>
                <DataTableTh>Referensi</DataTableTh>
              </DataTableHead>
              <DataTableBody>
                {report.entries.length === 0 ? (
                  <DataTableEmpty colSpan={5} />
                ) : (
                  report.entries.map((entry) => (
                    <DataTableRow key={entry.id}>
                      <DataTableTd>
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleString("id-ID")
                          : "—"}
                      </DataTableTd>
                      <DataTableTd>{entry.action}</DataTableTd>
                      <DataTableTd>{entry.from_status || "—"}</DataTableTd>
                      <DataTableTd>{entry.to_status || "—"}</DataTableTd>
                      <DataTableTd className="text-xs">
                        {entry.reference_type
                          ? `${entry.reference_type} ${entry.reference_id || ""}`
                          : "—"}
                      </DataTableTd>
                    </DataTableRow>
                  ))
                )}
              </DataTableBody>
            </DataTable>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
