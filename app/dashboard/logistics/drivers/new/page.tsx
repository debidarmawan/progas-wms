"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createDriver } from "@/lib/api/logistics";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createDriver({
        name: String(form.get("name")),
        phone: String(form.get("phone") || "") || undefined,
        license_number: String(form.get("license_number") || "") || undefined,
      });
      router.push("/dashboard/logistics/drivers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-2xl">
      <PageHeader title="Tambah Driver" />
      <FormPageGrid className="lg:grid-cols-1">
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Driver">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="phone">No. Telepon</Label>
                  <Input id="phone" name="phone" type="tel" />
                </div>
                <div>
                  <Label htmlFor="license_number">No. SIM</Label>
                  <Input id="license_number" name="license_number" />
                </div>
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
