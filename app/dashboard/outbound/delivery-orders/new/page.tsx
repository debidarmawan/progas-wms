"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { listCustomerSites } from "@/lib/api/customer-sites";
import { issueDeliveryOrder } from "@/lib/api/outbound";
import { getSalesOrder, listSalesOrders } from "@/lib/api/sales";
import { listDrivers, listFleet } from "@/lib/api/logistics";
import type { CustomerResponse, CustomerSiteResponse, DriverResponse, FleetResponse, SalesOrderResponse, SalesOrderLineResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormMainCard, FormSection } from "@/components/ui/form-layout";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";

export default function NewDeliveryOrderPage() {
  return (
    <Suspense fallback={<p className="text-slate-600">Memuat...</p>}>
      <NewDeliveryOrderForm />
    </Suspense>
  );
}

function NewDeliveryOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetSalesOrderId = searchParams.get("sales_order_id") ?? "";
  const presetCustomerId = searchParams.get("customer_id") ?? "";
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [fleet, setFleet] = useState<FleetResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrderResponse[]>([]);
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(presetCustomerId);
  const [sites, setSites] = useState<CustomerSiteResponse[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [salesOrderLines, setSalesOrderLines] = useState<SalesOrderLineResponse[]>([]);
  const [soLinesForId, setSoLinesForId] = useState("");
  // SO detail can deep-link here (?sales_order_id=&customer_id=) to issue its DO directly.
  const activeSalesOrderId = selectedSalesOrderId || presetSalesOrderId;
  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;

  useEffect(() => {
    Promise.all([
      listCustomers({ page: 1, limit: 200 }),
      listFleet({ page: 1, limit: 100 }),
      listDrivers({ page: 1, limit: 200 }),
      listSalesOrders({ page: 1, limit: 200 }),
    ])
      .then(([customerData, fleetData, driverData, salesOrderData]) => {
        setCustomers(customerData.items);
        setFleet(fleetData.items.filter((v) => v.is_active !== false));
        setDrivers(driverData.items.filter((d) => d.is_active !== false));
        setSalesOrders(salesOrderData.items.filter((order) => order.status === "CONFIRMED" || order.status === "PARTIAL"));
      })
      .catch(() => {
        setCustomers([]);
        setFleet([]);
        setDrivers([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) return;
    let cancelled = false;
    listCustomerSites(selectedCustomerId)
      .then((res) => {
        if (cancelled) return;
        const activeSites = res.items.filter((site) => site.is_active);
        setSites(activeSites);
        // Default to the primary site; the backend does the same when no site is sent.
        const primary = activeSites.find((site) => site.is_primary);
        setSelectedSiteId(primary?.id ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setSites([]);
        setSelectedSiteId("");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!activeSalesOrderId) return;
    let cancelled = false;
    // List endpoint omits lines and cannot search by id — read the detail endpoint instead.
    getSalesOrder(activeSalesOrderId)
      .then((order) => {
        if (cancelled) return;
        setSalesOrderLines(order.lines || []);
        setSoLinesForId(activeSalesOrderId);
      })
      .catch((err) => {
        console.error("Failed to fetch SO details:", err);
        if (cancelled) return;
        setSalesOrderLines([]);
        setSoLinesForId(activeSalesOrderId);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSalesOrderId]);

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

    if (activeSalesOrderId && salesOrderLines.length === 1) {
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
        customer_site_id: selectedSiteId || undefined,
        fleet_id: String(form.get("fleet_id")),
        driver_id: String(form.get("driver_id") || "") || undefined,
        sales_order_id: activeSalesOrderId || undefined,
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
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Pelanggan, Armada & Driver" tone="accent">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customer_id">Pelanggan</Label>
                <SearchableSelect
                  id="customer_id"
                  name="customer_id"
                  required
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    setSites([]);
                    setSelectedSiteId("");
                  }}
                >
                  <option value="" disabled>Pilih pelanggan</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </SearchableSelect>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="customer_site_id">Tujuan Kirim (Site)</Label>
                <SearchableSelect
                  id="customer_site_id"
                  name="customer_site_id"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={!selectedCustomerId || sites.length === 0}
                >
                  <option value="">
                    {selectedCustomerId && sites.length === 0
                      ? "Belum ada site — pakai alamat kantor pusat"
                      : "Alamat kantor pusat pelanggan"}
                  </option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}{site.is_primary ? " (Utama)" : ""}
                    </option>
                  ))}
                </SearchableSelect>
                {selectedSite ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedSite.address || "Alamat belum diisi"}
                    {selectedSite.postal_code ? ` (${selectedSite.postal_code})` : ""}
                    {selectedSite.phone ? ` · ${selectedSite.phone}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="sales_order_id">Sales Order (opsional)</Label>
                <SearchableSelect
                  id="sales_order_id"
                  name="sales_order_id"
                  value={activeSalesOrderId}
                  onChange={(e) => setSelectedSalesOrderId(e.target.value)}
                >
                  <option value="">Tanpa referensi SO</option>
                  {salesOrders.map((order) => (
                    <option key={order.id} value={order.id}>{order.so_number} — {order.customer_name}</option>
                  ))}
                </SearchableSelect>
              </div>
              <div>
                <Label htmlFor="fleet_id">Armada</Label>
                <SearchableSelect id="fleet_id" name="fleet_id" required defaultValue="">
                  <option value="" disabled>Pilih kendaraan</option>
                  {fleet.map((v) => (
                    <option key={v.id} value={v.id}>{v.plate_number} (max {v.max_weight_kg} kg)</option>
                  ))}
                </SearchableSelect>
              </div>
              <div>
                <Label htmlFor="driver_id">Driver</Label>
                <SearchableSelect id="driver_id" name="driver_id" required={drivers.length > 0} defaultValue="">
                  <option value="" disabled>{drivers.length === 0 ? "Belum ada master driver" : "Pilih driver"}</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}{d.phone ? ` · ${d.phone}` : ""}</option>
                  ))}
                </SearchableSelect>
              </div>
            </div>
          </FormSection>

          <FormSection title="Sales Order Lines Detail" tone="accent">
            {activeSalesOrderId && soLinesForId === activeSalesOrderId && salesOrderLines.length > 0 ? (
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
            ) : activeSalesOrderId && soLinesForId !== activeSalesOrderId ? (
              <p className="text-slate-600 italic">Memuat detail Sales Order...</p>
            ) : activeSalesOrderId ? (
              <p className="text-slate-600 italic">Sales Order ini tidak memiliki baris.</p>
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
    </div>
  );
}
