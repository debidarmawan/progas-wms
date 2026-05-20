"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
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
          <p className="text-sm text-slate-500">
            Sistem manajemen gudang gas industri
          </p>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-rose-700 text-xs font-semibold text-white">
                  {getInitials(user.name)}
                </div>
                <div className="text-right text-sm leading-tight">
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role_name}</p>
                </div>
              </div>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {loggingOut ? "Keluar..." : "Keluar"}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
