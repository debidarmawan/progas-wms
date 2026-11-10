"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  accountTypeOptions,
  createAccount,
  listAccounts,
} from "@/lib/api/accounts";
import type { AccountResponse, AccountType } from "@/lib/types/api";
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
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function NewAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [type, setType] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    listAccounts({ limit: 100, is_active: "true" })
      .then((data) => setAccounts(data.items))
      .catch(() => setAccounts([]));
  }, []);

  // Induk harus sejenis (aturan backend), jadi opsi disaring sesuai tipe terpilih.
  const parentOptions = [
    { value: "", label: "Tanpa induk" },
    ...accounts
      .filter((account) => !type || account.type === type)
      .map((account) => ({
        value: account.id,
        label: `${account.code} — ${account.name}`,
      })),
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);

    try {
      await createAccount({
        code: String(form.get("code")),
        name: String(form.get("name")),
        type: String(form.get("type")) as AccountType,
        parent_id: String(form.get("parent_id") || "") || undefined,
        is_active: form.get("is_active") === "on",
      });
      router.push("/dashboard/finance/accounts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader title="Tambah Akun" />
      <FormPageGrid>
        <FormMainCard>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormSection
              title="Identitas Akun"
              description="Kode disimpan dalam huruf besar dan harus unik."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="code">Kode</Label>
                  <Input id="code" name="code" required placeholder="1-1100" />
                </div>
                <div>
                  <Label htmlFor="name">Nama Akun</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Kas"
                  />
                </div>
                <SearchableSelect
                  id="type"
                  name="type"
                  label="Tipe Akun"
                  required
                  placeholder="Pilih tipe akun"
                  options={accountTypeOptions}
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setParentId("");
                  }}
                />
                <SearchableSelect
                  id="parent_id"
                  name="parent_id"
                  label="Akun Induk (opsional)"
                  options={parentOptions}
                  value={parentId}
                  onChange={(event) => setParentId(event.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked />
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
          <FormAsideCard title="Info">
            <p className="text-sm text-slate-600">
              Tipe akun menentukan saldo normal: aset &amp; beban bersaldo debit,
              liabilitas, ekuitas &amp; pendapatan bersaldo kredit.
            </p>
          </FormAsideCard>
          <Card className="shadow-[var(--shadow-soft)]">
            <CardBody className="text-sm text-slate-600">
              Akun yang punya sub-akun atau sudah dipakai jurnal tidak dapat
              dihapus — nonaktifkan agar tidak bisa dipakai jurnal baru.
            </CardBody>
          </Card>
        </FormAsideStack>
      </FormPageGrid>
    </div>
  );
}
