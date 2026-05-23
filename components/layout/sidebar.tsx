"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navIconMap } from "@/components/ui/icons";
import { comingSoonModules, mainNavigation, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActiveChild(pathname: string, item: NavItem) {
  return item.children?.some((child) => isActive(pathname, child.href)) ?? false;
}

function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={cn(
        "h-4 w-4 shrink-0 transition-transform duration-200",
        open && "rotate-180",
        className,
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function NavDropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const childActive = groupHasActiveChild(pathname, item);
  const storageKey = `sidebar-open:${item.label}`;
  const [open, setOpen] = useState(childActive);
  const [hydrated, setHydrated] = useState(false);
  const Icon = item.icon ? navIconMap[item.icon] : null;

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setOpen(stored === "1");
    } else if (childActive) {
      setOpen(true);
    }
  }, [storageKey, childActive]);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive, pathname]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, open ? "1" : "0");
  }, [open, storageKey, hydrated]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          childActive
            ? "bg-indigo-50 text-indigo-900"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "shrink-0",
              childActive
                ? "text-indigo-600"
                : "text-slate-400 group-hover:text-indigo-600",
            )}
          />
        ) : null}
        <span className="flex-1 text-left">{item.label}</span>
        <Chevron
          open={open}
          className={childActive ? "text-indigo-500" : "text-slate-400"}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-9 mt-1 space-y-0.5 border-l border-slate-200 pl-3 pb-1">
            {item.children?.map((child) => {
              const active = isActive(pathname, child.href);
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    active
                      ? "bg-indigo-700 text-white shadow-sm shadow-indigo-700/15"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon ? navIconMap[item.icon] : null;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-indigo-700 text-white shadow-md shadow-indigo-700/20"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "shrink-0",
            active ? "text-white" : "text-slate-400 group-hover:text-indigo-600",
          )}
        />
      ) : null}
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[17.5rem] shrink-0 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-rose-700 text-sm font-bold text-white shadow-lg shadow-indigo-700/20">
            P
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Progas
            </p>
            <h1 className="text-base font-semibold leading-tight text-slate-900">
              WMS Gas
            </h1>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {mainNavigation.map((item) =>
          item.children && item.children.length > 0 ? (
            <NavDropdown key={item.label} item={item} pathname={pathname} />
          ) : (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ),
        )}
      </nav>

      <div className="m-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold text-slate-500">Segera hadir</p>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-400">
          {comingSoonModules.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li className="text-slate-300">
            +{comingSoonModules.length - 3} modul lainnya
          </li>
        </ul>
      </div>
    </aside>
  );
}
