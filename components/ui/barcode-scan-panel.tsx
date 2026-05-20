"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function BarcodeScanPanel({
  title,
  description,
  submitLabel,
  onSubmit,
}: {
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (barcodes: string[]) => Promise<{ processed_count: number }>;
}) {
  const [input, setInput] = useState("");
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function addBarcode(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setBarcodes((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setInput("");
    setError(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addBarcode(input);
    }
  }

  function removeBarcode(value: string) {
    setBarcodes((prev) => prev.filter((item) => item !== value));
  }

  async function handleSubmit() {
    if (barcodes.length === 0) {
      setError("Scan minimal satu barcode.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onSubmit(barcodes);
      setSuccess(`Berhasil memproses ${result.processed_count} tabung.`);
      setBarcodes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses barcode.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl shadow-[var(--shadow-card)]">
      <CardHeader>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-indigo-700">
            Scanner aktif
          </p>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan atau ketik barcode lalu Enter"
              autoFocus
              className="bg-white"
            />
            <Button variant="secondary" onClick={() => addBarcode(input)}>
              Tambah
            </Button>
          </div>
        </div>

        {barcodes.length > 0 ? (
          <ul className="max-h-52 space-y-2 overflow-y-auto">
            {barcodes.map((barcode) => (
              <li
                key={barcode}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-2.5"
              >
                <span className="font-mono text-sm text-slate-800">{barcode}</span>
                <button
                  type="button"
                  className="text-xs font-medium text-rose-600 transition hover:text-rose-700"
                  onClick={() => removeBarcode(barcode)}
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
            Belum ada barcode — mulai scan untuk menambahkan.
          </p>
        )}

        {error ? <Alert variant="error">{error}</Alert> : null}
        {success ? <Alert variant="success">{success}</Alert> : null}

        <Button disabled={loading} size="lg" onClick={handleSubmit}>
          {loading ? "Memproses..." : `${submitLabel} (${barcodes.length})`}
        </Button>
      </CardBody>
    </Card>
  );
}
