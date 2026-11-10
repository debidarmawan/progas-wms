"use client";

import { useEffect, useState } from "react";
import { listAccounts } from "@/lib/api/accounts";
import type { AccountResponse, AccountType } from "@/lib/types/api";
import { FormSection } from "@/components/ui/form-layout";
import { Label } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";

type CoaSlot = {
  name: "inventory_account_id" | "revenue_account_id" | "cogs_account_id";
  label: string;
  type: AccountType;
  hint: string;
};

// Mirror of the backend rule: each slot only accepts one account type.
const slots: CoaSlot[] = [
  {
    name: "inventory_account_id",
    label: "Akun Persediaan",
    type: "ASSET",
    hint: "Akun aset tempat nilai stok item ini dicatat.",
  },
  {
    name: "revenue_account_id",
    label: "Akun Pendapatan",
    type: "REVENUE",
    hint: "Akun pendapatan saat item ini terjual.",
  },
  {
    name: "cogs_account_id",
    label: "Akun HPP",
    type: "EXPENSE",
    hint: "Akun beban harga pokok penjualan item ini.",
  },
];

export type CoaMappingDefaults = Partial<Record<CoaSlot["name"], string>>;

export function CoaMappingFields({
  defaults,
}: {
  defaults?: CoaMappingDefaults;
}) {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);

  useEffect(() => {
    listAccounts({ limit: 100, is_active: "true" })
      .then((res) => setAccounts(res.items))
      .catch(() => setAccounts([]));
  }, []);

  return (
    <FormSection
      title="Mapping Akuntansi (CoA)"
      description="Opsional. Mapping dipakai saat jurnal otomatis diaktifkan; kosongkan jika belum siap."
      tone="muted"
      className="space-y-3"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {slots.map((slot) => (
          <div key={slot.name}>
            <Label htmlFor={slot.name}>{slot.label}</Label>
            <SearchableSelect
              id={slot.name}
              name={slot.name}
              defaultValue={defaults?.[slot.name] ?? ""}
            >
              <option value="">Tanpa mapping</option>
              {accounts
                .filter((account) => account.type === slot.type)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} — {account.name}
                  </option>
                ))}
            </SearchableSelect>
            <p className="mt-1 text-xs text-slate-500">{slot.hint}</p>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
