"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dedupeRequest } from "@/lib/api/dedupe-request";
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
  const [error, setError] = useState<string | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const loadGenerationRef = useRef(0);
  const forceNextRef = useRef(false);

  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

  const fetchKey = `paginated:${JSON.stringify({
    page,
    limit: 10,
    search: search || undefined,
  })}:${reloadNonce}`;
  const loading = resolvedKey !== fetchKey;

  useEffect(() => {
    const generation = ++loadGenerationRef.current;
    const force = forceNextRef.current;
    forceNextRef.current = false;
    const params = {
      page,
      limit: 10,
      search: search || undefined,
    };
    const dedupeKey = `paginated:${JSON.stringify(params)}`;
    let cancelled = false;

    void (async () => {
      try {
        const data = force
          ? await fetcher(params)
          : await dedupeRequest(dedupeKey, () => fetcher(params));

        if (cancelled || generation !== loadGenerationRef.current) return;

        setItems(data.items);
        setMeta(data.meta);
        setError(null);
        setResolvedKey(fetchKey);
      } catch (err) {
        if (cancelled || generation !== loadGenerationRef.current) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        setResolvedKey(fetchKey);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetcher, fetchKey, page, search]);

  const reload = useCallback(() => {
    forceNextRef.current = true;
    setReloadNonce((n) => n + 1);
  }, []);

  return { items, meta, page, setPage, loading, error, reload };
}
