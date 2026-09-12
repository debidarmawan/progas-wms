"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createCustomerPO } from "@/lib/api/sales";
import { listCustomers } from "@/lib/api/customers";
import { listMasterItems } from "@/lib/api/master-items";
import type { CustomerResponse, MasterItemResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCustomerPOPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [lines, setLines] = useState<{ master_item_id: string; quantity: number }[]>([]);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { Promise.all([listCustomers({ page: 1, limit: 200 }), listMasterItems({ page: 1, limit: 200 })]).then(([customerData, itemData]) => { setCustomers(customerData.items); setItems(itemData.items); }).catch(() => setError("Gagal memuat master data")); }, []);
  function addLine() { if (!itemId || lines.some((line) => line.master_item_id === itemId)) return; setLines([...lines, { master_item_id: itemId, quantity: Number(quantity) }]); setItemId(""); setQuantity("1"); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!lines.length) { setError("Tambahkan minimal satu item."); return; } setLoading(true); setError(null); const form = new FormData(event.currentTarget); try { const po = await createCustomerPO({ po_number: String(form.get("po_number")), customer_id: String(form.get("customer_id")), po_date: String(form.get("po_date")), valid_until: String(form.get("valid_until") || "") || undefined, lines }); router.push(`/dashboard/sales/customer-pos/${po.id}`); } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat PO"); } finally { setLoading(false); } }
  return <div className="animate-in"><PageHeader title="Buat PO Pelanggan" description="Catat pesanan pelanggan sebelum diverifikasi menjadi Sales Order." /><Card><CardBody><form className="w-full space-y-5" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="po_number">Nomor PO</Label><Input id="po_number" name="po_number" required /></div><div><Label htmlFor="customer_id">Pelanggan</Label><Select id="customer_id" name="customer_id" required defaultValue=""><option value="" disabled>Pilih pelanggan</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.code} — {customer.name}</option>)}</Select></div><div><Label htmlFor="po_date">Tanggal PO</Label><Input id="po_date" name="po_date" type="date" required /></div><div><Label htmlFor="valid_until">Berlaku sampai</Label><Input id="valid_until" name="valid_until" type="date" /></div></div><div className="flex gap-2"><Select aria-label="Master item" value={itemId} onChange={(event) => setItemId(event.target.value)}><option value="">Pilih item</option>{items.map((item) => <option key={item.id} value={item.id}>{item.sku} — {item.name}</option>)}</Select><Input aria-label="Jumlah" min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><Button type="button" variant="secondary" onClick={addLine}>Tambah</Button></div><ul className="divide-y rounded-lg border border-slate-200">{lines.map((line) => { const item = items.find((candidate) => candidate.id === line.master_item_id); return <li className="flex justify-between px-3 py-2 text-sm" key={line.master_item_id}><span>{item?.sku} — {item?.name}</span><span className="font-semibold">{line.quantity}</span></li>; })}</ul>{error ? <Alert variant="error">{error}</Alert> : null}<div className="flex gap-2"><Button disabled={loading} type="submit">{loading ? "Menyimpan..." : "Simpan PO"}</Button><Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button></div></form></CardBody></Card></div>;
}