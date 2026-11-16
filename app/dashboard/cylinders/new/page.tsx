"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { listCylinderLocations } from "@/lib/api/cylinder-locations";
import { createCylinder } from "@/lib/api/cylinders";
import { listMasterItems } from "@/lib/api/master-items";
import { listVendors } from "@/lib/api/vendors";
import { setFlashMessage } from "@/lib/flash";
import type {
  CustomerResponse,
  CylinderLocationResponse,
  CylinderLocationType,
  MasterItemResponse,
  VendorResponse,
} from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CylinderLocationFields } from "@/components/ui/cylinder-location-fields";
import {
  FormMainCard,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCylinderPage() {
  const router = useRouter();
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [locations, setLocations] = useState<CylinderLocationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownershipType, setOwnershipType] = useState("COMPANY");
  const [itemId, setItemId] = useState("");

  const needsOwner = ownershipType === "CUSTOMER" || ownershipType === "VENDOR";
  const itemDefaultDays =
    items.find((item) => item.id === itemId)?.max_days_at_customer ?? 0;

  useEffect(() => {
    Promise.all([
      listMasterItems({ page: 1, limit: 100 }),
      listCustomers({ page: 1, limit: 200 }),
      listVendors({ page: 1, limit: 200 }),
      listCylinderLocations({ page: 1, limit: 200 }),
    ])
      .then(([itemData, customerData, vendorData, locationData]) => {
        setItems(itemData.items.filter((item) => item.is_serialized));
        setCustomers(customerData.items);
        setVendors(vendorData.items.filter((v) => v.is_active !== false));
        setLocations(locationData.items.filter((l) => l.is_active));
      })
      .catch(() => {
        setItems([]);
        setCustomers([]);
        setVendors([]);
        setLocations([]);
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    const ownership = String(form.get("ownership_type"));
    const ownerId = String(form.get("owner_id") || "").trim();

    if (ownership !== "COMPANY" && !ownerId) {
      setError(
        ownership === "CUSTOMER"
          ? "Pilih pelanggan pemilik tabung."
          : "Pilih vendor pemilik tabung.",
      );
      setLoading(false);
      return;
    }

    const locationType = String(form.get("location_type") || "").trim();
    const locationId = String(form.get("location_id") || "").trim();

    if (locationType && !locationId) {
      setError("Pilih detail lokasi untuk tipe lokasi yang dipilih.");
      setLoading(false);
      return;
    }

    try {
      const barcode = String(form.get("barcode_sn") || "").trim();
      const maxDaysRaw = String(form.get("max_days_at_customer") || "").trim();
      const created = await createCylinder({
        barcode_sn: barcode || undefined,
        item_id: String(form.get("item_id")),
        ownership_type: ownership,
        owner_id: ownership === "COMPANY" ? undefined : ownerId,
        last_hydrotest_date: String(form.get("last_hydrotest_date")),
        remarks: String(form.get("remarks") || "").trim(),
        location_type: locationType
          ? (locationType as CylinderLocationType)
          : undefined,
        location_id: locationId || undefined,
        max_days_at_customer:
          maxDaysRaw === "" ? undefined : Number(maxDaysRaw),
      });
      setFlashMessage(
        `Tabung ${created.barcode_sn} terdaftar. Lanjut cetak labelnya.`,
      );
      router.push("/dashboard/cylinders/labels");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader title="Registrasi Tabung" />
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection
            title="Identitas Tabung"
            description="Setiap tabung harus memiliki barcode unik dan produk yang sesuai."
          >
            <div>
              <Label htmlFor="barcode_sn">Barcode / Serial Number</Label>
              <Input
                id="barcode_sn"
                name="barcode_sn"
                placeholder="Kosongkan untuk dibuat otomatis (PG-XXXX-XXXXXX)"
              />
              <p className="mt-1 text-xs text-slate-500">
                Isi hanya jika tabung sudah punya SN lama. 6–32 karakter A-Z,
                0-9, atau tanda hubung.
              </p>
            </div>
            <div>
              <Label htmlFor="item_id">Produk Gas</Label>
              <SearchableSelect id="item_id" name="item_id" required defaultValue="" onChange={(event) => setItemId(event.target.value)}>
                <option value="" disabled>
                  Pilih produk
                </option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </SearchableSelect>
            </div>
          </FormSection>

          <FormSection title="Kepemilikan & Sertifikasi" tone="accent">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ownership_type">Kepemilikan</Label>
                <SearchableSelect
                  id="ownership_type"
                  name="ownership_type"
                  defaultValue="COMPANY"
                  onChange={(event) => setOwnershipType(event.target.value)}
                >
                  <option value="COMPANY">COMPANY</option>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="VENDOR">VENDOR</option>
                </SearchableSelect>
              </div>
              {needsOwner ? (
                <div>
                  {ownershipType === "CUSTOMER" ? (
                    <>
                      <Label htmlFor="owner_id">Pelanggan Pemilik</Label>
                      <SearchableSelect
                        id="owner_id"
                        name="owner_id"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Pilih pelanggan
                        </option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.code} — {customer.name}
                          </option>
                        ))}
                      </SearchableSelect>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="owner_id">Vendor Pemilik</Label>
                      <SearchableSelect
                        id="owner_id"
                        name="owner_id"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Pilih vendor
                        </option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.code} — {vendor.name}
                          </option>
                        ))}
                      </SearchableSelect>
                    </>
                  )}
                </div>
              ) : (
                <p className="flex items-end pb-2 text-sm text-slate-500">
                  Tabung milik perusahaan — tidak perlu pemilik eksternal.
                </p>
              )}
            </div>
            <div className="max-w-sm">
              <Label htmlFor="last_hydrotest_date">Tanggal Hydrotest</Label>
              <Input
                id="last_hydrotest_date"
                name="last_hydrotest_date"
                type="date"
                required
              />
            </div>
          </FormSection>

          <FormSection
            title="Lokasi Tabung"
            description="Kosongkan untuk memakai default gudang tanpa lokasi spesifik."
          >
            <CylinderLocationFields
              locations={locations}
              customers={customers}
              vendors={vendors}
              emptyLabel="Default gudang (belum spesifik)"
            />
            <div className="max-w-sm">
              <Label htmlFor="max_days_at_customer">
                Maksimal Hari di Customer
              </Label>
              <Input
                id="max_days_at_customer"
                name="max_days_at_customer"
                type="number"
                min={0}
                max={3650}
                placeholder={
                  itemDefaultDays > 0
                    ? `Ikut produk (${itemDefaultDays} hari)`
                    : "0 = tanpa batas"
                }
              />
              <p className="mt-1 text-xs text-slate-500">
                Kosongkan untuk mengikuti default produk. 0 = tanpa batas.
              </p>
            </div>
          </FormSection>

          <FormSection title="Keterangan">
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                rows={3}
                placeholder="Opsional — catatan kondisi tabung, sertifikat, dll."
              />
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
    </div>
  );
}
