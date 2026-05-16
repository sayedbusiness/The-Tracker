"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Cross-device synced state with localStorage as the local cache.
 *
 * - Same call signature as useLocalStorage: (key, initial, options?).
 * - Reads localStorage on mount for instant render.
 * - Polls /api/state/<key> every `pollMs` (default 20s) to pull
 *   newer values written from another device. Last-writer-wins by
 *   updatedAt timestamp.
 * - On every local change, writes to localStorage immediately AND
 *   pushes to /api/state/<key> in the background (fire-and-forget).
 * - If the API returns 503 (KV not configured), we silently degrade
 *   to localStorage-only mode — the app keeps working on one device.
 *
 * Pass `serializer: "set"` to round-trip a Set through JSON.
 */
type Serializer = "json" | "set";

type Options = {
  serializer?: Serializer;
  pollMs?: number;
};

const STAMP_PREFIX = "apex:stamp:";

function readStamp(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(`${STAMP_PREFIX}${key}`);
  return raw ? Number(raw) || 0 : 0;
}

function writeStamp(key: string, t: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STAMP_PREFIX}${key}`, String(t));
}

function serialize<T>(value: T, serializer: Serializer): unknown {
  return serializer === "set"
    ? Array.from(value as unknown as Set<unknown>)
    : value;
}

function deserialize<T>(raw: unknown, serializer: Serializer): T {
  return (serializer === "set" ? new Set(raw as unknown[]) : raw) as T;
}

export function useSyncedState<T>(
  key: string,
  initial: T,
  options: Options = {}
) {
  const { serializer = "json", pollMs = 20_000 } = options;
  const initialRef = useRef(initial);
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  // Tracks whether the server has confirmed sync is configured so we
  // stop hammering it every poll cycle when it's offline / unconfigured.
  const syncOnlineRef = useRef(true);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        setValue(deserialize<T>(parsed, serializer));
      }
    } catch {
      /* fall through */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Pull latest value from server on mount + every pollMs.
  useEffect(() => {
    if (!hydrated || !syncOnlineRef.current) return;
    let cancelled = false;

    const pull = async () => {
      try {
        const res = await fetch(`/api/state/${encodeURIComponent(key)}`, {
          cache: "no-store",
        });
        if (res.status === 503) {
          syncOnlineRef.current = false;
          return;
        }
        if (!res.ok) return;
        const body = (await res.json()) as {
          entry: { value: unknown; updatedAt: number } | null;
        };
        if (!body.entry || cancelled) return;
        const localStamp = readStamp(key);
        // Only adopt if the server copy is strictly newer.
        if (body.entry.updatedAt > localStamp) {
          const next = deserialize<T>(body.entry.value, serializer);
          setValue(next);
          try {
            window.localStorage.setItem(
              key,
              JSON.stringify(serialize(next, serializer))
            );
            writeStamp(key, body.entry.updatedAt);
          } catch {
            /* quota or storage unavailable */
          }
        }
      } catch {
        /* network — try again next tick */
      }
    };

    pull();
    const id = setInterval(pull, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hydrated, key, pollMs, serializer]);

  // Cross-tab sync via the storage event (instant, no network).
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
        setValue(deserialize<T>(parsed, serializer));
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
        const stamp = Date.now();
        if (typeof window !== "undefined") {
          try {
            const wire = serialize(v, serializer);
            window.localStorage.setItem(key, JSON.stringify(wire));
            writeStamp(key, stamp);
            if (syncOnlineRef.current) {
              fetch(`/api/state/${encodeURIComponent(key)}`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ value: wire, updatedAt: stamp }),
                keepalive: true,
              })
                .then((r) => {
                  if (r.status === 503) syncOnlineRef.current = false;
                })
                .catch(() => {
                  /* offline — local copy is still good */
                });
            }
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
