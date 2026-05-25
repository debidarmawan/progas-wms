"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createVendor } from "@/lib/api/vendors";
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
import { Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewVendorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createVendor({
        code: String(form.get("code")),
        name: String(form.get("name")),
        contact_person: String(form.get("contact_person") || "") || undefined,
        phone: String(form.get("phone") || "") || undefined,
        email: String(form.get("email") || "") || undefined,
        address: String(form.get("address") || "") || undefined,
        contract_start_date:
          String(form.get("contract_start_date") || "") || undefined,
        contract_end_date:
          String(form.get("contract_end_date") || "") || undefined,
        notes: String(form.get("notes") || "") || undefined,
      });
      router.push("/dashboard/vendors");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-5xl">
      <PageHeader title="Tambah Vendor" />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Identitas Vendor">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="code">Kode</Label>
                  <Input id="code" name="code" required placeholder="VND001" />
                </div>
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" name="name" required />
                </div>
              </div>
            </FormSection>

            <FormSection title="Kontak">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input id="contact_person" name="contact_person" />
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input id="address" name="address" />
                </div>
              </div>
            </FormSection>

            <FormSection title="Kontrak" tone="accent">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contract_start_date">Mulai Kontrak</Label>
                  <Input
                    id="contract_start_date"
                    name="contract_start_date"
                    type="date"
                  />
                </div>
                <div>
                  <Label htmlFor="contract_end_date">Akhir Kontrak</Label>
                  <Input
                    id="contract_end_date"
                    name="contract_end_date"
                    type="date"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea id="notes" name="notes" rows={2} />
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

        <FormAsideStack>
          <FormAsideCard title="Info">
            <p className="text-sm text-slate-600">
              Vendor digunakan untuk tabung dengan kepemilikan VENDOR saat registrasi.
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              Kode vendor harus unik di sistem.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
