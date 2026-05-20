"use client";

import { emptyReceive } from "@/lib/api/inbound";
import { BarcodeScanPanel } from "@/components/ui/barcode-scan-panel";
import { PageHeader } from "@/components/ui/page-header";

export default function EmptyReceivePage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="Terima Tabung Kosong"
        description="Gate-in: tabung OUTSTANDING / IN_TRANSIT kembali ke status EMPTY."
      />
      <BarcodeScanPanel
        title="Scan Tabung Kembali"
        description="Scan barcode tabung kosong yang dibawa armada saat kembali ke gudang."
        submitLabel="Proses Penerimaan"
        onSubmit={(barcodes) => emptyReceive({ barcodes })}
      />
    </div>
  );
}
