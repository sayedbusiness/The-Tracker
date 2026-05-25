"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Footprints,
  Moon,
  Scale,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";

/**
 * Manual input loggers for steps (today), sleep (last night), and
 * weight (current). All synced — every device sees the same values.
 */

const STEP_TARGET = 10000;
const SLEEP_TARGET = 8;

export function StepsLogger({ compact = false }: { compact?: boolean }) {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);
  const [steps, setSteps] = useSyncedState<number>(`health:steps:${today}`, 0);
  const [draft, setDraft] = useState<string>("");

  const pct = Math.min(100, (steps / STEP_TARGET) * 100);

  const commit = () => {
    const n = Math.max(0, Math.floor(Number(draft) || 0));
    if (!Number.isFinite(n)) return;
    setSteps(n);
    setDraft("");
  };

  return (
    <div className={compact ? "" : "surface-card rounded-2xl p-4"}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
            <Footprints className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Steps</div>
            <div className="text-[10px] text-slate-500">
              {STEP_TARGET.toLocaleString()} target · today
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular text-white">
            {steps.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">{Math.round(pct)}%</div>
        </div>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Total steps so far"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="flex-1 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/40 focus:outline-none"
        />
        <button
          onClick={commit}
          disabled={!draft}
          className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white disabled:opacity-40"
          aria-label="Save steps"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {[500, 1000, 2500].map((n) => (
            <button
              key={n}
              onClick={() => setSteps((s) => s + n)}
              className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-slate-300 hover:bg-white/[0.06] hover:text-white"
            >
              +{n.toLocaleString()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSteps(0)}
          className="text-[10px] text-slate-500 hover:text-rose-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export function SleepLogger({ compact = false }: { compact?: boolean }) {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);
  // Sleep is stored under today's key — represents the night before today.
  const [hours, setHours] = useSyncedState<number>(`health:sleep:${today}`, 0);
  const [draft, setDraft] = useState<string>("");

  const pct = Math.min(100, (hours / SLEEP_TARGET) * 100);
  const meta =
    hours === 0
      ? "Log last night's sleep"
      : hours < 6
        ? "Under-slept — recovery debt"
        : hours < 7
          ? "Acceptable — aim 7+"
          : hours < 9
            ? "Locked in"
            : "Heavy night";

  const commit = () => {
    const n = Math.max(0, Math.min(14, Number(draft)));
    if (!Number.isFinite(n)) return;
    setHours(Math.round(n * 10) / 10);
    setDraft("");
  };

  return (
    <div className={compact ? "" : "surface-card rounded-2xl p-4"}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <Moon className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Sleep</div>
            <div className="text-[10px] text-slate-500">{meta}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular text-white">
            {hours}
            <span className="text-xs text-slate-500"> hrs</span>
          </div>
          <div className="text-[10px] text-slate-500">{Math.round(pct)}%</div>
        </div>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.25"
          placeholder="Hours slept (e.g. 7.5)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="flex-1 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none"
        />
        <button
          onClick={commit}
          disabled={!draft}
          className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white disabled:opacity-40"
          aria-label="Save sleep"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {[6, 6.5, 7, 7.5, 8, 8.5].map((n) => (
          <button
            key={n}
            onClick={() => setHours(n)}
            className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-slate-300 hover:bg-white/[0.06] hover:text-white"
          >
            {n}h
          </button>
        ))}
      </div>
    </div>
  );
}

interface WeightEntry {
  date: string;
  weight: number;
}

export function WeightLogger({
  starting = 172,
  compact = false,
}: {
  starting?: number;
  compact?: boolean;
}) {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);
  const [history, setHistory] = useSyncedState<WeightEntry[]>(
    "health:weight:history",
    []
  );
  const [draft, setDraft] = useState<string>("");

  const latest = history.length > 0 ? history[history.length - 1].weight : starting;
  const previous =
    history.length > 1 ? history[history.length - 2].weight : latest;
  const delta = latest - previous;

  const commit = () => {
    const n = Math.max(0, Math.min(500, Number(draft)));
    if (!Number.isFinite(n) || n === 0) return;
    const rounded = Math.round(n * 10) / 10;
    setHistory((prev) => {
      const filtered = prev.filter((e) => e.date !== today);
      return [...filtered, { date: today, weight: rounded }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });
    setDraft("");
  };

  return (
    <div className={compact ? "" : "surface-card rounded-2xl p-4"}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
            <Scale className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Weight</div>
            <div className="text-[10px] text-slate-500">
              {history.length === 0
                ? "Starting · log your first weigh-in"
                : `${history.length} log${history.length === 1 ? "" : "s"}`}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular text-white">
            {latest}
            <span className="text-xs text-slate-500"> lb</span>
          </div>
          {history.length > 1 && (
            <div
              className={`text-[10px] tabular ${
                delta < 0
                  ? "text-emerald-300"
                  : delta > 0
                    ? "text-rose-300"
                    : "text-slate-500"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)} lb
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            setDraft((d) => String(Math.max(0, (Number(d) || latest) - 0.2)))
          }
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
          aria-label="Decrease"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder={`${latest}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="flex-1 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5 text-center text-sm text-white placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none"
        />
        <button
          onClick={() =>
            setDraft((d) => String((Number(d) || latest) + 0.2))
          }
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
          aria-label="Increase"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={commit}
          disabled={!draft}
          className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white disabled:opacity-40"
          aria-label="Save weight"
        >
          <Check className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Workout logger — quick log of today's training. Synced.
export interface Workout {
  id: string;
  date: string;
  type: string;
  durationMin: number;
  intensity: number; // 0-100
  notes?: string;
}

export function WorkoutLogger() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);
  const [workouts, setWorkouts] = useSyncedState<Workout[]>(
    "health:workouts",
    []
  );
  const [draft, setDraft] = useState({
    type: "",
    durationMin: 45,
    intensity: 70,
  });

  const todayWorkouts = workouts.filter((w) => w.date === today);

  const log = () => {
    const type = draft.type.trim();
    if (!type) return;
    const w: Workout = {
      id: `w-${Date.now()}`,
      date: today,
      type,
      durationMin: Math.max(1, draft.durationMin),
      intensity: Math.min(100, Math.max(0, draft.intensity)),
    };
    setWorkouts((prev) => [...prev, w]);
    setDraft({ type: "", durationMin: 45, intensity: 70 });
  };

  const remove = (id: string) =>
    setWorkouts((prev) => prev.filter((w) => w.id !== id));

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Today's workouts</h3>
          <p className="text-[10px] text-slate-500">
            {todayWorkouts.length === 0
              ? "Log when you finish a session"
              : `${todayWorkouts.length} session${todayWorkouts.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          placeholder="Type (Push, Pull, Cardio, Boxing…)"
          value={draft.type}
          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
          className="min-w-[140px] flex-1 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-1.5 text-sm text-white placeholder:text-slate-500"
        />
        <input
          type="number"
          inputMode="numeric"
          value={draft.durationMin}
          onChange={(e) =>
            setDraft((d) => ({ ...d, durationMin: Number(e.target.value) || 0 }))
          }
          placeholder="min"
          className="w-20 rounded-lg border border-white/[0.06] bg-black/30 px-2 py-1.5 text-center text-sm text-white"
        />
        <input
          type="number"
          inputMode="numeric"
          value={draft.intensity}
          onChange={(e) =>
            setDraft((d) => ({ ...d, intensity: Number(e.target.value) || 0 }))
          }
          placeholder="intensity %"
          className="w-24 rounded-lg border border-white/[0.06] bg-black/30 px-2 py-1.5 text-center text-sm text-white"
        />
        <button
          onClick={log}
          disabled={!draft.type.trim()}
          className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Log
        </button>
      </div>

      {todayWorkouts.length > 0 && (
        <div className="space-y-1.5">
          {todayWorkouts.map((w) => (
            <div
              key={w.id}
              className="group flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 text-xs"
            >
              <div className="flex-1 font-medium text-white">{w.type}</div>
              <span className="tabular text-slate-400">{w.durationMin}m</span>
              <span className="tabular text-emerald-300">
                {w.intensity}% int
              </span>
              <button
                onClick={() => remove(w.id)}
                className="text-slate-500 hover:text-rose-300"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
