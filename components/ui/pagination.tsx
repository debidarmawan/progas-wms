import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/types/api";

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/40 px-6 py-4 text-sm text-slate-600">
      <span>
        Halaman <strong className="text-slate-800">{meta.page}</strong> dari{" "}
        <strong className="text-slate-800">{meta.total_pages}</strong>
        <span className="text-slate-400"> · </span>
        {meta.total_items} data
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.page >= meta.total_pages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}
