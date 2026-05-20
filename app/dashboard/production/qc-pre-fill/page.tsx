"use client";

import { preFillQc } from "@/lib/api/production";
import { BarcodeScanPanel } from "@/components/ui/barcode-scan-panel";
import { PageHeader } from "@/components/ui/page-header";

export default function QcPreFillPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="QC Pre-Fill"
        description="Inspeksi visual awal: ubah status tabung dari EMPTY ke READY_TO_FILL."
      />
      <BarcodeScanPanel
        title="Scan Tabung Kosong"
        description="Tabung harus berstatus EMPTY. Scan barcode satu per satu lalu submit."
        submitLabel="Proses QC Pre-Fill"
        onSubmit={(barcodes) => preFillQc({ barcodes })}
      />
    </div>
  );
}
