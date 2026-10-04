"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { listCustomers } from "@/lib/api/customers";
import { listMasterItems } from "@/lib/api/master-items";
import { createSalesOrder, getCustomerPO, listCustomerPOs } from "@/lib/api/sales";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import type {
  CustomerPOResponse,
  CustomerResponse,
  MasterItemResponse,
} from "@/lib/types/api";

type SalesOrderLineInput = {
  master_item_id: string;
  qty_ordered: number;
  sku?: string;
  item_name?: string;
};

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [items, setItems] = useState<MasterItemResponse[]>([]);
  const [lines, setLines] = useState<SalesOrderLineInput[]>([]);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerId, setCustomerId] = useState("");
  const [selectedPO, setSelectedPO] = useState<CustomerPOResponse | null>(null);
  const [poSearch, setPOSearch] = useState("");
  const [poResults, setPOResults] = useState<CustomerPOResponse[]>([]);
  const [poPickerOpen, setPOPickerOpen] = useState(false);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [selectingPO, setSelectingPO] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const poPickerRef = useRef<HTMLDivElement>(null);
  const poRequestId = useRef(0);

  useEffect(() => {
    Promise.all([
      listCustomers({ page: 1, limit: 200 }),
      listMasterItems({ page: 1, limit: 200 }),
    ])
      .then(([customerData, itemData]) => {
        setCustomers(customerData.items);
        setItems(itemData.items);
      })
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat data pelanggan dan item.",
        ),
      );
  }, []);

  useEffect(() => {
    const query = poSearch.trim();
    if (!query) return;

    const requestId = ++poRequestId.current;
    const timeout = window.setTimeout(async () => {
      setLoadingPOs(true);
      try {
        const result = await listCustomerPOs({
          page: 1,
          limit: 20,
          search: query,
        });
        if (requestId === poRequestId.current) {
          setPOResults(result.items.filter((po) => po.status === "CONFIRMED"));
        }
      } catch (searchError) {
        if (requestId === poRequestId.current) {
          setError(
            searchError instanceof Error
              ? searchError.message
              : "Gagal mencari PO pelanggan.",
          );
          setPOResults([]);
        }
      } finally {
        if (requestId === poRequestId.current) setLoadingPOs(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [poSearch]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        poPickerRef.current &&
        !poPickerRef.current.contains(event.target as Node)
      ) {
        setPOPickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  async function selectPO(poId: string) {
    setSelectingPO(true);
    setError(null);
    try {
      const po = await getCustomerPO(poId);
      if (po.status !== "CONFIRMED") {
        setError("Sales Order hanya dapat dibuat dari PO yang sudah dikonfirmasi.");
        return;
      }

      setSelectedPO(po);
      setPOSearch(`${po.po_number} — ${po.customer_name || "Pelanggan"}`);
      setCustomerId(po.customer_id);
      setLines(
        (po.lines || []).map((line) => ({
          master_item_id: line.master_item_id,
          qty_ordered: line.quantity,
          sku: line.sku,
          item_name: line.item_name,
        })),
      );
      setItemId("");
      setQuantity("1");
      setPOPickerOpen(false);
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : "Gagal memuat detail PO pelanggan.",
      );
    } finally {
      setSelectingPO(false);
    }
  }

  function clearPO() {
    setSelectedPO(null);
    setPOSearch("");
    setCustomerId("");
    setLines([]);
    setPOResults([]);
    setPOPickerOpen(false);
  }

  function addLine() {
    const qty = Number(quantity);
    if (!itemId) {
      setError("Pilih item terlebih dahulu.");
      return;
    }
    if (!Number.isInteger(qty) || qty < 1) {
      setError("Jumlah item harus berupa bilangan bulat minimal 1.");
      return;
    }
    if (lines.some((line) => line.master_item_id === itemId)) {
      setError("Item tersebut sudah ditambahkan.");
      return;
    }

    setError(null);
    setLines((current) => [
      ...current,
      { master_item_id: itemId, qty_ordered: qty },
    ]);
    setItemId("");
    setQuantity("1");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) {
      setError("Pilih pelanggan atau PO pelanggan terlebih dahulu.");
      return;
    }
    if (!lines.length) {
      setError("Tambahkan minimal satu item.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createSalesOrder({
        customer_id: customerId,
        customer_po_id: selectedPO?.id,
        lines: lines.map(({ master_item_id, qty_ordered }) => ({
          master_item_id,
          qty_ordered,
        })),
      });
      router.push("/dashboard/sales/sales-orders");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Gagal membuat SO",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in">
      <PageHeader
        title="Buat Sales Order"
        description="Buat pesanan internal dari PO pelanggan atau langsung dari customer."
      />
      <Card>
        <CardBody>
          <form className="w-full space-y-5" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customer_id">Pelanggan</Label>
                <Select
                  id="customer_id"
                  name="customer_id"
                  required
                  value={customerId}
                  disabled={!!selectedPO}
                  onChange={(event) => setCustomerId(event.target.value)}
                >
                  <option value="" disabled>
                    Pilih pelanggan
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.code} — {customer.name}
                    </option>
                  ))}
                </Select>
                {selectedPO ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Pelanggan terisi dari PO terpilih.
                  </p>
                ) : null}
              </div>

              <div ref={poPickerRef} className="relative">
                <Label htmlFor="customer_po_search">
                  Cari PO pelanggan (opsional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="customer_po_search"
                    autoComplete="off"
                    placeholder="Cari nomor PO pelanggan..."
                    value={poSearch}
                    onFocus={() => setPOPickerOpen(true)}
                    onChange={(event) => {
                      poRequestId.current += 1;
                      setPOSearch(event.target.value);
                      setPOResults([]);
                      setLoadingPOs(false);
                      if (selectedPO) {
                        setSelectedPO(null);
                        setCustomerId("");
                        setLines([]);
                      }
                      setError(null);
                      setPOPickerOpen(true);
                    }}
                  />
                  {selectedPO ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={clearPO}
                    >
                      Hapus PO
                    </Button>
                  ) : null}
                </div>
                {poPickerOpen && !selectedPO ? (
                  <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {!poSearch.trim() ? (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        Ketik nomor PO untuk mencari.
                      </p>
                    ) : loadingPOs || selectingPO ? (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        {selectingPO ? "Memuat detail PO..." : "Mencari PO..."}
                      </p>
                    ) : poResults.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-500">
                        PO terkonfirmasi tidak ditemukan.
                      </p>
                    ) : (
                      poResults.map((po) => (
                        <button
                          key={po.id}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
                          onClick={() => void selectPO(po.id)}
                        >
                          <span className="font-medium">{po.po_number}</span>
                          <span className="text-slate-500">
                            {" "}
                            — {po.customer_name || "Pelanggan"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {!selectedPO ? (
              <div className="flex gap-2">
                <Select
                  aria-label="Master item"
                  value={itemId}
                  onChange={(event) => setItemId(event.target.value)}
                >
                  <option value="">Pilih item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.sku} — {item.name}
                    </option>
                  ))}
                </Select>
                <Input
                  aria-label="Jumlah"
                  min="1"
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addLine}
                >
                  Tambah
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Item dan jumlah diisi otomatis dari PO yang dipilih.
              </p>
            )}

            <ul className="divide-y rounded-lg border border-slate-200">
              {lines.map((line) => {
                const item = items.find(
                  (candidate) => candidate.id === line.master_item_id,
                );
                const itemName =
                  item?.name || line.item_name || "Item tidak ditemukan";
                const sku = item?.sku || line.sku;
                return (
                  <li
                    className="flex justify-between px-3 py-2 text-sm"
                    key={line.master_item_id}
                  >
                    <span>
                      {sku ? `${sku} — ` : ""}
                      {itemName}
                    </span>
                    <span className="font-semibold">{line.qty_ordered}</span>
                  </li>
                );
              })}
              {!lines.length ? (
                <li className="px-3 py-2 text-sm text-slate-500">
                  Belum ada item.
                </li>
              ) : null}
            </ul>

            {error ? <Alert variant="error">{error}</Alert> : null}

            <div className="flex gap-2">
              <Button disabled={loading || selectingPO} type="submit">
                {loading ? "Menyimpan..." : "Simpan SO"}
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
        </CardBody>
      </Card>
    </div>
  );
}
