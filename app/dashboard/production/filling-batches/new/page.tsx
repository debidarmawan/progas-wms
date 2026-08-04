"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { submitFillingBatch } from "@/lib/api/production";
import { listMasterItems } from "@/lib/api/master-items";
import type { MasterItemResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  FormAsideCard,
  FormAsideStack,
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
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
    <div className="animate-in">
      <PageHeader
        title="Submit Filling Batch"
        description="Transaksi atomik: validasi status & cross-gas, lalu ubah tabung ke READY."
      />
      <FormPageGrid className="lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormMainCard>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <FormSection
                title="Konfigurasi Batch"
                description="Pilih produk gas sebelum scan barcode tabung."
              >
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
              </FormSection>

              <FormSection
                title="Scan Barcode Tabung"
                description="Tekan Enter setiap selesai scan."
                tone="accent"
              >
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
                <p className="text-sm text-slate-600">
                  {barcodes.length} tabung siap diproses
                </p>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                  {barcodes.length > 0 ? (
                    <ul className="space-y-1.5 text-sm font-mono">
                      {barcodes.map((code) => (
                        <li
                          key={code}
                          className="rounded-md bg-slate-50 px-2 py-1 text-slate-700"
                        >
                          {code}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-2 py-6 text-center text-sm text-slate-500">
                      Belum ada barcode discan.
                    </p>
                  )}
                </div>
              </FormSection>

              <FormSection title="Catatan Batch" className="space-y-3">
                <div>
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Catatan tambahan operator (opsional)"
                  />
                </div>
              </FormSection>

              {error ? <Alert variant="error">{error}</Alert> : null}

              <div className="flex gap-2 pt-2">
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
        </FormMainCard>

        <FormAsideStack>
          <FormAsideCard title="Ringkasan Batch">
            <p className="text-3xl font-semibold text-slate-900">{barcodes.length}</p>
            <p className="text-sm text-slate-500">tabung dalam antrian submit</p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Checklist sebelum submit</p>
              <ul className="space-y-1">
                <li>Produk gas sudah sesuai dengan tabung yang discan.</li>
                <li>Semua barcode unik dan tidak duplikat.</li>
                <li>Jumlah tabung sesuai kondisi fisik di manifold.</li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
