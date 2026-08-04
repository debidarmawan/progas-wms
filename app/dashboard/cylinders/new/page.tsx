"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { createCylinder } from "@/lib/api/cylinders";
import { listMasterItems } from "@/lib/api/master-items";
import { listVendors } from "@/lib/api/vendors";
import type {
  CustomerResponse,
  MasterItemResponse,
  VendorResponse,
} from "@/lib/types/api";
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
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewCylinderPage() {
  const router = useRouter();
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcodePreview, setBarcodePreview] = useState("");
  const [ownershipType, setOwnershipType] = useState("COMPANY");

  const isCompanyOwned = ownershipType === "COMPANY";
  const needsOwner = ownershipType === "CUSTOMER" || ownershipType === "VENDOR";

  useEffect(() => {
    Promise.all([
      listMasterItems({ page: 1, limit: 100 }),
      listCustomers({ page: 1, limit: 200 }),
      listVendors({ page: 1, limit: 200 }),
    ])
      .then(([itemData, customerData, vendorData]) => {
        setItems(itemData.items.filter((item) => item.is_serialized));
        setCustomers(customerData.items);
        setVendors(vendorData.items.filter((v) => v.is_active !== false));
      })
      .catch(() => {
        setItems([]);
        setCustomers([]);
        setVendors([]);
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

    try {
      await createCylinder({
        barcode_sn: String(form.get("barcode_sn")),
        item_id: String(form.get("item_id")),
        ownership_type: ownership,
        owner_id: ownership === "COMPANY" ? undefined : ownerId,
        last_hydrotest_date: String(form.get("last_hydrotest_date")),
        remarks: String(form.get("remarks") || "").trim(),
      });
      router.push("/dashboard/cylinders");
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
      <FormPageGrid>
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
                  required
                  placeholder="Contoh: CYL-OG-000123"
                  onChange={(event) => setBarcodePreview(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="item_id">Produk Gas</Label>
                <Select id="item_id" name="item_id" required defaultValue="">
                  <option value="" disabled>
                    Pilih produk
                  </option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </Select>
              </div>
            </FormSection>

            <FormSection title="Kepemilikan & Sertifikasi" tone="accent">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ownership_type">Kepemilikan</Label>
                  <Select
                    id="ownership_type"
                    name="ownership_type"
                    defaultValue="COMPANY"
                    onChange={(event) => setOwnershipType(event.target.value)}
                  >
                    <option value="COMPANY">COMPANY</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="VENDOR">VENDOR</option>
                  </Select>
                </div>
                {needsOwner ? (
                  <div>
                    {ownershipType === "CUSTOMER" ? (
                      <>
                        <Label htmlFor="owner_id">Pelanggan Pemilik</Label>
                        <Select
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
                        </Select>
                      </>
                    ) : (
                      <>
                        <Label htmlFor="owner_id">Vendor Pemilik</Label>
                        <Select
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
                        </Select>
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

        <FormAsideStack>
          <FormAsideCard title="Preview">
            <p className="font-mono text-sm text-slate-900">
              {barcodePreview || "Barcode belum diisi"}
            </p>
            <p className="text-sm text-slate-500">
              Ownership:{" "}
              <span className="font-medium text-slate-700">
                {ownershipType}
              </span>
            </p>
            {!isCompanyOwned ? (
              <p className="text-sm text-slate-500">
                {ownershipType === "CUSTOMER"
                  ? "Wajib pilih pelanggan pemilik."
                  : "Wajib pilih vendor."}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Milik perusahaan (tanpa owner ID)
              </p>
            )}
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Tips registrasi</p>
              <ul className="space-y-1">
                <li>Pastikan barcode belum terdaftar sebelumnya.</li>
                <li>COMPANY: tidak perlu owner ID.</li>
                <li>CUSTOMER/VENDOR: wajib isi pemilik.</li>
                <li>Tanggal hydrotest harus sesuai sertifikat terakhir.</li>
              </ul>
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
