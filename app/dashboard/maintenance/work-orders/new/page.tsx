"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createWorkOrder } from "@/lib/api/maintenance";
import { listMasterItems } from "@/lib/api/master-items";
import type { MasterItemResponse, WorkOrderSparepartLine } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

type SparepartRow = WorkOrderSparepartLine & { key: string };

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<MasterItemResponse[]>([]);
  const [lines, setLines] = useState<SparepartRow[]>([
    { key: "1", item_id: "", quantity: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMasterItems({ page: 1, limit: 200 })
      .then((data) =>
        setSpareparts(data.items.filter((item) => !item.is_serialized)),
      )
      .catch(() => setSpareparts([]));
  }, []);

  function addLine() {
    setLines((prev) => [
      ...prev,
      { key: String(Date.now()), item_id: "", quantity: 1 },
    ]);
  }

  function updateLine(key: string, field: "item_id" | "quantity", value: string) {
    setLines((prev) =>
      prev.map((line) =>
        line.key === key
          ? {
              ...line,
              [field]: field === "quantity" ? Number(value) || 1 : value,
            }
          : line,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const validLines = lines.filter((l) => l.item_id && l.quantity > 0);

    if (validLines.length === 0) {
      setError("Tambahkan minimal satu spare part.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const wo = await createWorkOrder({
        title: String(form.get("title")),
        description: String(form.get("description") || "") || undefined,
        spareparts: validLines.map(({ item_id, quantity }) => ({
          item_id,
          quantity,
        })),
      });
      router.push(`/dashboard/maintenance/work-orders/${wo.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat WO");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-3xl">
      <PageHeader title="Buat Work Order" />
      <FormPageGrid className="lg:grid-cols-1">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Informasi WO">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Spare Part" tone="accent">
              <div className="space-y-3">
                {lines.map((line) => (
                  <div key={line.key} className="flex gap-2">
                    <Select
                      value={line.item_id}
                      onChange={(event) =>
                        updateLine(line.key, "item_id", event.target.value)
                      }
                      className="flex-1"
                    >
                      <option value="">Pilih spare part</option>
                      {spareparts.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.sku} — {item.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.key, "quantity", event.target.value)
                      }
                      className="w-24"
                    />
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addLine}>
                  + Tambah baris
                </Button>
              </div>
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Menyimpan..." : "Buat WO"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Batal
              </Button>
            </div>
          </form>
        </FormMainCard>
      </FormPageGrid>
    </div>
  );
}
