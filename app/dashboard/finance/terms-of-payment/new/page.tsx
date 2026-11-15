"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createTermOfPayment } from "@/lib/api/terms-of-payment";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewTermOfPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createTermOfPayment({
        code: String(form.get("code")),
        name: String(form.get("name")),
        days: Number(form.get("days") || 0),
        is_active: form.get("is_active") === "on",
      });
      router.push("/dashboard/finance/terms-of-payment");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader title="Tambah Termin Pembayaran" />
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection
            title="Identitas Termin"
            description="Kode disimpan dalam huruf besar dan harus unik."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="code">Kode</Label>
                <Input id="code" name="code" required placeholder="NET30" />
              </div>
              <div>
                <Label htmlFor="name">Nama Termin</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Net 30 Hari"
                />
              </div>
              <div>
                <Label htmlFor="days">Jatuh Tempo (hari)</Label>
                <Input
                  id="days"
                  name="days"
                  type="number"
                  min={0}
                  max={365}
                  defaultValue={0}
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Aktif
            </label>
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
    </div>
  );
}
