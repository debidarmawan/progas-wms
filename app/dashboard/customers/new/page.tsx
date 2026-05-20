"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createCustomer } from "@/lib/api/customers";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="animate-in max-w-xl">
      <PageHeader title="Tambah Pelanggan" />
      <Card className="shadow-[var(--shadow-card)]">
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="code">Kode</Label>
              <Input id="code" name="code" required />
            </div>
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input id="phone" name="phone" />
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input id="address" name="address" />
            </div>
            <div>
              <Label htmlFor="cylinder_quota_limit">Kuota Tabung</Label>
              <Input
                id="cylinder_quota_limit"
                name="cylinder_quota_limit"
                type="number"
                min={0}
              />
            </div>

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
