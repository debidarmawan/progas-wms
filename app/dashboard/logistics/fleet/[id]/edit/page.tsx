"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getFleet, updateFleet } from "@/lib/api/logistics";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function EditFleetPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({
    plate_number: "",
    driver_name: "",
    max_weight_kg: "",
    is_active: true,
  });

  useEffect(() => {
    getFleet(params.id)
      .then((fleet) =>
        setDefaults({
          plate_number: fleet.plate_number,
          driver_name: fleet.driver_name || "",
          max_weight_kg: String(fleet.max_weight_kg),
          is_active: fleet.is_active !== false,
        }),
      )
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
      await updateFleet(params.id, {
        driver_name: String(form.get("driver_name") || "") || undefined,
        max_weight_kg: Number(form.get("max_weight_kg")),
        is_active: form.get("is_active") === "on",
      });
      router.push("/dashboard/logistics/fleet");
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
    <div className="animate-in max-w-2xl">
      <PageHeader title={`Edit ${defaults.plate_number}`} />
      <FormPageGrid className="lg:grid-cols-1">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Kendaraan">
              <div className="space-y-4">
                <div>
                  <Label>Plat Nomor</Label>
                  <Input value={defaults.plate_number} disabled />
                </div>
                <div>
                  <Label htmlFor="driver_name">Nama Sopir</Label>
                  <Input
                    id="driver_name"
                    name="driver_name"
                    defaultValue={defaults.driver_name}
                  />
                </div>
                <div>
                  <Label htmlFor="max_weight_kg">Kapasitas Muat (kg)</Label>
                  <Input
                    id="max_weight_kg"
                    name="max_weight_kg"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue={defaults.max_weight_kg}
                    required
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={defaults.is_active}
                  />
                  Aktif
                </label>
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
