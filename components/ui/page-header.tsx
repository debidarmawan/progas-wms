import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="animate-in">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          Progas WMS
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button size="lg">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
