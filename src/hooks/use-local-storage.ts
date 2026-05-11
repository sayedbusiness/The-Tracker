"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * SSR-safe localStorage hook with JSON serialization.
 *
 * - Reads from localStorage on mount (after hydration).
 * - Writes through on every change.
 * - Multi-tab sync via storage event.
 * - Falls back to `initial` if storage is unavailable (private browsing,
 *   server render, etc.).
 *
 * Sets are serialized as arrays automatically — pass `serializer: "set"`
 * to opt into Set-aware (de)serialization.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  options: { serializer?: "json" | "set" } = {}
) {
  const { serializer = "json" } = options;

  const read = useCallback((): T => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed = JSON.parse(raw);
      if (serializer === "set") {
        return new Set(parsed) as unknown as T;
      }
      return parsed as T;
    } catch {
      return initial;
    }
  }, [key, initial, serializer]);

  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    setValue(read());
    setHydrated(true);
  }, [read]);

  // Listen for cross-tab changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, read]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v =
          typeof next === "function"
            ? (next as (prev: T) => T)(prev)
            : next;
        if (typeof window !== "undefined") {
          try {
            const toStore =
              serializer === "set"
                ? Array.from(v as unknown as Set<unknown>)
                : v;
            window.localStorage.setItem(key, JSON.stringify(toStore));
          } catch {
            // Quota exceeded or storage unavailable — silently drop
          }
        }
        return v;
      });
    },
    [key, serializer]
  );

  return [value, update, hydrated] as const;
}
