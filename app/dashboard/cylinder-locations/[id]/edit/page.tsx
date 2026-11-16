"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getCylinderLocation,
  updateCylinderLocation,
} from "@/lib/api/cylinder-locations";
import { setFlashMessage } from "@/lib/flash";
import type { CylinderLocationPlaceType } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";

type Defaults = {
  code: string;
  name: string;
  type: string;
  address: string;
  notes: string;
  is_active: boolean;
};

const EMPTY_DEFAULTS: Defaults = {
  code: "",
  name: "",
  type: "WAREHOUSE",
  address: "",
  notes: "",
  is_active: true,
};

export default function EditCylinderLocationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<Defaults>(EMPTY_DEFAULTS);

  useEffect(() => {
    getCylinderLocation(params.id)
      .then((location) =>
        setDefaults({
          code: location.code,
          name: location.name,
          type: location.type,
          address: location.address || "",
          notes: location.notes || "",
          is_active: location.is_active,
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
      const updated = await updateCylinderLocation(params.id, {
        code: String(form.get("code")),
        name: String(form.get("name")),
        type: String(form.get("type")) as CylinderLocationPlaceType,
        address: String(form.get("address") || "").trim(),
        notes: String(form.get("notes") || "").trim(),
        is_active: form.get("is_active") === "on",
      });
      setFlashMessage(updated.message || "Lokasi tabung diperbarui.");
      router.push("/dashboard/cylinder-locations");
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
      <PageHeader title={`Edit Lokasi ${defaults.code}`} />
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Identitas Lokasi">
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
                <Label htmlFor="name">Nama Lokasi</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={defaults.name}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipe</Label>
                <SearchableSelect
                  id="type"
                  name="type"
                  required
                  defaultValue={defaults.type}
                >
                  <option value="" disabled>
                    Pilih tipe lokasi
                  </option>
                  <option value="WAREHOUSE">Gudang</option>
                  <option value="FILLING_STATION">Stasiun Pengisian</option>
                  <option value="WORKSHOP">Workshop</option>
                </SearchableSelect>
                <p className="mt-1 text-xs text-slate-500">
                  Ubah tipe hanya jika lokasi belum dipakai tabung.
                </p>
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
