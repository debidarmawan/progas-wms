"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createCustomerPO } from "@/lib/api/sales";
import { listCustomers } from "@/lib/api/customers";
import { listMasterItems } from "@/lib/api/master-items";
import type { CustomerResponse, MasterItemResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

type SearchablePickerProps<T> = {
  id: string;
  label?: string;
  required?: boolean;
  placeholder: string;
  items: T[];
  value: string;
  onChange: (value: string) => void;
  getId: (item: T) => string;
  getLabel: (item: T) => string;
};

function SearchablePicker<T>({
  id,
  label,
  required = false,
  placeholder,
  items,
  value,
  onChange,
  getId,
  getLabel,
}: SearchablePickerProps<T>) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find((item) => getId(item) === value);
  const filteredItems = items.filter((item) =>
    getLabel(item).toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={pickerRef} className="relative">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Input
        id={id}
        value={selectedItem ? getLabel(selectedItem) : search}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          onChange("");
          setOpen(true);
        }}
        required={required}
      />
      <input name={id} type="hidden" value={value} />
      {open ? (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {filteredItems.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">Pilihan tidak ditemukan.</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={getId(item)}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
                onClick={() => {
                  onChange(getId(item));
                  setSearch("");
                  setOpen(false);
                }}
              >
                {getLabel(item)}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
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
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!customerId) { setError("Pilih pelanggan terlebih dahulu."); return; } if (!lines.length) { setError("Tambahkan minimal satu item."); return; } setLoading(true); setError(null); const form = new FormData(event.currentTarget); try { const po = await createCustomerPO({ po_number: String(form.get("po_number")), customer_id: customerId, po_date: String(form.get("po_date")), valid_until: String(form.get("valid_until") || "") || undefined, lines }); router.push(`/dashboard/sales/customer-pos/${po.id}`); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat PO"); } finally { setLoading(false); } }
  return <div className="animate-in"><PageHeader title="Buat PO Pelanggan" description="Catat pesanan pelanggan sebelum diverifikasi menjadi Sales Order." /><Card><CardBody><form className="w-full space-y-5" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="po_number">Nomor PO</Label><Input id="po_number" name="po_number" required /></div><SearchablePicker id="customer_id" label="Pelanggan" required placeholder="Cari kode atau nama pelanggan..." items={customers} value={customerId} onChange={setCustomerId} getId={(customer) => customer.id} getLabel={(customer) => `${customer.code} — ${customer.name}`} /><div><Label htmlFor="po_date">Tanggal PO</Label><Input id="po_date" name="po_date" type="date" required /></div><div><Label htmlFor="valid_until">Berlaku sampai</Label><Input id="valid_until" name="valid_until" type="date" /></div></div><div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_auto] sm:items-end"><div className="min-w-0"><SearchablePicker id="master_item_id" label="" placeholder="Cari SKU atau nama item..." items={items} value={itemId} onChange={setItemId} getId={(item) => item.id} getLabel={(item) => `${item.sku} — ${item.name}`} /></div><Input aria-label="Jumlah" className="w-full" min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><Button className="whitespace-nowrap" type="button" variant="secondary" onClick={addLine}>Tambah</Button></div><ul className="divide-y rounded-lg border border-slate-200">{lines.map((line) => { const item = items.find((candidate) => candidate.id === line.master_item_id); return <li className="flex justify-between px-3 py-2 text-sm" key={line.master_item_id}><span>{item?.sku} — {item?.name}</span><span className="font-semibold">{line.quantity}</span></li>; })}</ul>{error ? <Alert variant="error">{error}</Alert> : null}<div className="flex gap-2"><Button disabled={loading} type="submit">{loading ? "Menyimpan..." : "Simpan PO"}</Button><Button type="button" variant="secondary" onClick={() => router.back()}>Batal</Button></div></form></CardBody></Card></div>;
}