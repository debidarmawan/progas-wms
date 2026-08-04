"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { issueDeliveryOrder } from "@/lib/api/outbound";
import { listFleet } from "@/lib/api/logistics";
import type { CustomerResponse, FleetResponse } from "@/lib/types/api";
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

export default function NewDeliveryOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [fleet, setFleet] = useState<FleetResponse[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      listCustomers({ page: 1, limit: 200 }),
      listFleet({ page: 1, limit: 100 }),
    ])
      .then(([customerData, fleetData]) => {
        setCustomers(customerData.items);
        setFleet(fleetData.items.filter((v) => v.is_active !== false));
      })
      .catch(() => {
        setCustomers([]);
        setFleet([]);
      });
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

    if (barcodes.length === 0) {
      setError("Scan minimal satu tabung.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await issueDeliveryOrder({
        customer_id: String(form.get("customer_id")),
        fleet_id: String(form.get("fleet_id")),
        barcodes,
        notes: String(form.get("notes") || "") || undefined,
      });
      router.push(`/dashboard/outbound/delivery-orders/${order.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat DO");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Buat Surat Jalan"
        description="Validasi berat armada, kuota pelanggan, dan status tabung sebelum pengiriman."
      />
      <FormPageGrid className="lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Pelanggan & Armada" tone="accent">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
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
                <div>
                  <Label htmlFor="fleet_id">Armada</Label>
                  <Select id="fleet_id" name="fleet_id" required defaultValue="">
                    <option value="" disabled>
                      Pilih kendaraan
                    </option>
                    {fleet.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number} (max {v.max_weight_kg} kg)
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection title="Scan Tabung Keluar">
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
              <p className="text-sm text-slate-600">{barcodes.length} tabung</p>
              <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                {barcodes.length > 0 ? (
                  <ul className="space-y-1.5 font-mono text-sm">
                    {barcodes.map((code) => (
                      <li key={code} className="rounded-md bg-slate-50 px-2 py-1">
                        {code}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-2 py-6 text-center text-sm text-slate-500">
                    Belum ada barcode.
                  </p>
                )}
              </div>
            </FormSection>

            <FormSection title="Catatan">
              <Textarea id="notes" name="notes" rows={2} placeholder="Opsional" />
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Memproses..." : "Terbitkan DO"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </form>
        </FormMainCard>

        <FormAsideStack>
          <FormAsideCard title="Ringkasan">
            <p className="text-3xl font-semibold text-slate-900">{barcodes.length}</p>
            <p className="text-sm text-slate-500">tabung akan dikirim</p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Validasi otomatis</p>
              <ul className="mt-2 space-y-1">
                <li>Berat total vs kapasitas armada</li>
                <li>Kuota outstanding pelanggan</li>
                <li>Status tabung harus siap kirim</li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
