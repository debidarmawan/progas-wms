"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { listRoles } from "@/lib/api/roles";
import { createUser } from "@/lib/api/users";
import { listDrivers } from "@/lib/api/logistics";
import { setFlashMessage } from "@/lib/flash";
import type { DriverResponse, RoleResponse } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import {
  FormAsideCard,
  FormAsideStack,
  FormMainCard,
  FormPageGrid,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [roleId, setRoleId] = useState("");
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const driverRequestId = useRef(0);
  const isDriverRole = roles.some(
    (role) => role.id === roleId && role.name === "Driver",
  );

  useEffect(() => {
    listRoles({ page: 1, limit: 100 })
      .then((data) => setRoles(data.items))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat peran"),
      );
  }, []);

  async function handleRoleChange(nextRoleId: string) {
    setRoleId(nextRoleId);
    setDrivers([]);
    const requestId = ++driverRequestId.current;
    const nextIsDriverRole = roles.some(
      (role) => role.id === nextRoleId && role.name === "Driver",
    );
    if (!nextIsDriverRole) {
      setLoadingDrivers(false);
      return;
    }

    setLoadingDrivers(true);
    setError(null);
    try {
      const data = await listDrivers({ page: 1, limit: 100 });
      if (requestId === driverRequestId.current) {
        setDrivers(data.items.filter((driver) => driver.is_active));
      }
    } catch (err) {
      if (requestId === driverRequestId.current) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat data driver",
        );
      }
    } finally {
      if (requestId === driverRequestId.current) setLoadingDrivers(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    try {
      await createUser({
        name: String(form.get("name")),
        email: String(form.get("email")),
        password: String(form.get("password")),
        phone: String(form.get("phone") || "") || undefined,
        role_id: String(form.get("role_id")),
        driver_id: isDriverRole
          ? String(form.get("driver_id") || "")
          : undefined,
      });
      setFlashMessage("Pengguna berhasil dibuat.");
      router.push("/dashboard/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pengguna");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in max-w-3xl">
      <PageHeader
        title="Tambah Pengguna"
        description="Buat akun operator baru dan tetapkan peran (RBAC)."
      />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Akun">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Telepon</Label>
                <Input id="phone" name="phone" type="tel" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="role_id">Peran</Label>
                  <Select
                    id="role_id"
                    name="role_id"
                    required
                    value={roleId}
                    onChange={(event) => handleRoleChange(event.target.value)}
                  >
                    <option value="" disabled>
                      Pilih peran
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              {isDriverRole ? (
                <div>
                  <Label htmlFor="driver_id">Data Driver</Label>
                  <Select
                    id="driver_id"
                    name="driver_id"
                    required
                    defaultValue=""
                    disabled={loadingDrivers || drivers.length === 0}
                  >
                    <option value="" disabled>
                      {loadingDrivers
                        ? "Memuat driver..."
                        : drivers.length === 0
                          ? "Tidak ada driver aktif"
                          : "Pilih driver"}
                    </option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                        {driver.phone ? ` — ${driver.phone}` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Menyimpan..." : "Buat Pengguna"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/admin/users")}
              >
                Batal
              </Button>
            </div>
          </form>
        </FormMainCard>

        <FormAsideStack>
          <FormAsideCard title="Catatan">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Password minimal 6 karakter (sesuai API).</li>
              <li>Peran menentukan hak akses modul.</li>
            </ul>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-500">
              Setelah dibuat, pengguna dapat login dengan email dan password di
              halaman login.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
