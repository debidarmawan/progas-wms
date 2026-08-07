"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createMasterItemsBulk } from "@/lib/api/master-items";
import type { CreateMasterItemRequest } from "@/lib/types/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

type DraftItem = {
  id: string;
  name: string;
  sku: string;
  gas_type: string;
  is_serialized: "true" | "false";
  empty_weight_kg: string;
  gas_weight_kg: string;
  min_stock_alert: string;
  max_days_at_customer: string;
  skuEdited: boolean;
};

function generateSku(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

function createEmptyItem(seed: number): DraftItem {
  return {
    id: `row-${seed}`,
    name: "",
    sku: "",
    gas_type: "",
    is_serialized: "true",
    empty_weight_kg: "",
    gas_weight_kg: "",
    min_stock_alert: "",
    max_days_at_customer: "",
    skuEdited: false,
  };
}

export default function NewBulkMasterItemsPage() {
  const router = useRouter();
  const nextRowIdRef = useRef(2);
  const [rows, setRows] = useState<DraftItem[]>([createEmptyItem(1)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(id: string, patch: Partial<DraftItem>) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (
          Object.prototype.hasOwnProperty.call(patch, "name") &&
          !next.skuEdited
        ) {
          next.sku = generateSku(next.name);
        }
        return next;
      }),
    );
  }

  function addRow() {
    setRows((prev) => {
      const id = nextRowIdRef.current;
      nextRowIdRef.current += 1;
      return [...prev, createEmptyItem(id)];
    });
  }

  function removeRow(id: string) {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== id),
    );
  }

  async function handleSubmit() {
    setError(null);
    const prepared: CreateMasterItemRequest[] = rows.map((row) => {
      const isSerialized = row.is_serialized === "true";
      return {
        name: row.name.trim(),
        sku: row.sku.trim().toUpperCase(),
        gas_type: row.gas_type.trim() || undefined,
        is_serialized: isSerialized,
        empty_weight_kg: isSerialized
          ? Number(row.empty_weight_kg || 0) || undefined
          : undefined,
        gas_weight_kg: isSerialized
          ? Number(row.gas_weight_kg || 0) || undefined
          : undefined,
        min_stock_alert: isSerialized
          ? undefined
          : Number(row.min_stock_alert || 0) || undefined,
        max_days_at_customer: isSerialized
          ? Number(row.max_days_at_customer || 0) || undefined
          : undefined,
      };
    });

    if (prepared.some((item) => !item.name || !item.sku)) {
      setError("Nama dan SKU wajib diisi untuk semua baris.");
      return;
    }

    setLoading(true);
    try {
      await createMasterItemsBulk({ items: prepared });
      router.push("/dashboard/master-items");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan data bulk",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in space-y-4">
      <PageHeader
        title="Tambah Banyak Master Item"
        description="Isi beberapa item sekaligus lalu simpan sekali proses."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {rows.map((row, index) => {
        const isSerialized = row.is_serialized === "true";
        return (
          <Card key={row.id}>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Item #{index + 1}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(row.id)}
                >
                  Hapus
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nama</Label>
                  <Input
                    value={row.name}
                    onChange={(event) =>
                      updateRow(row.id, { name: event.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={row.sku}
                    onChange={(event) =>
                      updateRow(row.id, {
                        sku: event.target.value.toUpperCase(),
                        skuEdited: true,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Jenis Gas</Label>
                  <Input
                    value={row.gas_type}
                    onChange={(event) =>
                      updateRow(row.id, { gas_type: event.target.value })
                    }
                    placeholder={
                      isSerialized
                        ? "OXYGEN, NITROGEN, ..."
                        : "Kosongkan untuk sparepart"
                    }
                  />
                </div>
                <div>
                  <Label>Tipe Item</Label>
                  <Select
                    value={row.is_serialized}
                    onChange={(event) =>
                      updateRow(row.id, {
                        is_serialized: event.target.value as "true" | "false",
                      })
                    }
                  >
                    <option value="true">Tabung (serialized)</option>
                    <option value="false">Suku cadang</option>
                  </Select>
                </div>
              </div>

              {isSerialized ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Berat Tabung Kosong (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.empty_weight_kg}
                        onChange={(event) =>
                          updateRow(row.id, {
                            empty_weight_kg: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Berat Gas Penuh (kg)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.gas_weight_kg}
                        onChange={(event) =>
                          updateRow(row.id, {
                            gas_weight_kg: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="max-w-sm">
                    <Label>Maksimal Hari di Customer</Label>
                    <Input
                      type="number"
                      min="0"
                      value={row.max_days_at_customer}
                      onChange={(event) =>
                        updateRow(row.id, {
                          max_days_at_customer: event.target.value,
                        })
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="max-w-sm">
                  <Label>Min Stock Alert</Label>
                  <Input
                    type="number"
                    min="0"
                    value={row.min_stock_alert}
                    onChange={(event) =>
                      updateRow(row.id, { min_stock_alert: event.target.value })
                    }
                  />
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={addRow}>
          + Tambah Baris
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? "Menyimpan..." : `Simpan ${rows.length} Item`}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </div>
  );
}
