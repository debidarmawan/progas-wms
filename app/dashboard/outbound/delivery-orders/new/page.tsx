"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { issueDeliveryOrder } from "@/lib/api/outbound";
import { listSalesOrders } from "@/lib/api/sales";
import { listFleet } from "@/lib/api/logistics";
import type { CustomerResponse, FleetResponse, SalesOrderResponse, SalesOrderLineResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { FormAsideCard, FormAsideStack, FormMainCard, FormPageGrid, FormSection } from "@/components/ui/form-layout";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewDeliveryOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [fleet, setFleet] = useState<FleetResponse[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrderResponse[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState<string>("");
  const [salesOrderLines, setSalesOrderLines] = useState<SalesOrderLineResponse[]>([]);

  useEffect(() => {
    Promise.all([
      listCustomers({ page: 1, limit: 200 }),
      listFleet({ page: 1, limit: 100 }),
      listSalesOrders({ page: 1, limit: 200 }),
    ])
      .then(([customerData, fleetData, salesOrderData]) => {
        setCustomers(customerData.items);
        setFleet(fleetData.items.filter((v) => v.is_active !== false));
        setSalesOrders(salesOrderData.items.filter((order) => order.status === "CONFIRMED" || order.status === "PARTIAL"));
      })
      .catch(() => {
        setCustomers([]);
        setFleet([]);
      });
  }, []);

  useEffect(() => {
    if (selectedSalesOrderId) {
      const fetchSO = async () => {
        try {
          const response = await listSalesOrders({ page: 1, limit: 1, search: `id:${selectedSalesOrderId}` });
          if (response.items.length > 0) {
            setSalesOrderLines(response.items[0].lines || []);
          }
        } catch (err) {
          console.error("Failed to fetch SO details:", err);
          setSalesOrderLines([]);
        }
      };
      fetchSO();
    } else {
      setSalesOrderLines([]);
    }
  }, [selectedSalesOrderId]);

  function addBarcode(raw: string) {
    const value = raw.trim();
    if (!value) return;
    if (!barcodes.includes(value)) {
      setBarcodes((prev) => [...prev, value]);
    }
    setScanInput("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (barcodes.length === 0) {
      setError("Scan minimal satu tabung.");
      return;
    }

    // Simple frontend validation for single-item SO
    let hasValidationError = false;
    let validationMessage = "";

    if (selectedSalesOrderId && salesOrderLines.length === 1) {
      const line = salesOrderLines[0];
      const remaining = line.qty_ordered - line.qty_delivered;
      if (barcodes.length > remaining) {
        hasValidationError = true;
        validationMessage = `Qty barcode (${barcodes.length}) melebihi sisa SO (${remaining}) untuk item ${line.item_name || ''}`;
      }
    }

    if (hasValidationError) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await issueDeliveryOrder({
        customer_id: String(form.get("customer_id")),
        fleet_id: String(form.get("fleet_id")),
        sales_order_id: selectedSalesOrderId || undefined,
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
      <PageHeader title="Buat Surat Jalan" description="Validasi berat armada, kuota pelanggan, dan status tabung sebelum pengiriman." />
      <FormPageGrid className="lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Pelanggan & Armada" tone="accent">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customer_id">Pelanggan</Label>
                  <Select id="customer_id" name="customer_id" required defaultValue="">
                    <option value="" disabled>Pilih pelanggan</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="sales_order_id">Sales Order (opsional)</Label>
                  <Select
                    id="sales_order_id"
                    name="sales_order_id"
                    value={selectedSalesOrderId}
                    onChange={(e) => setSelectedSalesOrderId(e.target.value)}
                  >
                    <option value="">Tanpa referensi SO</option>
                    {salesOrders.map((order) => (
                      <option key={order.id} value={order.id}>{order.so_number} — {order.customer_name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fleet_id">Armada</Label>
                  <Select id="fleet_id" name="fleet_id" required defaultValue="">
                    <option value="" disabled>Pilih kendaraan</option>
                    {fleet.map((v) => (
                      <option key={v.id} value={v.id}>{v.plate_number} (max {v.max_weight_kg} kg)</option>
                    ))}
                  </Select>
                </div>
              </div>
            </FormSection>

            <FormSection title="Sales Order Lines Detail" tone="accent">
              {selectedSalesOrderId && salesOrderLines.length > 0 ? (
                <div className="space-y-3">
                  <table className="min-w-full border-collapse text-sm border">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border p-2 text-left">Item</th>
                        <th className="border p-2 text-right">Ordered</th>
                        <th className="border p-2 text-right">Delivered</th>
                        <th className="border p-2 text-right">Remaining</th>
                        <th className="border p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesOrderLines.map((line) => {
                        const remaining = line.qty_ordered - line.qty_delivered;
                        return (
                          <tr key={line.id} className="hover:bg-slate-50">
                            <td className="border p-2">{line.item_name || '—'}</td>
                            <td className="border p-2 text-right">{line.qty_ordered}</td>
                            <td className="border p-2 text-right">{line.qty_delivered}</td>
                            <td className="border p-2 text-right font-mono">{remaining}</td>
                            <td className="border p-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${remaining <= 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {remaining <= 0 ? "SELESAI" : "READY"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {salesOrderLines.length === 1 && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                      <p><strong>Sisa SO:</strong> <span className="font-mono">{salesOrderLines[0].qty_ordered - salesOrderLines[0].qty_delivered}</span> tabung | <strong>Ter-scan:</strong> <span className="font-mono">{barcodes.length}</span> tabung</p>
                    </div>
                  )}
                </div>
              ) : selectedSalesOrderId ? (
                <p className="text-slate-600 italic">Memuat detail Sales Order...</p>
              ) : (
                <p className="text-slate-600 italic">Pilih Sales Order untuk melihat detail barisnya</p>
              )}
            </FormSection>

            <FormSection title="Scan Tabung Keluar">
              <div className="flex gap-2">
                <Input value={scanInput} onChange={(e) => setScanInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBarcode(scanInput); } }} placeholder="Barcode + Enter" />
                <Button type="button" variant="secondary" onClick={() => addBarcode(scanInput)}>Tambah</Button>
              </div>
              <p className="text-sm text-slate-600">{barcodes.length} tabung</p>
              <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                {barcodes.length > 0 ? (
                  <ul className="space-y-1.5 font-mono text-sm">
                    {barcodes.map((code) => <li key={code} className="rounded-md bg-slate-50 px-2 py-1">{code}</li>)}
                  </ul>
                ) : (
                  <p className="px-2 py-6 text-center text-sm text-slate-500">Belum ada barcode.</p>
                )}
              </div>
            </FormSection>

            <FormSection title="Catatan">
              <Textarea id="notes" name="notes" rows={2} placeholder="Opsional" />
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">{loading ? "Memproses..." : "Terbitkan DO"}</Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button>
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
                <li>Sales Order qty validation (backend)</li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
