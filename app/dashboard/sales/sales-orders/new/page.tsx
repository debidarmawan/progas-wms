"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSalesOrder, listCustomerPOs } from "@/lib/api/sales";
import { listCustomers } from "@/lib/api/customers";
import { listMasterItems } from "@/lib/api/master-items";
import type { CustomerPOResponse, CustomerResponse, MasterItemResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [pos, setPOs] = useState<CustomerPOResponse[]>([]);
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [lines, setLines] = useState<{ master_item_id: string; qty_ordered: number }[]>([]);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { Promise.all([listCustomers({ page: 1, limit: 200 }), listCustomerPOs({ page: 1, limit: 200 }), listMasterItems({ page: 1, limit: 200 })]).then(([customerData, poData, itemData]) => { setCustomers(customerData.items); setPOs(poData.items.filter((po) => po.status === "CONFIRMED")); setItems(itemData.items); }).catch(() => setError("Gagal memuat master data")); }, []);
  function addLine() { if (!itemId || lines.some((line) => line.master_item_id === itemId)) return; setLines([...lines, { master_item_id: itemId, qty_ordered: Number(quantity) }]); setItemId(""); setQuantity("1"); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!lines.length) { setError("Tambahkan minimal satu item."); return; } setLoading(true); setError(null); const form = new FormData(event.currentTarget); try { await createSalesOrder({ customer_id: String(form.get("customer_id")), customer_po_id: String(form.get("customer_po_id") || "") || undefined, lines }); router.push("/dashboard/sales/sales-orders"); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat SO"); } finally { setLoading(false); } }
  return <div className="animate-in"><PageHeader title="Buat Sales Order" description="Buat pesanan internal dari PO pelanggan atau langsung dari customer." /><Card><CardBody><form className="w-full space-y-5" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="customer_id">Pelanggan</Label><Select id="customer_id" name="customer_id" required defaultValue=""><option value="" disabled>Pilih pelanggan</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.code} — {customer.name}</option>)}</Select></div><div><Label htmlFor="customer_po_id">PO pelanggan (opsional)</Label><Select id="customer_po_id" name="customer_po_id" defaultValue=""><option value="">Tanpa referensi PO</option>{pos.map((po) => <option key={po.id} value={po.id}>{po.po_number} — {po.customer_name}</option>)}</Select></div></div><div className="flex gap-2"><Select aria-label="Master item" value={itemId} onChange={(event) => setItemId(event.target.value)}><option value="">Pilih item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</Select><Input aria-label="Jumlah" min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><Button type="button" variant="secondary" onClick={addLine}>Tambah</Button></div><ul className="divide-y rounded-lg border border-slate-200">{lines.map((line) => { const item = items.find((candidate) => candidate.id === line.master_item_id); return <li className="flex justify-between px-3 py-2 text-sm" key={line.master_item_id}><span>{item?.sku} — {item?.name}</span><span className="font-semibold">{line.qty_ordered}</span></li>; })}</ul>{error ? <Alert variant="error">{error}</Alert> : null}<div className="flex gap-2"><Button disabled={loading} type="submit">{loading ? "Menyimpan..." : "Simpan SO"}</Button><Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button></div></form></CardBody></Card></div>;
}