"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { listRoles } from "@/lib/api/roles";
import { getUser, updateUser } from "@/lib/api/users";
import type { RoleResponse } from "@/lib/types/api";
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
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    is_active: true,
  });

  useEffect(() => {
    Promise.all([
      getUser(params.id),
      listRoles({ page: 1, limit: 100 }),
    ])
      .then(([user, roleData]) => {
        setDefaults({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role_id: user.role_id,
          is_active: user.is_active !== false,
        });
        setRoles(roleData.items);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => setFetching(false));
  }, [params.id]);

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
        is_active: form.get("is_active") === "on",
        ...(password ? { password } : {}),
      });
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
                    defaultValue={defaults.role_id}
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
