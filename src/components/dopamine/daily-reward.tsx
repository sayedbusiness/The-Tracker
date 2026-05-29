"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Flame, Sparkles, X } from "lucide-react";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import { useDopamine } from "./dopamine-provider";

type Phase = "hidden" | "offered" | "revealing" | "revealed";

/** Streak length implied by the set of active days, ending today/yesterday. */
function computeStreak(days: string[], today: string): number {
  if (days.length === 0) return 0;
  const sorted = [...days].sort();
  const dayMs = 24 * 3600 * 1000;
  const asDate = (s: string) => new Date(`${s}T12:00:00Z`).getTime();
  const last = sorted[sorted.length - 1];
  const gap = (asDate(today) - asDate(last)) / dayMs;
  if (gap > 1) return 0;
  let cur = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    if (asDate(sorted[i + 1]) - asDate(sorted[i]) === dayMs) cur++;
    else break;
  }
  return cur;
}

/** Variable-ratio reward — mostly small, occasionally a jackpot. */
function rollReward(): { xp: number; jackpot: boolean } {
  const r = Math.random();
  if (r < 0.6) return { xp: 25 + Math.floor(Math.random() * 26), jackpot: false };
  if (r < 0.9) return { xp: 75 + Math.floor(Math.random() * 26), jackpot: false };
  if (r < 0.99) return { xp: 150, jackpot: false };
  return { xp: 300, jackpot: true };
}

/**
 * Daily login reward. Auto-opens once per day with a mystery box. Opening
 * it grants a variable XP reward (slot-machine reinforcement), logs today
 * as active (which feeds the streak), and shows a loss-aversion nudge to
 * pull the user back tomorrow.
 */
export function DailyReward() {
  const [today, setToday] = useState("ssr");
  useEffect(() => setToday(todayKey()), []);

  const [lastCheckin, setLastCheckin] = useSyncedState<string | null>(
    "dopamine:last-checkin",
    null
  );
  const [activeDays, setActiveDays] = useSyncedState<Set<string>>(
    "active-days",
    new Set<string>(),
    { serializer: "set" }
  );

  const [phase, setPhase] = useState<Phase>("hidden");
  const [reward, setReward] = useState<{ xp: number; jackpot: boolean } | null>(null);
  const { hit, burst } = useDopamine();

  // Auto-offer once per day, shortly after load.
  useEffect(() => {
    if (today === "ssr") return;
    if (lastCheckin === today) return;
    const t = setTimeout(() => setPhase("offered"), 900);
    return () => clearTimeout(t);
  }, [today, lastCheckin]);

  const streakBefore = useMemo(
    () => computeStreak(Array.from(activeDays), today),
    [activeDays, today]
  );
  // Opening today extends the streak (unless today already counted).
  const newStreak = activeDays.has(today) ? streakBefore : streakBefore + 1;

  const open = () => {
    if (phase !== "offered") return;
    setPhase("revealing");
    const r = rollReward();
    setReward(r);
    setTimeout(() => {
      setPhase("revealed");
      // Log today as active → streak grows.
      setActiveDays((prev) => {
        const next = new Set(prev);
        next.add(today);
        return next;
      });
      setLastCheckin(today);
      // Fire the reward XP + confetti through the dopamine engine.
      burst(window.innerWidth / 2, window.innerHeight / 2.4);
      setTimeout(
        () =>
          hit("quest", {
            amount: r.xp,
            label: r.jackpot ? "JACKPOT" : "Daily reward",
            x: window.innerWidth / 2,
            y: window.innerHeight / 2.4,
          }),
        180
      );
    }, 850);
  };

  const close = () => setPhase("hidden");

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-6 backdrop-blur-md"
          onClick={phase === "revealed" ? close : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="glass-strong relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {phase === "revealed" && (
              <button
                onClick={close}
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">
              Daily reward
            </div>

            {/* The box */}
            <motion.div
              animate={
                phase === "revealing"
                  ? { rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.05, 1.05, 1.05, 1.1] }
                  : phase === "revealed"
                    ? { scale: 0 }
                    : { y: [0, -8, 0] }
              }
              transition={
                phase === "revealing"
                  ? { duration: 0.8 }
                  : phase === "revealed"
                    ? { duration: 0.3 }
                    : { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }
              className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_60px_rgba(251,146,60,0.5)]"
            >
              <Gift className="h-14 w-14 text-white drop-shadow" />
            </motion.div>

            {phase === "offered" && (
              <>
                <h3 className="mt-6 text-2xl font-bold text-white">
                  Your daily reward is ready
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Show up, get paid. Tap to open.
                </p>
                <button
                  onClick={open}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 py-3.5 text-sm font-bold text-black shadow-[0_8px_30px_rgba(251,146,60,0.45)] transition-transform hover:scale-[1.02]"
                >
                  Open my reward
                </button>
              </>
            )}

            {phase === "revealing" && (
              <h3 className="mt-6 text-2xl font-bold text-white">Opening…</h3>
            )}

            {phase === "revealed" && reward && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                  <span className="bg-gradient-to-br from-amber-300 to-orange-500 bg-clip-text text-5xl font-black text-transparent">
                    +{reward.xp}
                  </span>
                  <span className="text-lg font-bold text-amber-300">XP</span>
                </div>
                {reward.jackpot && (
                  <div className="mt-1 text-sm font-black tracking-widest text-amber-300">
                    🎰 JACKPOT
                  </div>
                )}
                <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <span className="text-sm text-white">
                    <b className="tabular">{newStreak}-day</b> streak
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {newStreak >= 2
                    ? `Don't break it now. Come back tomorrow before midnight or your ${newStreak}-day streak resets to zero.`
                    : "Come back tomorrow to start a streak. Miss a day and it's gone."}
                </p>
                <button
                  onClick={close}
                  className="mt-5 w-full rounded-2xl bg-white/[0.06] py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1]"
                >
                  Let's go →
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
