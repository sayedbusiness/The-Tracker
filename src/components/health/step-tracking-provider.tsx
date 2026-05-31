"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStepTracker, type Activity } from "@/hooks/use-step-tracker";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";

interface StepTrackingValue {
  supported: boolean;
  running: boolean;
  activity: Activity;
  cadence: number;
  sessionSteps: number;
  noSignal: boolean;
  permission: "unknown" | "granted" | "denied" | "prompt";
  /** User wants always-on tracking (persisted + auto-resumes on reopen). */
  autotrack: boolean;
  /** Turn it on — MUST be called from a tap (iOS needs a gesture to grant). */
  enable: () => void;
  disable: () => void;
}

const Ctx = createContext<StepTrackingValue | null>(null);

export function useStepTracking(): StepTrackingValue {
  return (
    useContext(Ctx) ?? {
      supported: false,
      running: false,
      activity: "unknown",
      cadence: 0,
      sessionSteps: 0,
      noSignal: false,
      permission: "unknown",
      autotrack: false,
      enable: () => {},
      disable: () => {},
    }
  );
}

/**
 * App-wide step tracking. One accelerometer listener for the whole app, so
 * steps keep counting as you move between pages (not just on Health), and
 * it auto-resumes when you reopen the app if you turned it on — no
 * re-allowing each time (as long as the browser still has motion access).
 *
 * Limitation: a website can only run while the app is open (foreground or a
 * live tab). True always-on counting when the app is fully closed needs the
 * native build reading Apple HealthKit / Google Fit — that's the next layer.
 */
export function StepTrackingProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState("ssr");
  useEffect(() => setToday(todayKey()), []);

  const [, setSteps] = useSyncedState<number>(`health:steps:${today}`, 0);
  const [autotrack, setAutotrack] = useSyncedState<boolean>(
    "settings:step-autotrack",
    false
  );

  const tracker = useStepTracker({ onSteps: (delta) => setSteps((s) => s + delta) });

  // Auto-resume when the preference is on + the sensor is available. On iOS
  // this silently succeeds if motion access was already granted; if the OS
  // forgot the grant it needs one tap (the Health page shows a resume hint).
  useEffect(() => {
    if (autotrack && tracker.supported && !tracker.running && today !== "ssr") {
      void tracker.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autotrack, tracker.supported, today]);

  const enable = () => {
    setAutotrack(true);
    void tracker.start(); // called from a tap → satisfies iOS gesture rule
  };
  const disable = () => {
    setAutotrack(false);
    tracker.stop();
  };

  return (
    <Ctx.Provider
      value={{
        supported: tracker.supported,
        running: tracker.running,
        activity: tracker.activity,
        cadence: tracker.cadence,
        sessionSteps: tracker.sessionSteps,
        noSignal: tracker.noSignal,
        permission: tracker.permission,
        autotrack,
        enable,
        disable,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
