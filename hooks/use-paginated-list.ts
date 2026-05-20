"use client";

import { useCallback, useEffect, useState } from "react";
import type { PaginatedList, PaginationMeta } from "@/lib/types/api";

export function usePaginatedList<T>(
  fetcher: (params: {
    page: number;
    limit: number;
    search?: string;
  }) => Promise<PaginatedList<T>>,
  search: string,
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher({
        page,
        limit: 10,
        search: search || undefined,
      });
      setItems(data.items);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return { items, meta, page, setPage, loading, error, reload: load };
}
