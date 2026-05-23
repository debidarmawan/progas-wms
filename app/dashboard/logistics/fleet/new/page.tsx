"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createFleet } from "@/lib/api/logistics";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewFleetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createFleet({
        plate_number: String(form.get("plate_number")),
        driver_name: String(form.get("driver_name") || "") || undefined,
        max_weight_kg: Number(form.get("max_weight_kg")),
      });
      router.push("/dashboard/logistics/fleet");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-2xl">
      <PageHeader title="Tambah Armada" />
      <FormPageGrid className="lg:grid-cols-1">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Kendaraan">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plate_number">Plat Nomor</Label>
                  <Input id="plate_number" name="plate_number" required />
                </div>
                <div>
                  <Label htmlFor="driver_name">Nama Sopir</Label>
                  <Input id="driver_name" name="driver_name" />
                </div>
                <div>
                  <Label htmlFor="max_weight_kg">Kapasitas Muat (kg)</Label>
                  <Input
                    id="max_weight_kg"
                    name="max_weight_kg"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </FormSection>
            {error ? <Alert variant="error">{error}</Alert> : null}
            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Menyimpan..." : "Simpan"}
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
