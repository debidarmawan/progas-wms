"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getCustomer, updateCustomer } from "@/lib/api/customers";
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

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tops, setTops] = useState<TermOfPaymentResponse[]>([]);
  const [defaults, setDefaults] = useState({
    name: "",
    pic: "",
    npwp: "",
    fax: "",
    email: "",
    phone: "",
    address: "",
    postal_code: "",
    cylinder_quota_limit: "",
    credit_limit: "",
    term_of_payment_id: "",
    sales_pic_name: "",
    sales_pic_phone: "",
    sales_pic_email: "",
    is_active: true,
  });

  useEffect(() => {
    listTermOfPayments({ limit: 100 })
      .then((res) => setTops(res.items.filter((top) => top.is_active)))
      .catch(() => setTops([]));
  }, []);

  useEffect(() => {
    getCustomer(params.id)
      .then((customer) =>
        setDefaults({
          name: customer.name,
          pic: customer.pic || "",
          npwp: customer.npwp || "",
          fax: customer.fax || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          postal_code: customer.postal_code || "",
          cylinder_quota_limit: String(customer.cylinder_quota_limit ?? ""),
          credit_limit: String(customer.credit_limit ?? ""),
          term_of_payment_id: customer.term_of_payment_id || "",
          sales_pic_name: customer.sales_pic_name || "",
          sales_pic_phone: customer.sales_pic_phone || "",
          sales_pic_email: customer.sales_pic_email || "",
          is_active: customer.is_active ?? true,
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
      await updateCustomer(params.id, {
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
        is_active: form.get("is_active") === "on",
      });
      router.push("/dashboard/customers");
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
    <div className="animate-in">
      <PageHeader title="Edit Pelanggan" />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Informasi Utama">
              <div className="grid gap-4 sm:grid-cols-2">
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
                  <Label htmlFor="pic">PIC</Label>
                  <Input id="pic" name="pic" defaultValue={defaults.pic} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Kontak & Alamat">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={defaults.phone}
                  />
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
                  <Label htmlFor="fax">Fax</Label>
                  <Input id="fax" name="fax" defaultValue={defaults.fax} />
                </div>
                <div>
                  <Label htmlFor="npwp">NPWP</Label>
                  <Input id="npwp" name="npwp" defaultValue={defaults.npwp} />
                </div>
                <div>
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    defaultValue={defaults.postal_code}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={defaults.address}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Termin & Limit Kredit">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="term_of_payment_id">Term of Payment</Label>
                  <SearchableSelect
                    id="term_of_payment_id"
                    name="term_of_payment_id"
                    placeholder="Tanpa termin"
                    defaultValue={defaults.term_of_payment_id}
                  >
                    <option value="">Tanpa termin</option>
                    {tops.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.code} — {top.name} ({top.days} hari)
                      </option>
                    ))}
                  </SearchableSelect>
                  <p className="mt-1 text-xs text-slate-500">
                    Informasi saja — jatuh tempo invoice masih memakai payment
                    term pelanggan saat Issue DO.
                  </p>
                </div>
                <div>
                  <Label htmlFor="credit_limit">Limit Kredit</Label>
                  <Input
                    id="credit_limit"
                    name="credit_limit"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={defaults.credit_limit}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    0 berarti tanpa limit.
                  </p>
                </div>
              </div>
            </FormSection>

            <FormSection title="Sales PIC">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sales_pic_name">Nama Sales PIC</Label>
                  <Input
                    id="sales_pic_name"
                    name="sales_pic_name"
                    defaultValue={defaults.sales_pic_name}
                  />
                </div>
                <div>
                  <Label htmlFor="sales_pic_phone">Telepon Sales PIC</Label>
                  <Input
                    id="sales_pic_phone"
                    name="sales_pic_phone"
                    defaultValue={defaults.sales_pic_phone}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="sales_pic_email">Email Sales PIC</Label>
                  <Input
                    id="sales_pic_email"
                    name="sales_pic_email"
                    type="email"
                    defaultValue={defaults.sales_pic_email}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Pengaturan Akun" tone="accent">
              <div className="max-w-sm">
                <Label htmlFor="cylinder_quota_limit">Kuota Tabung</Label>
                <Input
                  id="cylinder_quota_limit"
                  name="cylinder_quota_limit"
                  type="number"
                  min={0}
                  defaultValue={defaults.cylinder_quota_limit}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
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
          <FormAsideCard title="Ringkasan">
            <p className="text-lg font-semibold text-slate-900">
              {defaults.name || "-"}
            </p>
            <p className="text-sm text-slate-500">
              Kuota:{" "}
              <span className="font-medium">
                {defaults.cylinder_quota_limit || "0"}
              </span>
            </p>
            <p className="text-sm text-slate-500">
              Status:{" "}
              <span className="font-medium">
                {defaults.is_active ? "Aktif" : "Nonaktif"}
              </span>
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Catatan</p>
              <ul className="space-y-1">
                <li>Perubahan kuota mempengaruhi kontrol outstanding.</li>
                <li>
                  Status nonaktif akan membatasi transaksi baru pelanggan.
                </li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
