"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getDriver, updateDriver } from "@/lib/api/logistics";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function EditDriverPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({
    name: "",
    phone: "",
    license_number: "",
    is_active: true,
  });

  useEffect(() => {
    getDriver(params.id)
      .then((driver) =>
        setDefaults({
          name: driver.name,
          phone: driver.phone || "",
          license_number: driver.license_number || "",
          is_active: driver.is_active !== false,
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
      await updateDriver(params.id, {
        name: String(form.get("name")),
        phone: String(form.get("phone") || "") || undefined,
        license_number: String(form.get("license_number") || "") || undefined,
        is_active: form.get("is_active") === "on",
      });
      router.push("/dashboard/logistics/drivers");
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
      <PageHeader title={`Edit ${defaults.name}`} />
      <FormPageGrid className="lg:grid-cols-1">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Driver">
              <div className="space-y-4">
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
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={defaults.phone}
                  />
                </div>
                <div>
                  <Label htmlFor="license_number">No. SIM</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    defaultValue={defaults.license_number}
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
      </FormPageGrid>
    </div>
  );
}
