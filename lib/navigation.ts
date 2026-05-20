import type { navIconMap } from "@/components/ui/icons";

export type NavIconKey = keyof typeof navIconMap;

export type NavItem = {
  label: string;
  href: string;
  icon?: NavIconKey;
  children?: NavItem[];
};

export const mainNavigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Master Items", href: "/dashboard/master-items", icon: "package" },
  { label: "Tabung", href: "/dashboard/cylinders", icon: "cylinder" },
  { label: "Pelanggan", href: "/dashboard/customers", icon: "users" },
  {
    label: "Produksi",
    href: "/dashboard/production/qc-pre-fill",
    icon: "factory",
    children: [
      {
        label: "QC Pre-Fill",
        href: "/dashboard/production/qc-pre-fill",
      },
      {
        label: "Filling Batch",
        href: "/dashboard/production/filling-batches",
      },
    ],
  },
  {
    label: "Inbound",
    href: "/dashboard/inbound/empty-receive",
    icon: "inbound",
    children: [
      {
        label: "Terima Tabung Kosong",
        href: "/dashboard/inbound/empty-receive",
      },
    ],
  },
];

export const comingSoonModules = [
  "Surat Jalan (DO)",
  "Pertukaran Tabung",
  "Work Order",
  "Dashboard Analitik",
  "Audit Log",
];

export const moduleDescriptions: Record<string, string> = {
  "/dashboard/master-items": "Katalog gas & suku cadang",
  "/dashboard/cylinders": "Registrasi & pelacakan tabung",
  "/dashboard/customers": "Kuota outstanding pelanggan",
  "/dashboard/production/qc-pre-fill": "Inspeksi sebelum pengisian",
  "/dashboard/production/filling-batches": "Batch pengisian manifold",
  "/dashboard/inbound/empty-receive": "Penerimaan tabung kosong",
};
