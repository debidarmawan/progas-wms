"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  accountTypeOptions,
  getAccount,
  listAccounts,
  updateAccount,
} from "@/lib/api/accounts";
import type { AccountResponse, AccountType } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  FormMainCard,
  FormSection,
} from "@/components/ui/form-layout";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SearchableSelect } from "@/components/ui/searchable-select";

type Defaults = {
  code: string;
  name: string;
  is_active: boolean;
};

const EMPTY_DEFAULTS: Defaults = {
  code: "",
  name: "",
  is_active: true,
};

export default function EditAccountPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [defaults, setDefaults] = useState<Defaults>(EMPTY_DEFAULTS);
  const [type, setType] = useState("");
  const [parentId, setParentId] = useState("");
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);

  useEffect(() => {
    Promise.all([
      getAccount(params.id),
      listAccounts({ limit: 100, is_active: "true" }),
    ])
      .then(([account, list]) => {
        setDefaults({
          code: account.code,
          name: account.name,
          is_active: account.is_active,
        });
        setType(account.type);
        setParentId(account.parent_id ?? "");
        setAccounts(list.items);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat data"),
      )
      .finally(() => setFetching(false));
  }, [params.id]);

  const parentOptions = [
    { value: "", label: "Tanpa induk" },
    ...accounts
      .filter(
        (account) =>
          account.id !== params.id && (!type || account.type === type),
      )
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
      await updateAccount(params.id, {
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

  if (fetching) {
    return <p className="text-slate-600">Memuat...</p>;
  }

  return (
    <div className="animate-in">
      <PageHeader title={`Edit Akun ${defaults.code}`} />
      <FormMainCard>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormSection title="Identitas Akun">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="code">Kode</Label>
                <Input
                  id="code"
                  name="code"
                  required
                  defaultValue={defaults.code}
                />
              </div>
              <div>
                <Label htmlFor="name">Nama Akun</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={defaults.name}
                />
              </div>
              <SearchableSelect
                id="type"
                name="type"
                label="Tipe Akun"
                required
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
    </div>
  );
}
