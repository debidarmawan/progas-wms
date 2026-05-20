import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo-700 text-white shadow-sm shadow-indigo-700/20 hover:bg-indigo-800 hover:shadow-md hover:shadow-indigo-800/25 active:scale-[0.98] disabled:bg-indigo-300 disabled:shadow-none",
  secondary:
    "border border-slate-200/80 bg-white text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/40 active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 active:scale-[0.98] disabled:bg-rose-300",
  ghost: "text-slate-600 hover:bg-slate-100/80 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
