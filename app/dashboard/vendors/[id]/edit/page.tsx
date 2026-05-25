"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getVendor, updateVendor } from "@/lib/api/vendors";
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

function toDateInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function EditVendorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({
    code: "",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    contract_start_date: "",
    contract_end_date: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    getVendor(params.id)
      .then((vendor) =>
        setDefaults({
          code: vendor.code,
          name: vendor.name,
          contact_person: vendor.contact_person || "",
          phone: vendor.phone || "",
          email: vendor.email || "",
          address: vendor.address || "",
          contract_start_date: toDateInput(vendor.contract_start_date),
          contract_end_date: toDateInput(vendor.contract_end_date),
          notes: vendor.notes || "",
          is_active: vendor.is_active !== false,
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
      await updateVendor(params.id, {
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
        is_active: form.get("is_active") === "on",
      });
      router.push(`/dashboard/vendors/${params.id}`);
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
    <div className="animate-in max-w-5xl">
      <PageHeader title={`Edit ${defaults.name}`} />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Identitas">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Kode</Label>
                  <Input value={defaults.code} disabled />
                </div>
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={defaults.name}
                    required
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Kontak">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    defaultValue={defaults.contact_person}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" name="phone" defaultValue={defaults.phone} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={defaults.email}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={defaults.address}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Kontrak" tone="accent">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="contract_start_date">Mulai</Label>
                  <Input
                    id="contract_start_date"
                    name="contract_start_date"
                    type="date"
                    defaultValue={defaults.contract_start_date}
                  />
                </div>
                <div>
                  <Label htmlFor="contract_end_date">Akhir</Label>
                  <Input
                    id="contract_end_date"
                    name="contract_end_date"
                    type="date"
                    defaultValue={defaults.contract_end_date}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  defaultValue={defaults.notes}
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
          <FormAsideCard title="Vendor">
            <p className="font-mono text-sm">{defaults.code}</p>
            <p className="font-semibold text-slate-900">{defaults.name}</p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              Kode vendor tidak dapat diubah.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
