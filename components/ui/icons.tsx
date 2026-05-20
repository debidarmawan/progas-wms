import { cn } from "@/lib/utils/cn";

type IconProps = { className?: string };

export function IconDashboard({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-2a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

export function IconPackage({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

export function IconCylinder({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v3H9V3zm0 15h6v3H9v-3zm-3-9h12v6H6V9z" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function IconFactory({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3m2-8h4m4 0h4M9 7h1m1 0h1m-1 4h1m1 0h1" />
    </svg>
  );
}

export function IconInbound({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14M4 20h16" />
    </svg>
  );
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={cn("h-4 w-4", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function IconSparkles({ className }: IconProps) {
  return (
    <svg className={cn("h-5 w-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l1.5 4.5L19 9l-4.5 1.5L13 15l-1.5-4.5L7 9l4.5-1.5L13 3zM18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
    </svg>
  );
}

export const navIconMap = {
  dashboard: IconDashboard,
  package: IconPackage,
  cylinder: IconCylinder,
  users: IconUsers,
  factory: IconFactory,
  inbound: IconInbound,
} as const;
