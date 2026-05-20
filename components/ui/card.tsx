import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white shadow-[var(--shadow-soft)]",
        hover &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200/80 hover:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border-b border-slate-100/80 px-6 py-5", className)}>
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
