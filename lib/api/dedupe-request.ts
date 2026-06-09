const inflight = new Map<string, Promise<unknown>>();

/** Gabungkan request identik yang masih in-flight (mis. React Strict Mode). */
export function dedupeRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = fn().finally(() => {
    if (inflight.get(key) === promise) {
      inflight.delete(key);
    }
  });

  inflight.set(key, promise);
  return promise;
}
