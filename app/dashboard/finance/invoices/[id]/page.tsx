"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { getInvoice, recordPayment } from "@/lib/api/finance";
import type { InvoiceResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  DataTable,
  DataTableBody,
  DataTableEmpty,
  DataTableHead,
  DataTableRow,
  DataTableTd,
  DataTableTh,
} from "@/components/ui/data-table";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    getInvoice(params.id)
      .then(setInvoice)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat invoice"),
      )
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invoice) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    try {
      await recordPayment(invoice.id, {
        amount: Number(form.get("amount")),
        method: String(form.get("method")),
        reference_no: String(form.get("reference_no") || "") || undefined,
      });
      (event.currentTarget as HTMLFormElement).reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencatat pembayaran");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  if (error && !invoice) {
    return (
      <div className="animate-in">
        <Alert variant="error">{error}</Alert>
        <Link
          href="/dashboard/finance/invoices"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
        >
          <span aria-hidden="true">←</span>
          Kembali ke daftar invoice
        </Link>
      </div>
    );
  }

  if (!invoice) return null;

  const remaining = invoice.total_amount - invoice.paid_amount;
  const isSettled = invoice.status === "PAID" || invoice.status === "CANCELLED";

  return (
    <div className="animate-in space-y-6">
      <Link
        href="/dashboard/finance/invoices"
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
      >
        <span aria-hidden="true">←</span>
        Kembali ke daftar invoice
      </Link>

      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        description={`${invoice.customer_name || "—"} · DO ${invoice.do_number || "—"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-900">{invoice.status}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Jatuh Tempo</p>
            <p className="mt-1 font-semibold text-slate-900">
              {invoice.due_date?.slice(0, 10)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Total Invoice</p>
            <p className="mt-1 font-semibold text-slate-900">
              {invoice.total_amount.toLocaleString("id-ID")}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-500">Sisa Belum Dibayar</p>
            <p className="mt-1 font-semibold text-slate-900">
              {remaining.toLocaleString("id-ID")}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable>
            <DataTableHead>
              <DataTableTh>Tanggal Bayar</DataTableTh>
              <DataTableTh>Metode</DataTableTh>
              <DataTableTh>Referensi</DataTableTh>
              <DataTableTh>Jumlah</DataTableTh>
            </DataTableHead>
            <DataTableBody>
              {(invoice.payments ?? []).length === 0 ? (
                <DataTableEmpty colSpan={4} />
              ) : (
                (invoice.payments ?? []).map((payment) => (
                  <DataTableRow key={payment.id}>
                    <DataTableTd>{payment.paid_at?.slice(0, 10)}</DataTableTd>
                    <DataTableTd>{payment.method}</DataTableTd>
                    <DataTableTd>{payment.reference_no || "—"}</DataTableTd>
                    <DataTableTd className="font-semibold">
                      {payment.amount.toLocaleString("id-ID")}
                    </DataTableTd>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </CardBody>
      </Card>

      {isSettled ? null : (
        <Card>
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-slate-900">
              Catat Pembayaran
            </p>
            {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
            <form className="grid gap-4 sm:grid-cols-3 sm:items-end" onSubmit={submitPayment}>
              <div>
                <Label htmlFor="amount">Jumlah</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  max={remaining}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="method">Metode</Label>
                <Input id="method" name="method" placeholder="Transfer, Tunai, ..." required />
              </div>
              <div>
                <Label htmlFor="reference_no">No. Referensi</Label>
                <Input id="reference_no" name="reference_no" />
              </div>
              <div className="sm:col-span-3">
                <Button disabled={submitting} type="submit">
                  {submitting ? "Menyimpan..." : "Simpan Pembayaran"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
