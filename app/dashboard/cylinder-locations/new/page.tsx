"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createCylinderLocation } from "@/lib/api/cylinder-locations";
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

export default function NewCylinderLocationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      const created = await createCylinderLocation({
        code: String(form.get("code")),
        name: String(form.get("name")),
        type: String(form.get("type")) as CylinderLocationPlaceType,
        address: String(form.get("address") || "").trim(),
        notes: String(form.get("notes") || "").trim(),
      });
      setFlashMessage(created.message || "Lokasi tabung tersimpan.");
      router.push("/dashboard/cylinder-locations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader title="Tambah Lokasi Tabung" />
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection
            title="Identitas Lokasi"
            description="Kode disimpan dalam huruf besar dan harus unik. Tipe menentukan lokasi dipakai di mana."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="code">Kode</Label>
                <Input id="code" name="code" required placeholder="GD-UTAMA" />
              </div>
              <div>
                <Label htmlFor="name">Nama Lokasi</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Gudang Utama"
                />
              </div>
              <div>
                <Label htmlFor="type">Tipe</Label>
                <SearchableSelect id="type" name="type" required defaultValue="">
                  <option value="" disabled>
                    Pilih tipe lokasi
                  </option>
                  <option value="WAREHOUSE">Gudang</option>
                  <option value="FILLING_STATION">Stasiun Pengisian</option>
                  <option value="WORKSHOP">Workshop</option>
                </SearchableSelect>
              </div>
              <div>
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" name="address" placeholder="Opsional" />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Opsional — patokan, jam operasional, dll."
              />
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
