"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Minus, Zap, Flame } from "lucide-react";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import { getTodayPlan } from "@/lib/thirty-day-plan";
import { useDopamine } from "@/components/dopamine/dopamine-provider";

const MILESTONES = [25, 50, 75, 100, 125, 150, 200];

/**
 * The primary action for summer hardcore mode. One giant tappable button that
 * increments today's dial count. Milestones (25, 50, 100, ...) fire celebration
 * XP bursts.
 *
 * Long-pressing the button auto-increments at 4 dials/sec — useful when
 * back-logging a sprint you forgot to log live.
 */
export function CallSprintCounter() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => setToday(todayKey()), []);

  const [count, setCount] = useSyncedState<number>(`calls:${today}`, 0);
  const [milestonesHit, setMilestonesHit] = useSyncedState<Record<string, number[]>>(
    "calls:milestones",
    {}
  );
  const { hit, burst } = useDopamine();

  // Activate a small pulse animation when count changes.
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setPulse((p) => p + 1);
  }, [count]);

  const todayPlan = useMemo(() => getTodayPlan(), []);
  const target = todayPlan?.coldCallTarget ?? 100;
  const isRestDay = target === 0;
  const pct = isRestDay ? 0 : Math.min(100, (count / target) * 100);

  const hitMilestonesToday = milestonesHit[today] ?? [];

  const log = (ev?: React.MouseEvent) => {
    if (isRestDay) return;
    const next = count + 1;
    setCount(next);

    const rect = ev?.currentTarget instanceof HTMLElement
      ? ev.currentTarget.getBoundingClientRect()
      : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    hit("call", {
      amount: 8,
      label: "+1 dial",
      x,
      y,
    });

    // Milestone bursts — big XP + extra confetti.
    const newMilestone = MILESTONES.find(
      (m) => next === m && !hitMilestonesToday.includes(m)
    );
    if (newMilestone) {
      setMilestonesHit((m) => ({
        ...m,
        [today]: [...(m[today] ?? []), newMilestone],
      }));
      setTimeout(() => burst(x, y), 100);
      setTimeout(
        () =>
          hit("review", {
            amount: newMilestone === 100 ? 200 : newMilestone === 50 ? 100 : 50,
            label: `${newMilestone} dials!`,
            x,
            y: y - 40,
          }),
        200
      );
    }
  };

  const undo = () => setCount((c) => Math.max(0, c - 1));

  return (
    <section className="surface-elevated relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/[0.08] via-orange-500/[0.04] to-transparent p-5">
      {/* Animated background pulse on tap */}
      <AnimatePresence>
        <motion.div
          key={pulse}
          initial={{ opacity: 0.4, scale: 0.6 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <div className="h-32 w-32 rounded-full bg-rose-500/30 blur-2xl" />
        </motion.div>
      </AnimatePresence>

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-[0_4px_18px_rgba(244,63,94,0.45)]">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-rose-200/80">
              Cold call sprint · today
            </div>
            <h3 className="text-sm font-semibold text-white">
              {isRestDay ? "Rest day — no dialing" : "Dial. Dial. Dial."}
            </h3>
          </div>
        </div>
        {!isRestDay && (
          <div className="rounded-full border border-white/[0.08] bg-black/30 px-2.5 py-1 text-[10px] font-semibold tabular text-rose-200">
            target: {target}
          </div>
        )}
      </div>

      <div className="relative mt-5 grid grid-cols-[1fr_auto] items-center gap-5">
        <div>
          <div className="flex items-baseline gap-2">
            <motion.div
              key={count}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-6xl font-black tabular text-white drop-shadow-[0_4px_24px_rgba(244,63,94,0.5)]"
            >
              {count}
            </motion.div>
            <div className="text-sm text-slate-400">dials</div>
          </div>
          {!isRestDay && (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 220, damping: 30 }}
                  className="h-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 shadow-[0_0_14px_rgba(244,63,94,0.5)]"
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span>{Math.round(pct)}% of today's target</span>
                <span className="tabular">
                  {Math.max(0, target - count)} to go
                </span>
              </div>
            </>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={(e) => log(e)}
          disabled={isRestDay}
          className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-[0_10px_30px_rgba(244,63,94,0.55)] transition-all hover:shadow-[0_14px_40px_rgba(244,63,94,0.7)] disabled:opacity-40 disabled:shadow-none sm:h-28 sm:w-28"
        >
          <Phone className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={2.5} />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-lg">
            tap = +1
          </div>
        </motion.button>
      </div>

      {!isRestDay && (
        <div className="relative mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {MILESTONES.slice(0, 5).map((m) => {
              const reached = count >= m;
              const claimed = hitMilestonesToday.includes(m);
              return (
                <div
                  key={m}
                  className={`flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold tabular transition-colors ${
                    reached || claimed
                      ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                      : "border-white/[0.05] bg-white/[0.02] text-slate-500"
                  }`}
                >
                  {(reached || claimed) && <Flame className="h-2.5 w-2.5" />}
                  {m}
                </div>
              );
            })}
          </div>
          <button
            onClick={undo}
            disabled={count === 0}
            className="flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] text-slate-300 hover:bg-white/[0.06] disabled:opacity-40"
          >
            <Minus className="h-3 w-3" /> undo
          </button>
        </div>
      )}
    </section>
  );
}
