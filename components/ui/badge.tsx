import { cn } from "@/lib/utils/cn";

const statusStyles: Record<string, string> = {
  EMPTY: "bg-slate-100 text-slate-700 ring-slate-200/60",
  READY_TO_FILL: "bg-amber-50 text-amber-800 ring-amber-200/60",
  READY: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  IN_TRANSIT: "bg-sky-50 text-sky-800 ring-sky-200/60",
  OUTSTANDING: "bg-violet-50 text-violet-800 ring-violet-200/60",
  AT_CUSTOMER: "bg-violet-50 text-violet-800 ring-violet-200/60",
  MAINTENANCE: "bg-orange-50 text-orange-800 ring-orange-200/60",
  QUARANTINE: "bg-rose-50 text-rose-800 ring-rose-200/60",
};

export function Badge({
  children,
  className,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  tone?: string;
}) {
  const style =
    tone && statusStyles[tone]
      ? statusStyles[tone]
      : "bg-slate-100 text-slate-700 ring-slate-200/60";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        style,
        className,
      )}
    >
      {children}
    </span>
  );
}
