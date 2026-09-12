"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dedupeRequest } from "@/lib/api/dedupe-request";
import type { PaginatedList, PaginationMeta } from "@/lib/types/api";

type PaginatedListParams = {
  page: number;
  limit: number;
  search?: string;
  [key: string]: string | number | undefined;
};

export function usePaginatedList<T>(
  fetcher: (params: PaginatedListParams) => Promise<PaginatedList<T>>,
  search: string,
  extraParams: Record<string, string | number | undefined> = {},
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const loadGenerationRef = useRef(0);
  const forceNextRef = useRef(false);

  const extraParamsKey = JSON.stringify(extraParams);
  const queryKey = JSON.stringify({
    search: search || undefined,
    extraParams: extraParamsKey,
  });
  const [prevQueryKey, setPrevQueryKey] = useState(queryKey);
  if (queryKey !== prevQueryKey) {
    setPrevQueryKey(queryKey);
    setPage(1);
  }

  const requestParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: search || undefined,
      ...extraParams,
    }),
    [extraParams, page, search],
  );
  const fetchKey = `paginated:${JSON.stringify(requestParams)}:${reloadNonce}`;
  const loading = resolvedKey !== fetchKey;

  useEffect(() => {
    const generation = ++loadGenerationRef.current;
    const force = forceNextRef.current;
    forceNextRef.current = false;
    const params = requestParams;
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
  }, [fetcher, fetchKey, page, requestParams]);

  const reload = useCallback(() => {
    forceNextRef.current = true;
    setReloadNonce((n) => n + 1);
  }, []);

  return { items, meta, page, setPage, loading, error, reload };
}
