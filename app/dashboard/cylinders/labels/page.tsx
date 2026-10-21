"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  listCylinderLabels,
  markCylinderLabelsPrinted,
} from "@/lib/api/cylinders";
import type { CylinderLabel } from "@/lib/types/api";
import { showToast } from "@/lib/flash";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const MAX_LABELS = 200;

export default function CylinderLabelsPage() {
  const [labels, setLabels] = useState<CylinderLabel[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await listCylinderLabels({
          labeled: "false",
          limit: MAX_LABELS,
        });
        // QR payload is only the SN so the label never carries stale product data.
        const entries = await Promise.all(
          rows.map(
            async (row) =>
              [
                row.id,
                await QRCode.toDataURL(row.barcode_sn, {
                  margin: 1,
                  width: 240,
                }),
              ] as const,
          ),
        );
        if (!active) return;
        setLabels(rows);
        setSelected(rows.map((row) => row.id));
        setQrCodes(Object.fromEntries(entries));
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Gagal memuat label");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const selectedLabels = labels.filter((label) => selected.includes(label.id));

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }

  async function handleMarkPrinted() {
    if (selected.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await markCylinderLabelsPrinted(selected);
      showToast(`${selected.length} label ditandai tercetak.`);
      setLoading(true);
      setReloadKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-in">
      <div className="print:hidden">
        <PageHeader
          title="Cetak Label Tabung"
          description="Label berisi QR SN yang dipakai scanner di aplikasi mobile. Setelah ditandai tercetak, barcode tidak bisa diubah lagi."
        />

        {error ? (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        ) : null}

        <Card className="mb-6">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {loading
                ? "Memuat label..."
                : `${labels.length} tabung belum pernah dicetak — ${selected.length} dipilih (maks ${MAX_LABELS} per cetak).`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loading || labels.length === 0}
                onClick={() =>
                  setSelected(
                    selected.length === labels.length
                      ? []
                      : labels.map((row) => row.id),
                  )
                }
              >
                {selected.length === labels.length && labels.length > 0
                  ? "Batalkan semua"
                  : "Pilih semua"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={selected.length === 0}
                onClick={() => window.print()}
              >
                Cetak ({selected.length})
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={saving || selected.length === 0}
                onClick={handleMarkPrinted}
              >
                {saving ? "Menyimpan..." : "Tandai Tercetak"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {selectedLabels.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 print:gap-2">
          {selectedLabels.map((label) => (
            <div
              key={label.id}
              className="relative break-inside-avoid rounded-xl border border-slate-200 bg-white p-3 text-center print:border-slate-400 print:shadow-none"
            >
              <label className="absolute left-2 top-2 flex items-center gap-1 text-xs text-slate-500 print:hidden">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggle(label.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
              </label>
              {qrCodes[label.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodes[label.id]}
                  alt={`QR ${label.barcode_sn}`}
                  className="mx-auto h-28 w-28"
                />
              ) : (
                <div className="mx-auto h-28 w-28 animate-pulse rounded bg-slate-100" />
              )}
              <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-slate-900">
                {label.barcode_sn}
              </p>
              <p className="text-xs text-slate-600">{label.item_name}</p>
              <p className="text-xs text-slate-500">{label.gas_type}</p>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <Card className="print:hidden">
          <CardBody>
            <p className="text-sm text-slate-600">
              Tidak ada label untuk dicetak. Semua tabung sudah pernah dicetak,
              atau belum ada tabung terdaftar.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
