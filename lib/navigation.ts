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
  { label: "Vendor", href: "/dashboard/vendors", icon: "vendor" },
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
      {
        label: "QC Post-Fill",
        href: "/dashboard/production/qc-post-fill",
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
  {
    label: "Outbound",
    href: "/dashboard/outbound/delivery-orders",
    icon: "outbound",
    children: [
      {
        label: "Surat Jalan",
        href: "/dashboard/outbound/delivery-orders",
      },
      {
        label: "Pertukaran Tabung",
        href: "/dashboard/outbound/exchange",
      },
    ],
  },
  {
    label: "Logistik",
    href: "/dashboard/logistics/fleet",
    icon: "truck",
    children: [
      { label: "Armada", href: "/dashboard/logistics/fleet" },
    ],
  },
  {
    label: "Pemeliharaan",
    href: "/dashboard/maintenance/work-orders",
    icon: "wrench",
    children: [
      {
        label: "Work Order",
        href: "/dashboard/maintenance/work-orders",
      },
      {
        label: "Hydrotest Due",
        href: "/dashboard/maintenance/hydrotest",
      },
    ],
  },
  {
    label: "Inventori",
    href: "/dashboard/inventory/virtual-warehouse",
    icon: "inventory",
    children: [
      {
        label: "Virtual Warehouse",
        href: "/dashboard/inventory/virtual-warehouse",
      },
      {
        label: "Stock Opname",
        href: "/dashboard/inventory/stock-opname",
      },
    ],
  },
  {
    label: "Laporan",
    href: "/dashboard/reports/stock-ledger",
    icon: "chart",
    children: [
      {
        label: "Stock Ledger",
        href: "/dashboard/reports/stock-ledger",
      },
      {
        label: "Turnaround",
        href: "/dashboard/reports/turnaround",
      },
    ],
  },
  {
    label: "Admin",
    href: "/dashboard/admin/users",
    icon: "settings",
    children: [
      {
        label: "Pengguna",
        href: "/dashboard/admin/users",
      },
      {
        label: "Peran (Roles)",
        href: "/dashboard/admin/roles",
      },
    ],
  },
];

export const comingSoonModules = ["Audit Log"];

export const moduleDescriptions: Record<string, string> = {
  "/dashboard": "Ringkasan operasional gudang",
  "/dashboard/master-items": "Katalog gas & suku cadang",
  "/dashboard/cylinders": "Registrasi & pelacakan tabung",
  "/dashboard/customers": "Kuota outstanding pelanggan",
  "/dashboard/vendors": "Vendor sewa tabung & kontrak",
  "/dashboard/production/qc-pre-fill": "Inspeksi sebelum pengisian",
  "/dashboard/production/filling-batches": "Batch pengisian manifold",
  "/dashboard/production/qc-post-fill": "Inspeksi setelah pengisian",
  "/dashboard/inbound/empty-receive": "Penerimaan tabung kosong",
  "/dashboard/outbound/delivery-orders": "Surat jalan & pengiriman",
  "/dashboard/outbound/exchange": "Pertukaran tabung pelanggan",
  "/dashboard/logistics/fleet": "Data kendaraan & kapasitas muat",
  "/dashboard/maintenance/work-orders": "Perbaikan & konsumsi spare part",
  "/dashboard/maintenance/hydrotest": "Tabung jatuh tempo hydrotest",
  "/dashboard/inventory/virtual-warehouse": "Outstanding per pelanggan",
  "/dashboard/inventory/stock-opname": "Penyesuaian stok spare part",
  "/dashboard/reports/stock-ledger": "Riwayat status per barcode",
  "/dashboard/reports/turnaround": "Rata-rata siklus tabung",
  "/dashboard/admin/users": "Kelola akun operator & peran RBAC",
  "/dashboard/admin/roles": "Daftar peran akses yang tersedia",
  "/dashboard/admin/users/new": "Buat akun operator baru",
};
