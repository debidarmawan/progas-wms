"use client";

import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getCustomer } from "@/lib/api/customers";
import {
  createCustomerSite,
  deleteCustomerSite,
  listCustomerSites,
  updateCustomerSite,
} from "@/lib/api/customer-sites";
import type { CustomerResponse, CustomerSiteResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { FormMainCard, FormSection } from "@/components/ui/form-layout";
import { Input, Label, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [sites, setSites] = useState<CustomerSiteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerSiteResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerSiteResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCustomer(params.id), listCustomerSites(params.id)])
      .then(([customerData, siteData]) => {
        if (cancelled) return;
        setCustomer(customerData);
        setSites(siteData.items);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Site mutations only change the site list, so a light refresh is enough.
  async function refreshSites() {
    try {
      const siteData = await listCustomerSites(params.id);
      setSites(siteData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat site");
    }
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(site: CustomerSiteResponse) {
    setEditing(site);
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      pic: String(form.get("pic") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      address: String(form.get("address") || "") || undefined,
      postal_code: String(form.get("postal_code") || "") || undefined,
      notes: String(form.get("notes") || "") || undefined,
      is_primary: form.get("is_primary") === "on",
      is_active: form.get("is_active") === "on",
    };

    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateCustomerSite(params.id, editing.id, payload);
      } else {
        await createCustomerSite(params.id, payload);
      }
      setFormOpen(false);
      setEditing(null);
      await refreshSites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan site");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCustomerSite(params.id, deleteTarget.id);
      setDeleteTarget(null);
      await refreshSites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus site");
    } finally {
      setDeleting(false);
    }
  }


  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (!customer) {
    return (
      <div className="animate-in">
        <Alert variant="error">{error || "Pelanggan tidak ditemukan"}</Alert>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title={customer.name}
        description={`${customer.code} · ${customer.is_active === false ? "Nonaktif" : "Aktif"}`}
      />
      <div className="flex flex-wrap gap-2">
        <ButtonLink
          href={`/dashboard/customers/${customer.id}/edit`}
          variant="secondary"
        >
          Edit Profil
        </ButtonLink>
        <ButtonLink
          href={`/dashboard/customers/${customer.id}/pricing`}
          variant="secondary"
        >
          Harga Khusus
        </ButtonLink>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">NPWP</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {customer.npwp || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Telepon</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {customer.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Termin</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {customer.term_of_payment_code || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Limit Kredit</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {(customer.credit_limit ?? 0).toLocaleString("id-ID")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Kuota / Outstanding</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {customer.cylinder_quota_limit ?? 0} / {customer.outstanding_count ?? 0}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <dt className="text-xs text-slate-500">Alamat Kantor Pusat</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {customer.address || "—"}
                {customer.postal_code ? ` (${customer.postal_code})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Sales PIC</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">
                {customer.sales_pic_name || "—"}
                {customer.sales_pic_phone ? ` · ${customer.sales_pic_phone}` : ""}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>


      <Card>
        <CardBody className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Site &amp; Alamat Kirim</h2>
              <p className="mt-1 text-xs text-slate-500">
                Dipakai sebagai tujuan kirim di Surat Jalan. Kuota dan outstanding tetap dihitung per pelanggan.
              </p>
            </div>
            <Button type="button" size="sm" onClick={openCreate}>
              Tambah Site
            </Button>
          </div>

          <DataTable>
            <DataTableHead>
              <DataTableTh>Aksi</DataTableTh>
              <DataTableTh>Nama</DataTableTh>
              <DataTableTh>Alamat</DataTableTh>
              <DataTableTh>Telepon</DataTableTh>
              <DataTableTh>Status</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {sites.length === 0 ? (
                <DataTableEmpty colSpan={5} />
              ) : (
                sites.map((site) => (
                  <DataTableRow key={site.id}>
                    <DataTableTd>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(site)}
                        >
                          Ubah
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(site)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </DataTableTd>
                    <DataTableTd className="font-medium text-slate-900">
                      {site.name}
                      {site.is_primary ? (
                        <Badge tone="CONFIRMED" className="ml-2">Utama</Badge>
                      ) : null}
                    </DataTableTd>
                    <DataTableTd>
                      {site.address || "—"}
                      {site.postal_code ? ` (${site.postal_code})` : ""}
                    </DataTableTd>
                    <DataTableTd>{site.phone || "—"}</DataTableTd>
                    <DataTableTd>
                      <Badge tone={site.is_active ? "COMPLETED" : "CANCELLED"}>
                        {site.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>


      {formOpen ? (
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection
              title={editing ? `Ubah Site: ${editing.name}` : "Tambah Site"}
              tone="accent"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama Site</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editing?.name ?? ""}
                    placeholder="Contoh: Cabang Bekasi"
                  />
                </div>
                <div>
                  <Label htmlFor="pic">PIC</Label>
                  <Input id="pic" name="pic" defaultValue={editing?.pic ?? ""} />
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" name="phone" defaultValue={editing?.phone ?? ""} />
                </div>
                <div>
                  <Label htmlFor="postal_code">Kode Pos</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    defaultValue={editing?.postal_code ?? ""}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Alamat Kirim</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editing?.address ?? ""}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    defaultValue={editing?.notes ?? ""}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_primary"
                    defaultChecked={editing?.is_primary ?? sites.length === 0}
                  />
                  Jadikan site utama (default tujuan kirim)
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editing?.is_active ?? true}
                  />
                  Aktif
                </label>
              </div>
            </FormSection>

            <div className="flex gap-2">
              <Button disabled={saving} type="submit">
                {saving ? "Menyimpan..." : "Simpan Site"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFormOpen(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </FormMainCard>
      ) : null}


      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Site"
        message={`Hapus site "${deleteTarget?.name ?? ""}"? Surat Jalan lama tetap menyimpan alamat kirimnya.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

