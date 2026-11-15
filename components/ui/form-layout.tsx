import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function FormPageGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-6", className)}>{children}</div>;
}

export function FormMainCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
  tone = "default",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "accent" | "muted";
}) {
  const toneClass =
    tone === "accent"
      ? "border-indigo-100 bg-indigo-50/50"
      : tone === "muted"
        ? "border-slate-100 bg-slate-50/70"
        : "border-slate-100 bg-white";

  return (
    <section
      className={cn("space-y-4 rounded-xl border p-4", toneClass, className)}
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
