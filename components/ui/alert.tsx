import { cn } from "@/lib/utils/cn";

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: "info" | "success" | "error";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-indigo-200/80 bg-indigo-50/70 text-indigo-900",
    success: "border-indigo-200/80 bg-indigo-50/60 text-indigo-900",
    error: "border-rose-200/80 bg-rose-50/80 text-rose-900",
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        styles[variant],
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
