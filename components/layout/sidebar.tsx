"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navIconMap } from "@/components/ui/icons";
import { comingSoonModules, mainNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
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
        {mainNavigation.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon ? navIconMap[item.icon] : null;

          return (
            <div key={item.href}>
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
              {item.children ? (
                <div className="ml-9 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                  {item.children.map((child) => {
                    const childActive = isActive(pathname, child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                          childActive
                            ? "bg-indigo-50 text-indigo-800"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold text-slate-500">Segera hadir</p>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-400">
          {comingSoonModules.slice(0, 3).map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li className="text-slate-300">+{comingSoonModules.length - 3} modul lainnya</li>
        </ul>
      </div>
    </aside>
  );
}
