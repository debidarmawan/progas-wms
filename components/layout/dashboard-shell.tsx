"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/lib/api/auth";
import { clearSession, getStoredUser } from "@/lib/auth/session";
import type { UserResponse } from "@/lib/types/api";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user] = useState<UserResponse | null>(() => getStoredUser());
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Clear local session even if API logout fails
    } finally {
      clearSession();
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="app-mesh flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-panel sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
          <p className="text-sm text-slate-500"></p>
          <div className="flex items-center gap-3">
            {user ? (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm transition hover:bg-white"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-rose-700 text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-right text-sm leading-tight">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role_name}</p>
                  </div>
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                      disabled={loggingOut}
                      onClick={handleLogout}
                    >
                      {loggingOut ? "Keluar..." : "Keluar"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                {loggingOut ? "Keluar..." : "Keluar"}
              </Button>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
