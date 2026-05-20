import { cn } from "@/lib/utils/cn";

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
        {children}
      </tr>
    </thead>
  );
}

export function DataTableTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-6 py-3.5 font-medium", className)}>{children}</th>;
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-indigo-50/30",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-6 py-4 text-slate-700", className)}>{children}</td>;
}

export function DataTableEmpty({
  colSpan,
  message = "Tidak ada data.",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td className="px-6 py-12 text-center text-slate-500" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
}

export function DataTableLoading({
  colSpan,
}: {
  colSpan: number;
}) {
  return (
    <tr>
      <td className="px-6 py-12" colSpan={colSpan}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <span className="text-sm text-slate-500">Memuat data...</span>
        </div>
      </td>
    </tr>
  );
}
