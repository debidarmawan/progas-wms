"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createMasterItem } from "@/lib/api/master-items";
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

function generateSkuFromName(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export default function NewMasterItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSerialized, setIsSerialized] = useState(true);
  const [itemNamePreview, setItemNamePreview] = useState("");
  const [skuPreview, setSkuPreview] = useState("");
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      const serialized = form.get("is_serialized") === "true";
      await createMasterItem({
        name: String(form.get("name")),
        sku: String(form.get("sku")),
        item_type: String(form.get("item_type")) as "gas" | "liquid" | "mix",
        gas_type: String(form.get("gas_type") || "") || undefined,
        hna_price: Number(form.get("hna_price")) || 0,
        is_serialized: serialized,
        empty_weight_kg: Number(form.get("empty_weight_kg")) || undefined,
        gas_weight_kg: Number(form.get("gas_weight_kg")) || undefined,
        min_stock_alert: serialized
          ? undefined
          : Number(form.get("min_stock_alert")) || undefined,
        max_days_at_customer: serialized
          ? Number(form.get("max_days_at_customer")) || undefined
          : undefined,
      });
      router.push("/dashboard/master-items");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader title="Tambah Master Item" />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection
              title="Informasi Dasar"
              description="Data utama item yang akan tampil di master data."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Contoh: Gas Oksigen 6m3"
                    value={itemNamePreview}
                    onChange={(event) => {
                      const value = event.target.value;
                      setItemNamePreview(value);
                      if (!isSkuManuallyEdited) {
                        setSkuPreview(generateSkuFromName(value));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    required
                    placeholder="Auto generate dari nama item"
                    value={skuPreview}
                    onChange={(event) => {
                      setSkuPreview(event.target.value.toUpperCase());
                      setIsSkuManuallyEdited(true);
                    }}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    SKU otomatis dibuat dari nama item, namun tetap bisa Anda
                    ubah manual.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="item_type">Jenis</Label>
                  <Select id="item_type" name="item_type" defaultValue="gas">
                    <option value="gas">Gas</option>
                    <option value="liquid">Liquid</option>
                    <option value="mix">Mix</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gas_type">Jenis Gas</Label>
                  <Input
                    id="gas_type"
                    name="gas_type"
                    placeholder="OXYGEN, NITROGEN, ..."
                  />
                </div>
                <div>
                  <Label htmlFor="hna_price">HNA Price (Rp)</Label>
                  <Input
                    id="hna_price"
                    name="hna_price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Contoh: 150000"
                  />
                </div>
                <div>
                  <Label htmlFor="is_serialized">Tipe Item</Label>
                  <Select
                    id="is_serialized"
                    name="is_serialized"
                    defaultValue="true"
                    onChange={(event) =>
                      setIsSerialized(event.target.value === "true")
                    }
                  >
                    <option value="true">Tabung (serialized)</option>
                    <option value="false">Suku cadang</option>
                  </Select>
                </div>
              </div>
            </FormSection>

            {isSerialized ? (
              <FormSection
                title="Informasi Berat Tabung"
                description="Digunakan untuk estimasi berat muatan logistik."
                tone="accent"
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="empty_weight_kg">
                      Berat Tabung Kosong (kg)
                    </Label>
                    <Input
                      id="empty_weight_kg"
                      name="empty_weight_kg"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Contoh: 50"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Berat fisik tabung tanpa isi gas.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="gas_weight_kg">Berat Gas Penuh (kg)</Label>
                    <Input
                      id="gas_weight_kg"
                      name="gas_weight_kg"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Contoh: 7"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Berat gas saat tabung terisi penuh.
                    </p>
                  </div>
                </div>
                <p className="rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-600">
                  Total berat tabung terisi = berat tabung kosong + berat gas
                  penuh.
                </p>
              </FormSection>
            ) : (
              <FormSection
                title="Informasi Berat Tabung"
                tone="muted"
                className="text-sm text-slate-600"
              >
                Item suku cadang tidak memerlukan kolom berat tabung.
              </FormSection>
            )}

            {isSerialized ? (
              <FormSection
                title="Pengaturan Stok Tabung"
                tone="muted"
                className="space-y-3"
              >
                <div className="max-w-sm">
                  <Label htmlFor="max_days_at_customer">
                    Maksimal Hari di Customer
                  </Label>
                  <Input
                    id="max_days_at_customer"
                    name="max_days_at_customer"
                    type="number"
                    min="0"
                    placeholder="Contoh: 30"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Batas maksimal (hari) tabung boleh berada di lokasi customer
                    sebelum dianggap terlambat (overdue). Isi 0 jika tidak ada
                    batasan.
                  </p>
                </div>
                <p className="rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-600">
                  Untuk item tabung (serialized),{" "}
                  <strong>Min Stock Alert</strong> tidak digunakan karena
                  kontrol stok dilakukan dari jumlah unit barcode per status
                  (READY, EMPTY, OUTSTANDING, dll).
                </p>
              </FormSection>
            ) : (
              <FormSection title="Pengaturan Stok" className="space-y-3">
                <div className="max-w-sm">
                  <Label htmlFor="min_stock_alert">Min Stock Alert</Label>
                  <Input
                    id="min_stock_alert"
                    name="min_stock_alert"
                    type="number"
                    min="0"
                    placeholder="Contoh: 10"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Alert akan muncul jika stok spare part turun di bawah nilai
                    ini.
                  </p>
                </div>
              </FormSection>
            )}

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2 pt-2">
              <Button disabled={loading} type="submit">
                {loading ? "Menyimpan..." : "Simpan"}
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
          <FormAsideCard title="Preview">
            <p className="text-lg font-semibold text-slate-900">
              {itemNamePreview || "Nama item akan tampil di sini"}
            </p>
            <p className="text-sm text-slate-500">
              SKU: <span className="font-mono">{skuPreview || "-"}</span>
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Tips pengisian</p>
              <ul className="space-y-1">
                <li>Gunakan SKU singkat dan unik agar mudah dicari.</li>
                <li>Pilih tipe item dengan benar sebelum menyimpan.</li>
                <li>Isi Min Stock Alert hanya untuk item suku cadang.</li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
