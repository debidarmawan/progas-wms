"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createCustomer } from "@/lib/api/customers";
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

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [namePreview, setNamePreview] = useState("");
  const [codePreview, setCodePreview] = useState("");
  const [quotaPreview, setQuotaPreview] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createCustomer({
        code: String(form.get("code")),
        name: String(form.get("name")),
        phone: String(form.get("phone") || "") || undefined,
        address: String(form.get("address") || "") || undefined,
        cylinder_quota_limit:
          Number(form.get("cylinder_quota_limit")) || undefined,
      });
      router.push("/dashboard/customers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-5xl">
      <PageHeader title="Tambah Pelanggan" />
      <FormPageGrid>
        <FormMainCard>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <FormSection
                title="Identitas Pelanggan"
                description="Data identitas utama untuk transaksi distribusi tabung."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="code">Kode</Label>
                    <Input
                      id="code"
                      name="code"
                      required
                      placeholder="Contoh: CUST001"
                      onChange={(event) => setCodePreview(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Contoh: PT Maju Industri"
                      onChange={(event) => setNamePreview(event.target.value)}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Kontak & Alamat">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Telepon</Label>
                    <Input id="phone" name="phone" placeholder="08xxxxxxxxxx" />
                  </div>
                  <div>
                    <Label htmlFor="address">Alamat</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Alamat operasional pelanggan"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Pengaturan Kuota"
                tone="accent"
                className="space-y-3"
              >
                <div className="max-w-sm">
                  <Label htmlFor="cylinder_quota_limit">Kuota Tabung</Label>
                  <Input
                    id="cylinder_quota_limit"
                    name="cylinder_quota_limit"
                    type="number"
                    min={0}
                    placeholder="Contoh: 100"
                    onChange={(event) => setQuotaPreview(event.target.value)}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Dipakai untuk kontrol outstanding pinjaman tabung.
                  </p>
                </div>
              </FormSection>

              {error ? <Alert variant="error">{error}</Alert> : null}

              <div className="flex gap-2 pt-2">
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
          <FormAsideCard title="Preview">
            <p className="text-lg font-semibold text-slate-900">
              {namePreview || "Nama pelanggan"}
            </p>
            <p className="text-sm text-slate-500">
              Kode: <span className="font-mono">{codePreview || "-"}</span>
            </p>
            <p className="text-sm text-slate-500">
              Kuota: <span className="font-medium">{quotaPreview || "0"}</span>
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Tips pengisian</p>
              <ul className="space-y-1">
                <li>Kode pelanggan harus unik dan mudah dicari.</li>
                <li>Kuota tabung sebaiknya disesuaikan histori pemakaian.</li>
                <li>Kontak aktif membantu proses follow-up outstanding.</li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
