"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createMasterItem } from "@/lib/api/master-items";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewMasterItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createMasterItem({
        name: String(form.get("name")),
        sku: String(form.get("sku")),
        gas_type: String(form.get("gas_type") || "") || undefined,
        is_serialized: form.get("is_serialized") === "true",
        empty_weight_kg: Number(form.get("empty_weight_kg")) || undefined,
        gas_weight_kg: Number(form.get("gas_weight_kg")) || undefined,
        min_stock_alert: Number(form.get("min_stock_alert")) || undefined,
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
    <div className="animate-in max-w-xl">
      <PageHeader title="Tambah Master Item" />
      <Card className="shadow-[var(--shadow-card)]">
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" required />
            </div>
            <div>
              <Label htmlFor="gas_type">Jenis Gas</Label>
              <Input id="gas_type" name="gas_type" placeholder="OXYGEN, NITROGEN, ..." />
            </div>
            <div>
              <Label htmlFor="is_serialized">Tipe Item</Label>
              <Select id="is_serialized" name="is_serialized" defaultValue="true">
                <option value="true">Tabung (serialized)</option>
                <option value="false">Suku cadang</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empty_weight_kg">Berat Kosong (kg)</Label>
                <Input id="empty_weight_kg" name="empty_weight_kg" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="gas_weight_kg">Berat Isi (kg)</Label>
                <Input id="gas_weight_kg" name="gas_weight_kg" type="number" step="0.01" />
              </div>
            </div>
            <div>
              <Label htmlFor="min_stock_alert">Min Stock Alert</Label>
              <Input id="min_stock_alert" name="min_stock_alert" type="number" />
            </div>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
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
        </CardBody>
      </Card>
    </div>
  );
}
