"use client";

import { FormEvent, useState } from "react";
import { getTurnaroundReport } from "@/lib/api/reports";
import type { TurnaroundReportResponse } from "@/lib/types/api";
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

export default function TurnaroundPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TurnaroundReportResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = String(form.get("from") || "") || undefined;
    const to = String(form.get("to") || "") || undefined;

    setLoading(true);
    setError(null);

    try {
      const data = await getTurnaroundReport({ from, to });
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Turnaround Rate"
        description="Rata-rata siklus tabung dari keluar gudang hingga kembali."
      />

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="from">Dari</Label>
          <Input id="from" name="from" type="date" />
        </div>
        <div>
          <Label htmlFor="to">Sampai</Label>
          <Input id="to" name="to" type="date" />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Memuat..." : "Generate"}
        </Button>
      </form>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-xs text-slate-500">Rata-rata (hari)</p>
                <p className="mt-1 text-2xl font-semibold">
                  {report.average_days.toFixed(1)}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-slate-500">Sampel</p>
                <p className="mt-1 text-2xl font-semibold">{report.sample_count}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-slate-500">Periode</p>
                <p className="mt-1 text-sm font-medium">
                  {report.from_date || "—"} s/d {report.to_date || "—"}
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="p-0">
              <DataTable>
                <DataTableHead>
                  <DataTableTh>Barcode</DataTableTh>
                  <DataTableTh>Mulai</DataTableTh>
                  <DataTableTh>Selesai</DataTableTh>
                  <DataTableTh>Hari</DataTableTh>
                </DataTableHead>
                <DataTableBody>
                  {report.samples.length === 0 ? (
                    <DataTableEmpty colSpan={4} />
                  ) : (
                    report.samples.map((sample) => (
                      <DataTableRow key={sample.barcode_sn}>
                        <DataTableTd className="font-mono">
                          {sample.barcode_sn}
                        </DataTableTd>
                        <DataTableTd>
                          {sample.started_at
                            ? new Date(sample.started_at).toLocaleDateString("id-ID")
                            : "—"}
                        </DataTableTd>
                        <DataTableTd>
                          {sample.completed_at
                            ? new Date(sample.completed_at).toLocaleDateString(
                                "id-ID",
                              )
                            : "—"}
                        </DataTableTd>
                        <DataTableTd>{sample.days.toFixed(1)}</DataTableTd>
                      </DataTableRow>
                    ))
                  )}
                </DataTableBody>
              </DataTable>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  );
}
