"use client";

import { useEffect, useState } from "react";
import { getVirtualWarehouse } from "@/lib/api/inventory";
import type { VirtualWarehouseCustomer } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function VirtualWarehousePage() {
  const [customers, setCustomers] = useState<VirtualWarehouseCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getVirtualWarehouse()
      .then((data) => setCustomers(data.customers))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Virtual Warehouse"
        description="Tabung outstanding per pelanggan — tabung di lokasi pelanggan tetapi masih milik gudang."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat...</p>
      ) : customers.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">Tidak ada outstanding saat ini.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.customer_id}>
              <CardBody>
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left"
                  onClick={() =>
                    setExpanded((prev) =>
                      prev === customer.customer_id ? null : customer.customer_id,
                    )
                  }
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {customer.customer_code} — {customer.customer_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {customer.outstanding_count} tabung outstanding
                    </p>
                  </div>
                  <span className="text-indigo-600 text-sm font-medium">
                    {expanded === customer.customer_id ? "Tutup" : "Lihat barcode"}
                  </span>
                </button>
                {expanded === customer.customer_id ? (
                  <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto border-t border-slate-100 pt-4 font-mono text-sm">
                    {customer.cylinder_barcodes.map((barcode) => (
                      <li key={barcode} className="rounded-md bg-slate-50 px-2 py-1">
                        {barcode}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
