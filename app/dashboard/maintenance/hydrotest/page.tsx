"use client";

import { FormEvent, useEffect, useState } from "react";
import { listHydrotestDue, recordHydrotest } from "@/lib/api/maintenance";
import type { HydrotestDueCylinder } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableLoading,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function HydrotestDuePage() {
  const [days, setDays] = useState(30);
  const [items, setItems] = useState<HydrotestDueCylinder[]>([]);
  const [dueWithinDays, setDueWithinDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function load(dueDays: number) {
    setLoading(true);
    setError(null);
    listHydrotestDue({ days: dueDays })
      .then((data) => {
        setItems(data.items);
        setDueWithinDays(data.due_within_days);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(days);
  }, []);

  function handleFilter(event: FormEvent) {
    event.preventDefault();
    load(days);
  }

  async function handleRecord(cylinderId: string, form: HTMLFormElement) {
    const data = new FormData(form);
    setRecordingId(cylinderId);
    setSuccess(null);
    setError(null);
    try {
      await recordHydrotest(cylinderId, {
        last_hydrotest_date: String(data.get("last_hydrotest_date")),
        notes: String(data.get("notes") || "") || undefined,
      });
      setSuccess(`Hydrotest tercatat untuk tabung.`);
      load(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencatat hydrotest");
    } finally {
      setRecordingId(null);
    }
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Hydrotest Due"
        description="Tabung yang mendekati atau sudah melewati masa hydrotest."
      />

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3"
      >
        <div>
          <Label htmlFor="days">Due dalam (hari)</Label>
          <Input
            id="days"
            type="number"
            min={1}
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="w-32"
          />
        </div>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Menampilkan tabung jatuh tempo dalam {dueWithinDays} hari ke depan.
      </p>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Barcode</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Terakhir Hydrotest</DataTableTh>
              <DataTableTh>Kadaluarsa</DataTableTh>
              <DataTableTh>Catat Baru</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={5} />
              ) : items.length === 0 ? (
                <DataTableEmpty colSpan={5} />
              ) : (
                items.map((item) => (
                  <DataTableRow key={item.id}>
                    <DataTableTd className="font-mono font-medium">
                      {item.barcode_sn}
                      {item.is_expired ? (
                        <span className="ml-2 text-xs font-semibold text-rose-600">
                          EXPIRED
                        </span>
                      ) : null}
                    </DataTableTd>
                    <DataTableTd>{item.status}</DataTableTd>
                    <DataTableTd>
                      {item.last_hydrotest_date
                        ? new Date(item.last_hydrotest_date).toLocaleDateString(
                            "id-ID",
                          )
                        : "—"}
                    </DataTableTd>
                    <DataTableTd>
                      {item.expiry_date
                        ? new Date(item.expiry_date).toLocaleDateString("id-ID")
                        : "—"}
                    </DataTableTd>
                    <DataTableTd>
                      <form
                        className="flex flex-wrap items-center gap-2"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleRecord(item.id, event.currentTarget);
                        }}
                      >
                        <Input
                          name="last_hydrotest_date"
                          type="date"
                          required
                          className="w-36 py-1.5 text-xs"
                        />
                        <Input
                          name="notes"
                          placeholder="Catatan"
                          className="w-28 py-1.5 text-xs"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={recordingId === item.id}
                        >
                          {recordingId === item.id ? "..." : "Simpan"}
                        </Button>
                      </form>
                    </DataTableTd>
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
