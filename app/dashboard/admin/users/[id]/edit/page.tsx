"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { listRoles } from "@/lib/api/roles";
import { getUser, updateUser } from "@/lib/api/users";
import { getDriver, listDrivers } from "@/lib/api/logistics";
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

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [drivers, setDrivers] = useState<DriverResponse[]>([]);
  const [currentDriver, setCurrentDriver] = useState<DriverResponse | null>(
    null,
  );
  const [roleId, setRoleId] = useState("");
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const driverRequestId = useRef(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    driver_id: "",
    is_active: true,
  });
  const isDriverRole = roles.some(
    (role) => role.id === roleId && role.name === "Driver",
  );
  const driverOptions = [
    ...drivers.filter(
      (driver) => driver.id !== currentDriver?.id,
    ),
    ...(currentDriver ? [currentDriver] : []),
  ];

  useEffect(() => {
    async function loadUser() {
      try {
        const [user, roleData] = await Promise.all([
          getUser(params.id),
          listRoles({ page: 1, limit: 100 }),
        ]);
        const linkedDriver = user.driver_id
          ? await getDriver(user.driver_id)
          : null;
        const hasDriverRole = roleData.items.some(
          (role) => role.id === user.role_id && role.name === "Driver",
        );
        const driverData = hasDriverRole
          ? await listDrivers({ page: 1, limit: 100 })
          : null;
        setDefaults({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role_id: user.role_id,
          driver_id: user.driver_id || "",
          is_active: user.is_active !== false,
        });
        setRoleId(user.role_id);
        setRoles(roleData.items);
        setCurrentDriver(linkedDriver);
        setDrivers(
          driverData?.items.filter((driver) => driver.is_active) || [],
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setFetching(false);
      }
    }

    void loadUser();
  }, [params.id]);

  async function handleRoleChange(nextRoleId: string) {
    setRoleId(nextRoleId);
    const requestId = ++driverRequestId.current;
    const nextIsDriverRole = roles.some(
      (role) => role.id === nextRoleId && role.name === "Driver",
    );
    if (!nextIsDriverRole) {
      setDrivers([]);
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
    const password = String(form.get("password") || "");

    setLoading(true);
    setError(null);

    try {
      await updateUser(params.id, {
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone") || "") || undefined,
        role_id: String(form.get("role_id")),
        driver_id: isDriverRole
          ? String(form.get("driver_id") || "")
          : undefined,
        is_active: form.get("is_active") === "on",
        ...(password ? { password } : {}),
      });
      setFlashMessage("Perubahan pengguna berhasil disimpan.");
      router.push("/dashboard/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  return (
    <div className="animate-in max-w-3xl">
      <PageHeader title="Edit Pengguna" />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection title="Data Akun">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={defaults.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={defaults.email}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={defaults.phone}
                  />
                </div>
                <div>
                  <Label htmlFor="role_id">Peran</Label>
                  <Select
                    id="role_id"
                    name="role_id"
                    value={roleId}
                    onChange={(event) => handleRoleChange(event.target.value)}
                    required
                  >
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
                    value={defaults.driver_id}
                    onChange={(event) =>
                      setDefaults((current) => ({
                        ...current,
                        driver_id: event.target.value,
                      }))
                    }
                    required
                    disabled={loadingDrivers && !currentDriver}
                  >
                    <option value="" disabled>
                      {loadingDrivers
                        ? "Memuat driver..."
                        : driverOptions.length === 0
                          ? "Tidak ada driver aktif"
                          : "Pilih driver"}
                    </option>
                    {driverOptions.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                        {driver.phone ? ` — ${driver.phone}` : ""}
                        {!driver.is_active ? " (Nonaktif)" : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : null}
              <div>
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  placeholder="Kosongkan jika tidak diubah"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={defaults.is_active}
                />
                Aktif
              </label>
            </FormSection>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading} type="submit">
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Batal
              </Button>
            </div>
          </form>
        </FormMainCard>

        <FormAsideStack>
          <FormAsideCard title="Pengguna">
            <p className="font-semibold text-slate-900">{defaults.name}</p>
            <p className="text-sm text-slate-500">{defaults.email}</p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              Nonaktifkan akun untuk mencegah login tanpa menghapus riwayat.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
