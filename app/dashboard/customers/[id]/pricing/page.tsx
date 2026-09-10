"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  createCustomerPrice,
  deleteCustomerPrice,
  listPricingMasterItems,
  listCustomerPricing,
} from "@/lib/api/customer-pricing";
import { getCustomer } from "@/lib/api/customers";
import type {
  CustomerItemPriceResponse,
  CustomerResponse,
  MasterItemResponse,
} from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableLoading,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
      }).format(new Date(value))
    : "Tanpa batas";
}

function formatPrice(value: number) {
  return value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  });
}

export default function CustomerPricingPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [prices, setPrices] = useState<CustomerItemPriceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemPickerRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    master_item_id: "",
    price: "",
    effective_from: "",
    effective_to: "",
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [customerResponse, priceResponse] = await Promise.all([
        getCustomer(params.id),
        listCustomerPricing(params.id, { page: 1, limit: 100 }),
      ]);
      setCustomer(customerResponse);
      setPrices(priceResponse.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat harga customer");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [params.id]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setItemsLoading(true);
      try {
        const response = await listPricingMasterItems(itemSearch);
        setItems(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mencari master item");
      } finally {
        setItemsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [itemSearch]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        itemPickerRef.current &&
        !itemPickerRef.current.contains(event.target as Node)
      ) {
        setItemDropdownOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selectedItem = items.find((item) => item.id === form.master_item_id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.master_item_id) {
      setError("Pilih master item terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createCustomerPrice(params.id, {
        master_item_id: form.master_item_id,
        price: Number(form.price),
        effective_from: form.effective_from,
        effective_to: form.effective_to || undefined,
      });
      setForm({
        master_item_id: "",
        price: "",
        effective_from: "",
        effective_to: "",
      });
      setItemSearch("");
      setItemDropdownOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan harga");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(price: CustomerItemPriceResponse) {
    if (!window.confirm(`Hapus harga ${price.item_name}?`)) return;
    setError(null);
    try {
      await deleteCustomerPrice(params.id, price.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus harga");
    }
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Harga Customer"
        description={customer ? `${customer.name} · harga custom per master item` : "Mengatur harga custom customer"}
      />

      <div className="flex gap-3 text-sm">
        <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/dashboard/customers">
          Kembali ke pelanggan
        </Link>
        <Link className="font-medium text-indigo-600 hover:text-indigo-700" href={`/dashboard/customers/${params.id}/edit`}>
          Edit customer
        </Link>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardBody>
          <form className="grid gap-4 lg:grid-cols-5" onSubmit={handleSubmit}>
            <div ref={itemPickerRef} className="relative">
              <Label htmlFor="master_item_id">Master Item</Label>
              <Input
                id="master_item_id"
                value={itemSearch}
                placeholder="Cari SKU atau nama item..."
                autoComplete="off"
                onFocus={() => setItemDropdownOpen(true)}
                onChange={(event) => {
                  setItemSearch(event.target.value);
                  setItemDropdownOpen(true);
                  setForm((current) => ({ ...current, master_item_id: "" }));
                }}
                required
              />
              {itemDropdownOpen ? (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {itemsLoading ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Mencari...</p>
                  ) : items.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">Master item tidak ditemukan.</p>
                  ) : (
                    items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
                        onClick={() => {
                          setForm((current) => ({ ...current, master_item_id: item.id }));
                          setItemSearch(`${item.sku} · ${item.name}`);
                          setItemDropdownOpen(false);
                        }}
                      >
                        <span className="font-mono text-xs text-slate-500">{item.sku}</span>
                        <span className="ml-2 text-slate-900">{item.name}</span>
                      </button>
                    ))
                  )}
                </div>
              ) : null}
              {selectedItem ? (
                <p className="mt-1 text-xs text-slate-500">HNA fallback: {formatPrice(selectedItem.hna_price)}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="price">Harga Custom (Rp)</Label>
              <Input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="effective_from">Mulai Berlaku</Label>
              <Input
                id="effective_from"
                type="date"
                value={form.effective_from}
                onChange={(event) => setForm((current) => ({ ...current, effective_from: event.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="effective_to">Berakhir</Label>
              <Input
                id="effective_to"
                type="date"
                value={form.effective_to}
                onChange={(event) => setForm((current) => ({ ...current, effective_to: event.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" disabled={saving} type="submit">
                {saving ? "Menyimpan..." : "Tambah Harga"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Master Item</DataTableTh>
              <DataTableTh>Harga</DataTableTh>
              <DataTableTh>Mulai</DataTableTh>
              <DataTableTh>Berakhir</DataTableTh>
              <DataTableTh>Status</DataTableTh>
              <DataTableTh>Aksi</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {loading ? (
                <DataTableLoading colSpan={6} />
              ) : prices.length === 0 ? (
                <DataTableEmpty colSpan={6} />
              ) : (
                prices.map((price) => (
                  <DataTableRow key={price.id}>
                    <DataTableTd>
                      <p className="font-medium text-slate-900">{price.item_name}</p>
                      <p className="font-mono text-xs text-slate-500">{price.item_sku}</p>
                    </DataTableTd>
                    <DataTableTd className="font-medium">{formatPrice(price.price)}</DataTableTd>
                    <DataTableTd>{formatDate(price.effective_from)}</DataTableTd>
                    <DataTableTd>{formatDate(price.effective_to)}</DataTableTd>
                    <DataTableTd>
                      <span className={price.is_active ? "font-medium text-emerald-700" : "text-slate-500"}>
                        {price.is_active ? "Aktif" : new Date(price.effective_from) > new Date() ? "Terjadwal" : "Berakhir"}
                      </span>
                    </DataTableTd>
                    <DataTableTd>
                      <Button size="sm" type="button" variant="danger" onClick={() => void handleDelete(price)}>
                        Hapus
                      </Button>
                    </DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>
    </div>
  );
}