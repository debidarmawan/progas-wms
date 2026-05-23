"use client";

import { FormEvent, useEffect, useState } from "react";
import { submitStockOpname } from "@/lib/api/inventory";
import { listMasterItems } from "@/lib/api/master-items";
import type { MasterItemResponse, StockOpnameResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function StockOpnamePage() {
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StockOpnameResponse | null>(null);

  useEffect(() => {
    listMasterItems({ page: 1, limit: 200 })
      .then((data) =>
        setItems(data.items.filter((item) => !item.is_serialized)),
      )
      .catch(() => setItems([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await submitStockOpname({
        item_id: String(form.get("item_id")),
        actual_quantity: Number(form.get("actual_quantity")),
        notes: String(form.get("notes") || "") || undefined,
      });
      setResult(data);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal stock opname");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-2xl">
      <PageHeader
        title="Stock Opname"
        description="Penyesuaian stok fisik spare part terhadap sistem."
      />
      <FormPageGrid className="lg:grid-cols-1">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Opname">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item_id">Spare Part</Label>
                  <Select id="item_id" name="item_id" required defaultValue="">
                    <option value="" disabled>
                      Pilih item
                    </option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.sku} — {item.name} (sistem: {item.stock_quantity ?? 0})
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="actual_quantity">Qty Fisik Aktual</Label>
                  <Input
                    id="actual_quantity"
                    name="actual_quantity"
                    type="number"
                    min={0}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
              </div>
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}
            {result ? (
              <Alert variant="success">
                {result.item_name || result.item_id}: stok {result.quantity_before} →{" "}
                {result.quantity_after} (Δ {result.quantity_delta})
              </Alert>
            ) : null}

            <Button disabled={loading} type="submit">
              {loading ? "Memproses..." : "Submit Opname"}
            </Button>
          </form>
        </FormMainCard>
      </FormPageGrid>
    </div>
  );
}
