"use client";

import { FormEvent, useEffect, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { processExchange } from "@/lib/api/outbound";
import type { CustomerResponse, ExchangeResponse } from "@/lib/types/api";
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
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

function BarcodeList({
  label,
  barcodes,
  scanInput,
  onScanInputChange,
  onAdd,
}: {
  label: string;
  barcodes: string[];
  scanInput: string;
  onScanInputChange: (value: string) => void;
  onAdd: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={scanInput}
          onChange={(event) => onScanInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd(scanInput);
            }
          }}
          placeholder="Barcode + Enter"
        />
        <Button type="button" variant="secondary" onClick={() => onAdd(scanInput)}>
          Tambah
        </Button>
      </div>
      <p className="text-sm text-slate-600">{barcodes.length} barcode</p>
      <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-200 p-2">
        {barcodes.length > 0 ? (
          <ul className="space-y-1 font-mono text-sm">
            {barcodes.map((code) => (
              <li key={code} className="rounded-md bg-slate-50 px-2 py-1">
                {code}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-sm text-slate-500">Kosong</p>
        )}
      </div>
    </div>
  );
}

export default function ExchangePage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [inBarcodes, setInBarcodes] = useState<string[]>([]);
  const [outBarcodes, setOutBarcodes] = useState<string[]>([]);
  const [inInput, setInInput] = useState("");
  const [outInput, setOutInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExchangeResponse | null>(null);

  useEffect(() => {
    listCustomers({ page: 1, limit: 200 })
      .then((data) => setCustomers(data.items))
      .catch(() => setCustomers([]));
  }, []);

  function addBarcode(
    raw: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    clear: () => void,
  ) {
    const value = raw.trim();
    if (!value) return;
    setter((prev) => (prev.includes(value) ? prev : [...prev, value]));
    clear();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (inBarcodes.length === 0 || outBarcodes.length === 0) {
      setError("Scan minimal satu tabung masuk dan satu tabung keluar.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await processExchange({
        customer_id: String(form.get("customer_id")),
        in_barcodes: inBarcodes,
        out_barcodes: outBarcodes,
        force_approve: form.get("force_approve") === "on",
      });
      setResult(data);
      setInBarcodes([]);
      setOutBarcodes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses pertukaran");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Pertukaran Tabung"
        description="Gate-in: tabung masuk (kosong) dan tabung keluar (terisi) dalam satu transaksi."
      />

      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Pelanggan" tone="accent">
              <div className="max-w-md">
                <Label htmlFor="customer_id">Pelanggan</Label>
                <Select id="customer_id" name="customer_id" required defaultValue="">
                  <option value="" disabled>
                    Pilih pelanggan
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="force_approve" />
                Force approve (lewati alert cross-customer)
              </label>
            </FormSection>

            <FormSection title="Scan Barcode">
              <div className="grid gap-6 lg:grid-cols-2">
                <BarcodeList
                  label="Tabung Masuk (kosong)"
                  barcodes={inBarcodes}
                  scanInput={inInput}
                  onScanInputChange={setInInput}
                  onAdd={(v) => addBarcode(v, setInBarcodes, () => setInInput(""))}
                />
                <BarcodeList
                  label="Tabung Keluar (terisi)"
                  barcodes={outBarcodes}
                  scanInput={outInput}
                  onScanInputChange={setOutInput}
                  onAdd={(v) => addBarcode(v, setOutBarcodes, () => setOutInput(""))}
                />
              </div>
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}
            {result ? (
              <Alert variant="success">
                Pertukaran berhasil. Masuk: {result.in_count}, Keluar:{" "}
                {result.out_count}. Outstanding {result.outstanding_before} →{" "}
                {result.outstanding_after} (Δ {result.outstanding_delta})
                {result.cross_customer_alerts &&
                result.cross_customer_alerts.length > 0 ? (
                  <span className="mt-2 block text-amber-700">
                    Alert: {result.cross_customer_alerts.join(", ")}
                  </span>
                ) : null}
              </Alert>
            ) : null}

            <Button disabled={loading} type="submit" size="lg">
              {loading ? "Memproses..." : "Proses Pertukaran"}
            </Button>
          </form>
        </FormMainCard>

        <FormAsideStack>
          <FormAsideCard title="Alur">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Tabung masuk: status EMPTY dari pelanggan</li>
              <li>Tabung keluar: status OUTSTANDING ke pelanggan</li>
              <li>Outstanding dihitung otomatis</li>
            </ul>
          </FormAsideCard>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
