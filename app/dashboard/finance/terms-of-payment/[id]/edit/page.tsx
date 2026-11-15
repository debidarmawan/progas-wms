"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getTermOfPayment,
  updateTermOfPayment,
} from "@/lib/api/terms-of-payment";
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

type Defaults = {
  code: string;
  name: string;
  days: number;
  is_active: boolean;
};

const EMPTY_DEFAULTS: Defaults = {
  code: "",
  name: "",
  days: 0,
  is_active: true,
};

export default function EditTermOfPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<Defaults>(EMPTY_DEFAULTS);

  useEffect(() => {
    getTermOfPayment(params.id)
      .then((top) =>
        setDefaults({
          code: top.code,
          name: top.name,
          days: top.days,
          is_active: top.is_active,
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
      await updateTermOfPayment(params.id, {
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

  if (fetching) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  return (
    <div className="animate-in">
      <PageHeader title={`Edit Termin ${defaults.code}`} />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Identitas Termin">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="code">Kode</Label>
                  <Input
                    id="code"
                    name="code"
                    required
                    defaultValue={defaults.code}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nama Termin</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={defaults.name}
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
                    required
                    defaultValue={defaults.days}
                  />
                </div>
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
          <FormAsideCard title="Termin">
            <p className="font-mono text-sm">{defaults.code}</p>
            <p className="font-semibold text-slate-900">{defaults.name}</p>
            <p className="mt-1 text-sm text-slate-600">
              {defaults.days === 0
                ? "Tunai (0 hari)"
                : `${defaults.days} hari`}
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              Invoice yang sudah memakai termin ini tidak berubah saat termin
              diedit — jatuh temponya sudah tersimpan.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
