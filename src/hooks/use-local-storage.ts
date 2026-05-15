"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * SSR-safe localStorage hook with JSON serialization.
 *
 * Critically: the `initial` value is captured in a ref so callers can
 * pass `new Set()` or `{}` literals without triggering an effect/re-render
 * loop. (Previous version put `initial` in a useCallback dep array; every
 * parent re-render produced a new object reference, the effect fired,
 * setState ran with a new identity-but-equal value, the component
 * re-rendered, and the cycle repeated forever — freezing the React tree
 * and making every click inert.)
 *
 * Behavior:
 * - SSR / first client render: returns `initial` (no localStorage read,
 *   keeps hydration markup identical).
 * - After mount: reads localStorage and updates state once.
 * - Writes through to localStorage on every state change.
 * - Multi-tab sync via the storage event.
 *
 * Pass `serializer: "set"` to (de)serialize a Set as a JSON array.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
  options: { serializer?: "json" | "set" } = {}
) {
  const { serializer = "json" } = options;

  // Stabilize `initial` so render-time literals (new Set(), {}, []) don't
  // make our effects fire every render.
  const initialRef = useRef(initial);

  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once per `key`. We deliberately leave
  // `initial` and `serializer` out of the dep array — `initialRef.current`
  // is referentially stable and `serializer` is effectively a constant
  // per call site.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw);
      const next =
        serializer === "set"
          ? (new Set(parsed) as unknown as T)
          : (parsed as T);
      setValue(next);
    } catch {
      // Storage unavailable, malformed JSON, etc. — fall through.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Listen for cross-tab updates.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        if (e.newValue === null) {
          setValue(initialRef.current);
          return;
        }
        const parsed = JSON.parse(e.newValue);
        setValue(
          serializer === "set"
            ? (new Set(parsed) as unknown as T)
            : (parsed as T)
        );
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, serializer]);

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
            /* quota or storage unavailable */
          }
        }
        return v;
      });
    },
    [key, serializer]
  );

  return [value, update, hydrated] as const;
}
