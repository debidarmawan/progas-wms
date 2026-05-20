"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getCustomer, updateCustomer } from "@/lib/api/customers";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({
    name: "",
    phone: "",
    address: "",
    cylinder_quota_limit: "",
    is_active: true,
  });

  useEffect(() => {
    getCustomer(params.id)
      .then((customer) =>
        setDefaults({
          name: customer.name,
          phone: customer.phone || "",
          address: customer.address || "",
          cylinder_quota_limit: String(customer.cylinder_quota_limit ?? ""),
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
        phone: String(form.get("phone") || "") || undefined,
        address: String(form.get("address") || "") || undefined,
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
    <div className="animate-in max-w-xl">
      <PageHeader title="Edit Pelanggan" />
      <Card className="shadow-[var(--shadow-card)]">
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={defaults.phone}
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
            <div>
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
        </CardBody>
      </Card>
    </div>
  );
}
