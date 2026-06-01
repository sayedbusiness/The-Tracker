"use client";

/**
 * Native background step tracking bridge.
 *
 * A website CANNOT count steps while it's closed — iOS only exposes that
 * data to a native app through HealthKit. When Avori is built as a native
 * shell (Capacitor — see DEPLOY.md → "Native background step tracking")
 * with a Health plugin, this module reads the *real* daily step total that
 * iOS has been counting in the background (via the motion coprocessor) and
 * feeds it into the app. On the plain web build everything here no-ops, and
 * the in-app accelerometer pedometer stays the source of truth.
 *
 * The plugin surface is intentionally duck-typed so it works with whichever
 * Health plugin you install (e.g. `capacitor-health` / community Health),
 * adjusting only the dataType string in the build guide if needed.
 */

interface HealthPlugin {
  isAvailable?: () => Promise<{ available: boolean }>;
  requestAuthorization?: (opts: unknown) => Promise<unknown>;
  requestPermissions?: (opts: unknown) => Promise<unknown>;
  queryAggregated?: (opts: unknown) => Promise<{ value?: number }>;
  query?: (opts: unknown) => Promise<{ value?: number; result?: number }>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  Plugins?: { Health?: HealthPlugin };
}

function cap(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor ?? null;
}

/** True only inside the native shell with a Health plugin present. */
export function isNativeStepsAvailable(): boolean {
  const c = cap();
  return Boolean(c?.isNativePlatform?.() && c.Plugins?.Health);
}

let authed = false;

/** Read today's total steps from HealthKit/Fit. null on web or on error. */
export async function readTodaySteps(): Promise<number | null> {
  const c = cap();
  const Health = c?.Plugins?.Health;
  if (!c?.isNativePlatform?.() || !Health) return null;

  try {
    if (!authed) {
      const opts = { read: ["steps"], all: ["steps"] };
      if (Health.requestAuthorization) await Health.requestAuthorization(opts);
      else if (Health.requestPermissions) await Health.requestPermissions(opts);
      authed = true;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const query = {
      dataType: "steps",
      startDate: start.toISOString(),
      endDate: new Date().toISOString(),
      bucket: "day",
    };

    const res = Health.queryAggregated
      ? await Health.queryAggregated(query)
      : Health.query
        ? await Health.query(query)
        : null;

    const value =
      (res as { value?: number; result?: number } | null)?.value ??
      (res as { result?: number } | null)?.result;
    return typeof value === "number" && value >= 0 ? Math.round(value) : null;
  } catch {
    return null;
  }
}
