"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * On-device step tracker + activity classifier.
 *
 * Uses the phone's accelerometer (DeviceMotion) to count steps and decide
 * whether you're still, walking, running, or in a vehicle — so steps are
 * counted automatically and a car ride never inflates your count.
 *
 * How it works:
 *  - Gravity is removed with a slow low-pass filter, leaving "dynamic"
 *    acceleration magnitude.
 *  - Steps are peaks in that signal, gated by a refractory period
 *    (hysteresis) so one stride = one step.
 *  - We only *commit* steps when the recent step rhythm sits in the human
 *    range (≈1.3–3.6 Hz) with consistent intervals. A car's vibration is
 *    either too smooth or too irregular, so it classifies as "vehicle"
 *    and those candidate steps are discarded.
 *
 * Heuristic — not a medical pedometer — but genuinely distinguishes the
 * four states and counts real walking/running steps hands-free.
 */
export type Activity = "still" | "walking" | "running" | "vehicle" | "unknown";

interface Options {
  /** Called on each flush (~2/sec) with the number of NEW counted steps. */
  onSteps?: (delta: number) => void;
}

interface StepTrackerState {
  supported: boolean;
  permission: "unknown" | "granted" | "denied" | "prompt";
  running: boolean;
  activity: Activity;
  /** Steps per minute (recent). */
  cadence: number;
  /** Steps counted this tracking session. */
  sessionSteps: number;
  /** True once started but no motion events are arriving (e.g. desktop). */
  noSignal: boolean;
  start: () => Promise<void>;
  stop: () => void;
}

// Tuning constants.
const GRAVITY_ALPHA = 0.9; // gravity estimate smoothing (slow)
const PEAK_HI = 1.3; // m/s² — must exceed to arm a step
const PEAK_LO = 0.6; // m/s² — must drop below to re-arm (hysteresis)
const MIN_STEP_MS = 270; // refractory → max ~222 spm
const STILL_VAR = 0.18; // RMS below this = still
const FLUSH_MS = 500;
const STEP_HISTORY = 12; // step timestamps kept for cadence/rhythm

type MotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export function useStepTracker(options: Options = {}): StepTrackerState {
  const { onSteps } = options;
  const onStepsRef = useRef(onSteps);
  onStepsRef.current = onSteps;

  // Detect support after mount so SSR + first client render agree (avoids
  // a hydration mismatch on the steps card).
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && typeof DeviceMotionEvent !== "undefined"
    );
  }, []);

  const [permission, setPermission] = useState<StepTrackerState["permission"]>("unknown");
  const [running, setRunning] = useState(false);
  const [activity, setActivity] = useState<Activity>("unknown");
  const [cadence, setCadence] = useState(0);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [noSignal, setNoSignal] = useState(false);

  // Filter / detector state (refs — mutated at sensor rate, no re-render).
  const gravity = useRef(9.81);
  const armed = useRef(true);
  const lastStepAt = useRef(0);
  const stepTimes = useRef<number[]>([]);
  const dynWindow = useRef<number[]>([]); // recent |dynamic| samples
  const peakWindow = useRef<number[]>([]); // recent peak magnitudes
  const uncommitted = useRef(0); // candidate steps awaiting classification
  const committedTotal = useRef(0);
  const lastEventAt = useRef(0);
  const startedAt = useRef(0);

  const onMotion = useCallback((e: DeviceMotionEvent) => {
    lastEventAt.current = Date.now();
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
    const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    // Slow low-pass = gravity estimate; subtract to get dynamic accel.
    gravity.current = GRAVITY_ALPHA * gravity.current + (1 - GRAVITY_ALPHA) * mag;
    const dyn = Math.abs(mag - gravity.current);

    dynWindow.current.push(dyn);
    if (dynWindow.current.length > 120) dynWindow.current.shift();

    const now = Date.now();
    // Peak detection with hysteresis + refractory period.
    if (armed.current && dyn > PEAK_HI && now - lastStepAt.current > MIN_STEP_MS) {
      armed.current = false;
      lastStepAt.current = now;
      uncommitted.current += 1;
      stepTimes.current.push(now);
      if (stepTimes.current.length > STEP_HISTORY) stepTimes.current.shift();
      peakWindow.current.push(dyn);
      if (peakWindow.current.length > STEP_HISTORY) peakWindow.current.shift();
    } else if (!armed.current && dyn < PEAK_LO) {
      armed.current = true;
    }
  }, []);

  // Flush loop — classify activity + commit/drop candidate steps.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();

      // No events for ~2.5s after start → device has no motion sensor.
      if (lastEventAt.current === 0 && now - startedAt.current > 2500) {
        setNoSignal(true);
      }

      // RMS of recent dynamic accel (movement intensity).
      const win = dynWindow.current;
      const rms = win.length
        ? Math.sqrt(win.reduce((s, v) => s + v * v, 0) / win.length)
        : 0;

      // Cadence + rhythm consistency from recent step intervals.
      const recent = stepTimes.current.filter((t) => now - t < 4000);
      let hz = 0;
      let cv = 1;
      if (recent.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < recent.length; i++) intervals.push(recent[i] - recent[i - 1]);
        const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
        const variance = intervals.reduce((s, v) => s + (v - mean) ** 2, 0) / intervals.length;
        cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
        hz = mean > 0 ? 1000 / mean : 0;
      }

      const avgPeak = peakWindow.current.length
        ? peakWindow.current.reduce((s, v) => s + v, 0) / peakWindow.current.length
        : 0;

      // Classify.
      const humanRhythm = hz >= 1.3 && hz <= 3.8 && cv < 0.45 && recent.length >= 3;
      let act: Activity;
      if (rms < STILL_VAR && recent.length === 0) {
        act = "still";
      } else if (humanRhythm) {
        act = hz > 2.5 || avgPeak > 6 ? "running" : "walking";
      } else if (rms >= STILL_VAR) {
        // Moving, but no human step rhythm → in a vehicle.
        act = "vehicle";
      } else {
        act = "still";
      }

      // Commit candidate steps only while walking/running.
      const pending = uncommitted.current;
      uncommitted.current = 0;
      if ((act === "walking" || act === "running") && pending > 0) {
        committedTotal.current += pending;
        setSessionSteps(committedTotal.current);
        onStepsRef.current?.(pending);
      }
      // (Otherwise the candidate steps are dropped — vehicle/still noise.)

      setActivity(act);
      setCadence(act === "walking" || act === "running" ? Math.round(hz * 60) : 0);
    }, FLUSH_MS);
    return () => clearInterval(id);
  }, [running]);

  const attach = useCallback(() => {
    startedAt.current = Date.now();
    lastEventAt.current = 0;
    setNoSignal(false);
    window.addEventListener("devicemotion", onMotion);
    setRunning(true);
  }, [onMotion]);

  const start = useCallback(async () => {
    if (!supported) return;
    const DME = DeviceMotionEvent as MotionEventWithPermission;
    if (typeof DME.requestPermission === "function") {
      try {
        const res = await DME.requestPermission();
        setPermission(res === "granted" ? "granted" : "denied");
        if (res !== "granted") return;
      } catch {
        setPermission("denied");
        return;
      }
    } else {
      setPermission("granted");
    }
    attach();
  }, [supported, attach]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("devicemotion", onMotion);
    }
    setRunning(false);
    setActivity("unknown");
    setCadence(0);
  }, [onMotion]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("devicemotion", onMotion);
      }
    };
  }, [onMotion]);

  return {
    supported,
    permission,
    running,
    activity,
    cadence,
    sessionSteps,
    noSignal,
    start,
    stop,
  };
}
