"use client";

import { useState } from "react";
import { Label } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  CustomerResponse,
  CylinderLocationResponse,
  CylinderLocationType,
  VendorResponse,
} from "@/lib/types/api";

const locationTypeLabels: Record<CylinderLocationType, string> = {
  WAREHOUSE: "Gudang",
  FILLING_STATION: "Stasiun Pengisian",
  WORKSHOP: "Workshop",
  CUSTOMER: "Pelanggan",
  VENDOR: "Vendor",
  IN_TRANSIT: "Dalam Perjalanan",
  MAINTENANCE: "Perawatan",
  UNKNOWN: "Tidak Diketahui",
};

export function cylinderLocationTypeLabel(type?: string) {
  if (!type) return "—";
  return locationTypeLabels[type as CylinderLocationType] ?? type;
}

// IN_TRANSIT / MAINTENANCE / UNKNOWN are flow states — never picked by hand.
const selectableTypes: { value: string; label: string }[] = [
  { value: "WAREHOUSE", label: locationTypeLabels.WAREHOUSE },
  { value: "FILLING_STATION", label: locationTypeLabels.FILLING_STATION },
  { value: "WORKSHOP", label: locationTypeLabels.WORKSHOP },
  { value: "CUSTOMER", label: locationTypeLabels.CUSTOMER },
  { value: "VENDOR", label: locationTypeLabels.VENDOR },
];

type CylinderLocationFieldsProps = {
  locations: CylinderLocationResponse[];
  customers: CustomerResponse[];
  vendors: VendorResponse[];
  emptyLabel: string;
  disabled?: boolean;
};

export function CylinderLocationFields({
  locations,
  customers,
  vendors,
  emptyLabel,
  disabled = false,
}: CylinderLocationFieldsProps) {
  const [type, setType] = useState("");
  const [refId, setRefId] = useState("");

  const refOptions =
    type === "CUSTOMER"
      ? customers.map((customer) => ({
          value: customer.id,
          label: `${customer.code} — ${customer.name}`,
        }))
      : type === "VENDOR"
        ? vendors.map((vendor) => ({
            value: vendor.id,
            label: `${vendor.code} — ${vendor.name}`,
          }))
        : type
          ? locations
              .filter((location) => location.type === type && location.is_active)
              .map((location) => ({
                value: location.id,
                label: `${location.code} — ${location.name}`,
              }))
          : [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="location_type">Tipe Lokasi</Label>
        <SearchableSelect
          id="location_type"
          name="location_type"
          value={type}
          disabled={disabled}
          onChange={(event) => {
            setType(event.target.value);
            setRefId("");
          }}
        >
          <option value="">{emptyLabel}</option>
          {selectableTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SearchableSelect>
      </div>
      <div>
        <Label htmlFor="location_id">Detail Lokasi</Label>
        <SearchableSelect
          id="location_id"
          name="location_id"
          value={refId}
          disabled={disabled || !type}
          placeholder={
            type ? "Pilih lokasi..." : "Pilih tipe lokasi terlebih dahulu"
          }
          onChange={(event) => setRefId(event.target.value)}
        >
          <option value="" disabled>
            Pilih lokasi
          </option>
          {refOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SearchableSelect>
      </div>
    </div>
  );
}
