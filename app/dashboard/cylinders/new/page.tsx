"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createCylinder } from "@/lib/api/cylinders";
import { listMasterItems } from "@/lib/api/master-items";
import type { MasterItemResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCylinderPage() {
  const router = useRouter();
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMasterItems({ page: 1, limit: 100 })
      .then((data) =>
        setItems(data.items.filter((item) => item.is_serialized)),
      )
      .catch(() => setItems([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createCylinder({
        barcode_sn: String(form.get("barcode_sn")),
        item_id: String(form.get("item_id")),
        ownership_type: String(form.get("ownership_type")),
        owner_id: String(form.get("owner_id") || "") || undefined,
        last_hydrotest_date: String(form.get("last_hydrotest_date")),
      });
      router.push("/dashboard/cylinders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-xl">
      <PageHeader title="Registrasi Tabung" />
      <Card className="shadow-[var(--shadow-card)]">
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="barcode_sn">Barcode / Serial Number</Label>
              <Input id="barcode_sn" name="barcode_sn" required />
            </div>
            <div>
              <Label htmlFor="item_id">Produk Gas</Label>
              <Select id="item_id" name="item_id" required defaultValue="">
                <option value="" disabled>
                  Pilih produk
                </option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ownership_type">Kepemilikan</Label>
              <Select
                id="ownership_type"
                name="ownership_type"
                defaultValue="COMPANY"
              >
                <option value="COMPANY">COMPANY</option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="VENDOR">VENDOR</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="owner_id">Owner ID (opsional)</Label>
              <Input id="owner_id" name="owner_id" />
            </div>
            <div>
              <Label htmlFor="last_hydrotest_date">Tanggal Hydrotest</Label>
              <Input
                id="last_hydrotest_date"
                name="last_hydrotest_date"
                type="date"
                required
              />
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
