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
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { Input, Label } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";

function formatPrice(value: number) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  });
}

export default function NewCustomerPOPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [lines, setLines] = useState<{ master_item_id: string; quantity: number }[]>([]);
  const [itemId, setItemId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { Promise.all([listCustomers({ page: 1, limit: 200 }), listMasterItems({ page: 1, limit: 200 })]).then(([customerData, itemData]) => { setCustomers(customerData.items); setItems(itemData.items); }).catch(() => setError("Gagal memuat master data")); }, []);
  function addLine() { if (!itemId || lines.some((line) => line.master_item_id === itemId)) return; setLines([...lines, { master_item_id: itemId, quantity: Number(quantity) }]); setItemId(""); setQuantity("1"); }
  function removeLine(masterItemId: string) { setLines((current) => current.filter((line) => line.master_item_id !== masterItemId)); }
  function updateQuantity(masterItemId: string, value: string) { setLines((current) => current.map((line) => line.master_item_id === masterItemId ? { ...line, quantity: Math.max(1, Math.floor(Number(value) || 1)) } : line)); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!customerId) { setError("Pilih pelanggan terlebih dahulu."); return; } if (!lines.length) { setError("Tambahkan minimal satu item."); return; } setLoading(true); setError(null); const form = new FormData(event.currentTarget); try { const po = await createCustomerPO({ po_number: String(form.get("po_number")), customer_id: customerId, po_date: String(form.get("po_date")), valid_until: String(form.get("valid_until") || "") || undefined, lines }); router.push(`/dashboard/sales/customer-pos/${po.id}`); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat PO"); } finally { setLoading(false); } }
  return <div className="animate-in"><PageHeader title="Buat PO Pelanggan" description="Catat pesanan pelanggan sebelum diverifikasi menjadi Sales Order." /><Card><CardBody><form className="w-full space-y-5" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="po_number">Nomor PO</Label><Input id="po_number" name="po_number" required /></div><SearchableSelect id="customer_id" name="customer_id" label="Pelanggan" required placeholder="Cari kode atau nama pelanggan..." options={customers.map((customer) => ({ value: customer.id, label: `${customer.code} — ${customer.name}` }))} value={customerId} onChange={(event) => setCustomerId(event.target.value)} /><div><Label htmlFor="po_date">Tanggal PO</Label><Input id="po_date" name="po_date" type="date" required /></div><div><Label htmlFor="valid_until">Berlaku sampai</Label><Input id="valid_until" name="valid_until" type="date" /></div></div><div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_auto] sm:items-end"><div className="min-w-0"><SearchableSelect id="master_item_id" placeholder="Cari SKU atau nama item..." options={items.map((item) => ({ value: item.id, label: `${item.sku} — ${item.name}` }))} value={itemId} onChange={(event) => setItemId(event.target.value)} /></div><Input aria-label="Jumlah" className="w-full" min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><Button className="whitespace-nowrap" type="button" variant="secondary" onClick={addLine}>Tambah</Button></div><div className="overflow-hidden rounded-lg border border-slate-200"><DataTable><DataTableHead><DataTableTh>#</DataTableTh><DataTableTh>Item</DataTableTh><DataTableTh>Kategori</DataTableTh><DataTableTh className="text-right">Qty</DataTableTh><DataTableTh className="text-right">Harga</DataTableTh><DataTableTh className="text-right">Total</DataTableTh><DataTableTh className="text-right">Aksi</DataTableTh></DataTableHead><DataTableBody>{lines.length === 0 ? <DataTableEmpty colSpan={7} message="Belum ada item." /> : lines.map((line, index) => { const item = items.find((candidate) => candidate.id === line.master_item_id); const price = item?.hna_price ?? 0; return <DataTableRow key={line.master_item_id}><DataTableTd className="text-slate-500">{index + 1}</DataTableTd><DataTableTd className="font-medium text-slate-900">{item?.sku} — {item?.name}</DataTableTd><DataTableTd className="capitalize">{item?.gas_type || item?.item_type || "—"}</DataTableTd><DataTableTd className="text-right"><div className="ml-auto w-20"><Input aria-label="Jumlah" className="text-right tabular-nums" min="1" type="number" value={line.quantity} onChange={(event) => updateQuantity(line.master_item_id, event.target.value)} /></div></DataTableTd><DataTableTd className="whitespace-nowrap text-right tabular-nums">{formatPrice(price)}</DataTableTd><DataTableTd className="whitespace-nowrap text-right font-semibold tabular-nums">{formatPrice(price * line.quantity)}</DataTableTd><DataTableTd className="text-right"><button className="font-medium text-rose-600 hover:text-rose-700" type="button" onClick={() => removeLine(line.master_item_id)}>Hapus</button></DataTableTd></DataTableRow>; })}</DataTableBody></DataTable></div>{error ? <Alert variant="error">{error}</Alert> : null}<div className="flex gap-2"><Button disabled={loading} type="submit">{loading ? "Menyimpan..." : "Simpan PO"}</Button><Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button></div></form></CardBody></Card></div>;
}