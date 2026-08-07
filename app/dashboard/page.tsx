"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "@/lib/api/dashboard";
import type { DashboardSummaryResponse } from "@/lib/types/api";
import { navIconMap } from "@/components/ui/icons";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import {
  comingSoonModules,
  mainNavigation,
  moduleDescriptions,
} from "@/lib/navigation";

const quickLinks = mainNavigation.filter((item) => item.href !== "/dashboard");

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-rose-200 bg-rose-50/80"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/80"
        : "border-slate-200 bg-white";

  const valueClass =
    tone === "danger"
      ? "text-rose-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-slate-900";

  return (
    <Card className={toneClass}>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className={`mt-2 text-3xl font-semibold tabular-nums ${valueClass}`}>
          {value}
        </p>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat ringkasan"),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-in space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-[var(--shadow-card)]">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-rose-400/10 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Dashboard Operasional
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Pantau outstanding tabung, status inventori, alert hydrotest, dan
            pelanggan melebihi kuota.
          </p>
        </div>
      </section>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ringkasan Hari Ini
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Memuat data...</p>
        ) : summary ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Outstanding"
              value={summary.total_outstanding_cylinders}
            />
            <StatCard
              label="Hydrotest Due Soon"
              value={summary.hydrotest_due_soon_count}
              tone="warning"
            />
            <StatCard
              label="Hydrotest Expired"
              value={summary.hydrotest_expired_count}
              tone="danger"
            />
            <StatCard
              label="Tabung Overdue di Customer"
              value={summary.overdue_cylinders_count}
              tone={summary.overdue_cylinders_count > 0 ? "danger" : "default"}
            />
            <StatCard
              label="Pelanggan Over Kuota"
              value={summary.customers_over_quota.length}
              tone={
                summary.customers_over_quota.length > 0 ? "danger" : "default"
              }
            />
          </div>
        ) : null}
      </section>

      {summary && Object.keys(summary.cylinders_by_status).length > 0 ? (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Tabung per Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.cylinders_by_status).map(
              ([status, count]) => (
                <span
                  key={status}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm"
                >
                  <span className="font-mono text-xs text-slate-500">
                    {status}
                  </span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {count}
                  </span>
                </span>
              ),
            )}
          </div>
        </section>
      ) : null}

      {summary &&
      (summary.overdue_cylinders_count > 0 ||
        summary.customers_over_quota.length > 0 ||
        summary.low_stock_spareparts.length > 0) ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {summary.overdue_cylinders_count > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-rose-700">
                  Tabung Overdue di Customer
                </h2>
                <ul className="mt-4 space-y-2">
                  {summary.overdue_cylinders.map((c) => (
                    <li
                      key={c.barcode_sn}
                      className="flex justify-between rounded-lg bg-rose-50/60 px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="font-mono">{c.barcode_sn}</span>
                        <span className="text-slate-500">
                          {" "}
                          — {c.customer_code} {c.customer_name}
                        </span>
                      </span>
                      <span className="font-medium text-rose-700">
                        {c.days_at_customer}/{c.max_days} hari
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
          {summary.customers_over_quota.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-rose-700">
                  Pelanggan Melebihi Kuota
                </h2>
                <ul className="mt-4 space-y-2">
                  {summary.customers_over_quota.map((c) => (
                    <li
                      key={c.customer_id}
                      className="flex justify-between rounded-lg bg-rose-50/60 px-3 py-2 text-sm"
                    >
                      <span>
                        {c.customer_code} — {c.customer_name}
                      </span>
                      <span className="font-medium text-rose-700">
                        {c.outstanding_count}/{c.quota_limit}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
          {summary.low_stock_spareparts.length > 0 ? (
            <Card>
              <CardBody>
                <h2 className="font-semibold text-amber-700">
                  Stok Spare Part Rendah
                </h2>
                <ul className="mt-4 space-y-2">
                  {summary.low_stock_spareparts.map((item) => (
                    <li
                      key={item.item_id}
                      className="flex justify-between rounded-lg bg-amber-50/60 px-3 py-2 text-sm"
                    >
                      <span>
                        {item.sku} — {item.item_name}
                      </span>
                      <span className="font-medium text-amber-700">
                        {item.quantity}/{item.min_stock}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Modul Aktif
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon ? navIconMap[item.icon] : null;
            const desc = moduleDescriptions[item.href] || "Buka modul";

            return (
              <Link key={item.href} href={item.href}>
                <Card hover className="h-full">
                  <CardBody className="flex h-full flex-col">
                    <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                      {Icon ? <Icon /> : null}
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {item.label}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-slate-500">{desc}</p>
                    <span className="mt-4 text-sm font-medium text-indigo-600">
                      Buka modul →
                    </span>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {comingSoonModules.length > 0 ? (
        <Card>
          <CardBody>
            <h2 className="font-semibold text-slate-900">Dalam pengembangan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Modul berikut menunggu endpoint API dari backend.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {comingSoonModules.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
