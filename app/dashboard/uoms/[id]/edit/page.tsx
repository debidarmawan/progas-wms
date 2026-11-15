"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getUom, updateUom } from "@/lib/api/uoms";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function EditUomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({ code: "", name: "" });

  useEffect(() => {
    getUom(params.id)
      .then((uom) => setDefaults({ code: uom.code, name: uom.name }))
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
      await updateUom(params.id, {
        code: String(form.get("code")),
        name: String(form.get("name")),
      });
      router.push("/dashboard/uoms");
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
      <PageHeader title={`Edit UOM ${defaults.code}`} />
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Identitas Satuan">
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
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={defaults.name}
                />
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
    </div>
  );
}
