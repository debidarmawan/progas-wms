import Link from "next/link";
import { navIconMap } from "@/components/ui/icons";
import { Card, CardBody } from "@/components/ui/card";
import {
  comingSoonModules,
  mainNavigation,
  moduleDescriptions,
} from "@/lib/navigation";

const quickLinks = mainNavigation.filter((item) => item.href !== "/dashboard");

export default function DashboardPage() {
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
            Pantau dan kelola alur gudang gas industri — master data, produksi,
            hingga penerimaan tabung kosong.
          </p>
        </div>
      </section>

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
                    <h3 className="font-semibold text-slate-900">{item.label}</h3>
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
    </div>
  );
}
