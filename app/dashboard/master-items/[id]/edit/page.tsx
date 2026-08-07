"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getMasterItem, updateMasterItem } from "@/lib/api/master-items";
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
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function EditMasterItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSerialized, setIsSerialized] = useState(true);
  const [defaults, setDefaults] = useState({
    name: "",
    sku: "",
    gas_type: "",
    empty_weight_kg: "",
    gas_weight_kg: "",
    min_stock_alert: "",
    max_days_at_customer: "",
  });

  useEffect(() => {
    getMasterItem(params.id)
      .then((item) => {
        setIsSerialized(item.is_serialized);
        setDefaults({
          name: item.name,
          sku: item.sku,
          gas_type: item.gas_type || "",
          empty_weight_kg: String(item.empty_weight_kg ?? ""),
          gas_weight_kg: String(item.gas_weight_kg ?? ""),
          min_stock_alert: String(item.min_stock_alert ?? ""),
          max_days_at_customer: String(item.max_days_at_customer ?? ""),
        });
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => setFetching(false));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await updateMasterItem(params.id, {
        name: String(form.get("name")),
        gas_type: String(form.get("gas_type") || "") || undefined,
        empty_weight_kg: isSerialized
          ? Number(form.get("empty_weight_kg")) || undefined
          : undefined,
        gas_weight_kg: isSerialized
          ? Number(form.get("gas_weight_kg")) || undefined
          : undefined,
        min_stock_alert: isSerialized
          ? undefined
          : Number(form.get("min_stock_alert")) || undefined,
        max_days_at_customer: isSerialized
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

  if (fetching) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  return (
    <div className="animate-in">
      <PageHeader title="Edit Master Item" />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Informasi Dasar">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={defaults.name}
                    required
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={defaults.sku} disabled />
                </div>
              </div>
              <div>
                <Label htmlFor="gas_type">Jenis Gas</Label>
                <Input
                  id="gas_type"
                  name="gas_type"
                  defaultValue={defaults.gas_type}
                />
              </div>
              <p className="text-sm text-slate-500">
                Tipe: {isSerialized ? "Tabung (serialized)" : "Suku cadang"}
              </p>
            </FormSection>

            {isSerialized ? (
              <FormSection title="Berat Tabung" tone="accent">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="empty_weight_kg">Berat Kosong (kg)</Label>
                    <Input
                      id="empty_weight_kg"
                      name="empty_weight_kg"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={defaults.empty_weight_kg}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gas_weight_kg">Berat Gas (kg)</Label>
                    <Input
                      id="gas_weight_kg"
                      name="gas_weight_kg"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={defaults.gas_weight_kg}
                    />
                  </div>
                </div>
                <div className="max-w-sm">
                  <Label htmlFor="max_days_at_customer">
                    Maksimal Hari di Customer
                  </Label>
                  <Input
                    id="max_days_at_customer"
                    name="max_days_at_customer"
                    type="number"
                    min="0"
                    defaultValue={defaults.max_days_at_customer}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Batas maksimal (hari) tabung boleh berada di lokasi customer
                    sebelum dianggap terlambat (overdue). Isi 0 jika tidak ada
                    batasan.
                  </p>
                </div>
              </FormSection>
            ) : (
              <FormSection title="Pengaturan Stok">
                <div className="max-w-sm">
                  <Label htmlFor="min_stock_alert">Min Stock Alert</Label>
                  <Input
                    id="min_stock_alert"
                    name="min_stock_alert"
                    type="number"
                    min="0"
                    defaultValue={defaults.min_stock_alert}
                  />
                </div>
              </FormSection>
            )}

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
        </FormMainCard>

        <FormAsideStack>
          <FormAsideCard title="Item">
            <p className="font-semibold text-slate-900">{defaults.name}</p>
            <p className="font-mono text-sm text-slate-500">{defaults.sku}</p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              SKU tidak dapat diubah setelah dibuat.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
