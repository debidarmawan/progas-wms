"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api/auth";
import { getStoredUser } from "@/lib/auth/session";
import type { UserResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type ProfileFieldProps = {
  label: string;
  value?: string;
};

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "-"}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserResponse | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getProfile()
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-in space-y-6">
      <PageHeader
        title="Profile"
        description="Informasi akun Anda yang sedang login."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardBody className="space-y-4">
          {loading && !profile ? (
            <p className="text-sm text-slate-500">Memuat profile...</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Nama" value={profile?.name} />
              <ProfileField label="Email" value={profile?.email} />
              <ProfileField label="No. Telepon" value={profile?.phone} />
              <ProfileField label="Peran" value={profile?.role_name} />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
