"use client";

import { postFillQc } from "@/lib/api/production";
import { BarcodeScanPanel } from "@/components/ui/barcode-scan-panel";
import { PageHeader } from "@/components/ui/page-header";

export default function QcPostFillPage() {
  return (
    <div className="animate-in">
      <PageHeader
        title="QC Post-Fill"
        description="Inspeksi setelah pengisian: validasi tabung siap dikirim ke pelanggan."
      />
      <BarcodeScanPanel
        title="Scan Tabung Terisi"
        description="Tabung harus sudah melalui filling batch. Scan barcode lalu submit."
        submitLabel="Proses QC Post-Fill"
        onSubmit={(barcodes) => postFillQc({ barcodes })}
      />
    </div>
  );
}
