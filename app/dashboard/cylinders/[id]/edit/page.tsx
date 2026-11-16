"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  getCylinder,
  getCylinderHistory,
  updateCylinder,
  updateCylinderMaxDays,
} from "@/lib/api/cylinders";
import { listCylinderLocations } from "@/lib/api/cylinder-locations";
import { listCustomers } from "@/lib/api/customers";
import { listMasterItems } from "@/lib/api/master-items";
import { listVendors } from "@/lib/api/vendors";
import type {
  CustomerResponse,
  CylinderHistoryChange,
  CylinderHistoryResponse,
  CylinderLocationResponse,
  CylinderLocationType,
  MasterItemResponse,
  VendorResponse,
} from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  CylinderLocationFields,
  cylinderLocationTypeLabel,
} from "@/components/ui/cylinder-location-fields";
import {
  FormMainCard,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { PageHeader } from "@/components/ui/page-header";

const cylinderStatusLabels: Record<string, string> = {
  EMPTY: "Kosong",
  READY_TO_FILL: "Siap Isi",
  FILLED: "Terisi",
  READY: "Siap Kirim",
  IN_TRANSIT: "Dalam Perjalanan",
  OUTSTANDING: "Outstanding",
  MAINTENANCE: "Perawatan",
  LOST: "Hilang",
  WRITE_OFF: "Dihapus",
};

function formatHistoryValue(change: CylinderHistoryChange, isOld: boolean) {
  const value = isOld ? change.old : change.new;
  if (!value) return "—";
  if (change.field === "status") return cylinderStatusLabels[value] || value;
  return value;
}

export default function EditCylinderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CylinderHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [locations, setLocations] = useState<CylinderLocationResponse[]>([]);
  const [defaults, setDefaults] = useState({
    barcode_sn: "",
    item_id: "",
    ownership_type: "COMPANY",
    owner_id: "",
    last_hydrotest_date: "",
    status: "",
    remarks: "",
    label_printed_at: "",
    location_type: "",
    location_name: "",
    max_days_at_customer: 0,
    outstanding_since: "",
    days_at_customer: 0,
    is_overdue: false,
  });
  const [ownershipType, setOwnershipType] = useState("COMPANY");
  const [maxDays, setMaxDays] = useState(0);
  const [maxDaysSaving, setMaxDaysSaving] = useState(false);
  const [maxDaysNotice, setMaxDaysNotice] = useState<string | null>(null);

  const needsOwner = ownershipType === "CUSTOMER" || ownershipType === "VENDOR";
  const editable =
    defaults.status === "EMPTY" || defaults.status === "READY_TO_FILL";
  const barcodeLocked = !editable || !!defaults.label_printed_at;
  const maxDaysLocked =
    defaults.status === "LOST" || defaults.status === "WRITE_OFF";

  const historyEntries = history?.entries ?? [];
  const latestEntries = historyEntries.slice(-10).reverse();

  useEffect(() => {
    Promise.all([
      getCylinder(params.id),
      getCylinderHistory(params.id),
      listMasterItems({ page: 1, limit: 100 }),
      listCustomers({ page: 1, limit: 200 }),
      listVendors({ page: 1, limit: 200 }),
      listCylinderLocations({ page: 1, limit: 200 }),
    ])
      .then(([cylinder, historyData, itemData, customerData, vendorData, locationData]) => {
        setDefaults({
          barcode_sn: cylinder.barcode_sn,
          item_id: cylinder.item_id,
          ownership_type: cylinder.ownership_type,
          owner_id: cylinder.owner_id || "",
          last_hydrotest_date: cylinder.last_hydrotest_date
            ? cylinder.last_hydrotest_date.slice(0, 10)
            : "",
          status: cylinder.status,
          remarks: cylinder.remarks || "",
          label_printed_at: cylinder.label_printed_at || "",
          location_type: cylinder.location_type,
          location_name: cylinder.location_name || "",
          max_days_at_customer: cylinder.max_days_at_customer,
          outstanding_since: cylinder.outstanding_since || "",
          days_at_customer: cylinder.days_at_customer,
          is_overdue: cylinder.is_overdue,
        });
        setOwnershipType(cylinder.ownership_type);
        setMaxDays(cylinder.max_days_at_customer);
        setHistory(historyData);
        setItems(itemData.items.filter((item) => item.is_serialized));
        setCustomers(customerData.items);
        setVendors(vendorData.items.filter((v) => v.is_active !== false));
        setLocations(locationData.items.filter((l) => l.is_active));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => {
        setFetching(false);
        setHistoryLoading(false);
      });
  }, [params.id]);

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
      await updateCylinder(params.id, {
        barcode_sn: String(form.get("barcode_sn")),
        item_id: String(form.get("item_id")),
        ownership_type: ownership,
        owner_id: ownership === "COMPANY" ? undefined : ownerId,
        last_hydrotest_date: String(form.get("last_hydrotest_date")),
        remarks: String(form.get("remarks") || "").trim(),
        location_type: locationType
          ? (locationType as CylinderLocationType)
          : undefined,
        location_id: locationId || undefined,
      });
      router.push("/dashboard/cylinders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMaxDays() {
    setMaxDaysSaving(true);
    setMaxDaysNotice(null);
    setError(null);
    try {
      const updated = await updateCylinderMaxDays(params.id, {
        max_days_at_customer: maxDays,
      });
      setDefaults((prev) => ({
        ...prev,
        max_days_at_customer: updated.max_days_at_customer,
        is_overdue: updated.is_overdue,
      }));
      setMaxDaysNotice("Batas hari di customer disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan batas hari");
    } finally {
      setMaxDaysSaving(false);
    }
  }

  if (fetching) {
    return <p className="text-slate-600">Memuat...</p>;
  }
  return (
    <div className="animate-in">
      <PageHeader title="Edit Tabung" />
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
                defaultValue={defaults.barcode_sn}
                disabled={barcodeLocked}
              />
              {defaults.label_printed_at ? (
                <p className="mt-1 text-xs text-slate-500">
                  Label sudah dicetak — SN terkunci. Ubah lewat admin jika
                  label harus diganti.
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="item_id">Produk Gas</Label>
              <SearchableSelect
                id="item_id"
                name="item_id"
                required
                defaultValue={defaults.item_id}
                disabled={!editable}
              >
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
                  defaultValue={defaults.ownership_type}
                  disabled={!editable}
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
                        defaultValue={defaults.owner_id}
                        disabled={!editable}
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
                        defaultValue={defaults.owner_id}
                        disabled={!editable}
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
                defaultValue={defaults.last_hydrotest_date}
                disabled={!editable}
              />
            </div>
          </FormSection>

          <FormSection
            title="Lokasi Tabung"
            description={`Lokasi saat ini: ${
              defaults.location_name ||
              cylinderLocationTypeLabel(defaults.location_type)
            }. Pilih tipe & detail lokasi untuk memindahkan tabung.`}
          >
            <CylinderLocationFields
              locations={locations}
              customers={customers}
              vendors={vendors}
              emptyLabel="Pertahankan lokasi saat ini"
              disabled={!editable}
            />
          </FormSection>

          <FormSection title="Keterangan">
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                rows={3}
                defaultValue={defaults.remarks}
                disabled={!editable}
                placeholder="Opsional — catatan kondisi tabung, sertifikat, dll."
              />
            </div>
          </FormSection>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="flex gap-2 pt-2">
            {editable ? (
              <Button disabled={loading} type="submit">
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {editable ? "Batal" : "Kembali"}
            </Button>
          </div>
        </form>
      </FormMainCard>

      <Card className="mt-6 shadow-[var(--shadow-soft)]">
        <CardBody>
          <p className="font-semibold text-slate-800">Batas Hari di Customer</p>
          <p className="mt-1 text-sm text-slate-500">
            Satu aturan global untuk tabung ini di semua customer. 0 = tanpa batas.
            Perubahan di sini tercatat di riwayat.
          </p>
          {defaults.outstanding_since ? (
            <p className="mt-2 text-sm text-slate-700">
              Di customer sejak{" "}
              {new Date(defaults.outstanding_since).toLocaleDateString("id-ID")} ·{" "}
              {defaults.days_at_customer} hari
              {defaults.max_days_at_customer > 0
                ? ` (maks ${defaults.max_days_at_customer})`
                : ""}
              {defaults.is_overdue ? (
                <span className="ml-1 font-semibold text-rose-700">· Overdue</span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-40">
              <Label htmlFor="max_days_at_customer">Maksimal hari</Label>
              <Input
                id="max_days_at_customer"
                type="number"
                min={0}
                max={3650}
                value={maxDays}
                disabled={maxDaysLocked}
                onChange={(event) => setMaxDays(Number(event.target.value))}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={maxDaysLocked || maxDaysSaving}
              onClick={handleSaveMaxDays}
            >
              {maxDaysSaving ? "Menyimpan..." : "Simpan Batas"}
            </Button>
          </div>
          {maxDaysLocked ? (
            <p className="mt-2 text-xs text-slate-500">
              Tabung berstatus {cylinderStatusLabels[defaults.status] || defaults.status} —
              batas hari tidak bisa diubah.
            </p>
          ) : null}
          {maxDaysNotice ? (
            <p className="mt-2 text-sm text-emerald-700">{maxDaysNotice}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card className="mt-6 shadow-[var(--shadow-soft)]">
        <CardBody>
          <p className="font-semibold text-slate-800">Riwayat Perubahan</p>
          <p className="mt-1 text-sm text-slate-500">
            {history
              ? historyEntries.length > 10
                ? `Menampilkan ${latestEntries.length} terakhir dari ${historyEntries.length}`
                : `${historyEntries.length} entri`
              : "Memuat..."}
          </p>
          <div className="mt-4 max-h-[520px] space-y-4 overflow-y-auto pr-1">
            {historyLoading ? (
              <p className="text-sm text-slate-500">Memuat riwayat...</p>
            ) : !history || historyEntries.length === 0 ? (
              <p className="text-sm text-slate-500">
                Belum ada perubahan tercatat.
              </p>
            ) : (
              latestEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="space-y-1.5 border-l-2 border-slate-200 pl-3"
                >
                  <p className="text-xs font-semibold text-slate-800">
                    {entry.action_label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.created_at).toLocaleString("id-ID")}
                    {entry.user_name ? ` · ${entry.user_name}` : ""}
                  </p>
                  {(entry.changes?.length ?? 0) === 0 ? (
                    <p className="text-xs text-slate-400">
                      Tidak ada perubahan field.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {(entry.changes ?? []).map((change, index) => (
                        <li
                          key={index}
                          className="flex items-baseline gap-1 text-xs"
                        >
                          <span className="min-w-[68px] text-slate-500">
                            {change.label}
                          </span>
                          {change.old ? (
                            <>
                              <span className="text-slate-400">
                                {formatHistoryValue(change, true)}
                              </span>
                              <span className="text-slate-300">→</span>
                            </>
                          ) : null}
                          <span className="font-medium text-slate-700">
                            {formatHistoryValue(change, false)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
