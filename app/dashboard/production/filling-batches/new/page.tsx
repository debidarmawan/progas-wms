"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { submitFillingBatch } from "@/lib/api/production";
import { listMasterItems } from "@/lib/api/master-items";
import type { MasterItemResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewFillingBatchPage() {
  const router = useRouter();
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMasterItems({ page: 1, limit: 100 })
      .then((data) =>
        setItems(data.items.filter((item) => item.is_serialized)),
      )
      .catch(() => setItems([]));
  }, []);

  function addBarcode(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setBarcodes((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setScanInput("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const itemId = String(form.get("item_id"));

    if (barcodes.length === 0) {
      setError("Scan minimal satu tabung.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitFillingBatch({
        item_id: itemId,
        barcodes,
        notes: String(form.get("notes") || "") || undefined,
      });
      router.push("/dashboard/production/filling-batches");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal submit batch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-2xl">
      <PageHeader
        title="Submit Filling Batch"
        description="Transaksi atomik: validasi status & cross-gas, lalu ubah tabung ke READY."
      />
      <Card className="shadow-[var(--shadow-card)]">
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="item_id">Produk Gas</Label>
              <Select id="item_id" name="item_id" required defaultValue="">
                <option value="" disabled>
                  Pilih produk
                </option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.gas_type || "N/A"}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Scan Tabung</Label>
              <div className="flex gap-2">
                <Input
                  value={scanInput}
                  onChange={(event) => setScanInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addBarcode(scanInput);
                    }
                  }}
                  placeholder="Barcode + Enter"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addBarcode(scanInput)}
                >
                  Tambah
                </Button>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {barcodes.length} tabung siap diproses
              </p>
              {barcodes.length > 0 ? (
                <ul className="mt-2 max-h-40 overflow-y-auto rounded border border-slate-200 p-2 text-sm font-mono">
                  {barcodes.map((code) => (
                    <li key={code}>{code}</li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Memproses..." : "Submit Batch"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
