"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createCustomer } from "@/lib/api/customers";
import { listTermOfPayments } from "@/lib/api/terms-of-payment";
import type { TermOfPaymentResponse } from "@/lib/types/api";
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
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [namePreview, setNamePreview] = useState("");
  const [quotaPreview, setQuotaPreview] = useState("");
  const [tops, setTops] = useState<TermOfPaymentResponse[]>([]);

  useEffect(() => {
    listTermOfPayments({ limit: 100 })
      .then((res) => setTops(res.items.filter((top) => top.is_active)))
      .catch(() => setTops([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createCustomer({
        name: String(form.get("name")),
        pic: String(form.get("pic") || "") || undefined,
        npwp: String(form.get("npwp") || "") || undefined,
        fax: String(form.get("fax") || "") || undefined,
        email: String(form.get("email") || "") || undefined,
        phone: String(form.get("phone") || "") || undefined,
        address: String(form.get("address") || "") || undefined,
        postal_code: String(form.get("postal_code") || "") || undefined,
        credit_limit: Number(form.get("credit_limit")) || undefined,
        term_of_payment_id:
          String(form.get("term_of_payment_id") || "") || undefined,
        sales_pic_name: String(form.get("sales_pic_name") || "") || undefined,
        sales_pic_phone: String(form.get("sales_pic_phone") || "") || undefined,
        sales_pic_email: String(form.get("sales_pic_email") || "") || undefined,
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
    <div className="animate-in">
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
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Contoh: PT Maju Industri"
                    onChange={(event) => setNamePreview(event.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pic">PIC</Label>
                  <Input
                    id="pic"
                    name="pic"
                    placeholder="Nama person in charge"
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fax">Fax</Label>
                  <Input id="fax" name="fax" placeholder="Nomor fax" />
                </div>
                <div>
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input
                    id="npwp"
                    name="npwp"
                    placeholder="00.000.000.0-000.000"
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input id="postal_code" name="postal_code" placeholder="40115" />
                </div>
                <div className="sm:col-span-2">
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
              title="Termin & Limit Kredit"
              description="Termin menentukan jatuh tempo invoice; limit kredit dipakai untuk kontrol piutang."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="term_of_payment_id">Term of Payment</Label>
                  <SearchableSelect
                    id="term_of_payment_id"
                    name="term_of_payment_id"
                    placeholder="Tanpa termin"
                  >
                    <option value="">Tanpa termin</option>
                    {tops.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.code} — {top.name} ({top.days} hari)
                      </option>
                    ))}
                  </SearchableSelect>
                </div>
                <div>
                  <Label htmlFor="credit_limit">Limit Kredit</Label>
                  <Input
                    id="credit_limit"
                    name="credit_limit"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Contoh: 25000000"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    0 berarti tanpa limit.
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Sales PIC"
              description="Kontak sales yang menangani pelanggan ini."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sales_pic_name">Nama Sales PIC</Label>
                  <Input id="sales_pic_name" name="sales_pic_name" />
                </div>
                <div>
                  <Label htmlFor="sales_pic_phone">Telepon Sales PIC</Label>
                  <Input
                    id="sales_pic_phone"
                    name="sales_pic_phone"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="sales_pic_email">Email Sales PIC</Label>
                  <Input
                    id="sales_pic_email"
                    name="sales_pic_email"
                    type="email"
                    placeholder="sales@perusahaan.com"
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
              Kode dibuat otomatis oleh sistem.
            </p>
            <p className="text-sm text-slate-500">
              Kuota: <span className="font-medium">{quotaPreview || "0"}</span>
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Tips pengisian</p>
              <ul className="space-y-1">
                <li>Kode pelanggan dibuat otomatis oleh sistem.</li>
                <li>Kuota tabung sebaiknya disesuaikan histori pemakaian.</li>
                <li>
                  PIC & kontak aktif membantu proses follow-up outstanding.
                </li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
