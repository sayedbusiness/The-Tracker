"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Sparkles } from "lucide-react";
import { questsForDate } from "@/lib/dopamine";
import { useSyncedState } from "@/hooks/use-synced-state";
import { useDopamine } from "./dopamine-provider";

/** Returns the local-time YYYY-MM-DD string. */
function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * Three daily quests, deterministic by date. Tap to complete → XP + confetti +
 * the row crosses out. When all 3 are done, a "Perfect day" bonus fires.
 */
export function DailyQuests() {
  const dateKey = todayKey();
  const quests = useMemo(() => questsForDate(dateKey), [dateKey]);
  const [done, setDone] = useSyncedState<Record<string, string[]>>(
    "dopamine:quests-done",
    {}
  );
  const [bonusFiredOn, setBonusFiredOn] = useSyncedState<string | null>(
    "dopamine:quests-perfect",
    null
  );
  const { hit, burst } = useDopamine();

  const todaysDone = done[dateKey] ?? [];
  const allDone = quests.every((q) => todaysDone.includes(q.id));

  const toggle = (questId: string, xp: number, ev: React.MouseEvent) => {
    const isDone = todaysDone.includes(questId);
    if (isDone) {
      // Allow uncomplete (no XP withdrawal — XP only goes up).
      setDone((d) => ({
        ...d,
        [dateKey]: (d[dateKey] ?? []).filter((id) => id !== questId),
      }));
      return;
    }
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    hit("quest", {
      amount: xp,
      label: "Daily quest",
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setDone((d) => ({
      ...d,
      [dateKey]: [...(d[dateKey] ?? []), questId],
    }));

    // Perfect day bonus.
    const nextDone = [...todaysDone, questId];
    const willBePerfect = quests.every((q) => nextDone.includes(q.id));
    if (willBePerfect && bonusFiredOn !== dateKey) {
      setTimeout(() => {
        burst(window.innerWidth / 2, window.innerHeight / 3);
        setTimeout(
          () =>
            hit("review", {
              amount: 150,
              label: "Perfect day bonus",
              x: window.innerWidth / 2,
              y: window.innerHeight / 3,
            }),
          200
        );
      }, 400);
      setBonusFiredOn(dateKey);
    }
  };

  const completedCount = todaysDone.filter((id) =>
    quests.some((q) => q.id === id)
  ).length;

  return (
    <section className="surface-elevated relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] via-orange-500/[0.04] to-transparent p-5">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_4px_16px_rgba(251,146,60,0.4)]">
            <Crown className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
              Daily quests
            </div>
            <h3 className="text-sm font-semibold text-white">
              {allDone ? "Perfect day. Bonus claimed." : "Today's 3 missions"}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-2.5 py-1 text-xs font-semibold tabular text-amber-200">
          {completedCount}/{quests.length}
        </div>
      </div>

      <ul className="relative mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {quests.map((q) => {
            const isDone = todaysDone.includes(q.id);
            return (
              <motion.li
                key={q.id}
                layout
                initial={false}
                animate={{ opacity: isDone ? 0.55 : 1 }}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  isDone
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-amber-500/30 hover:bg-amber-500/[0.07]"
                }`}
              >
                <button
                  onClick={(e) => toggle(q.id, q.xp, e)}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all ${
                    isDone
                      ? "border-emerald-400/60 bg-emerald-500/20"
                      : "border-white/15 bg-white/[0.04] group-hover:border-amber-400/60"
                  }`}
                  aria-label={isDone ? "Mark as not done" : "Complete quest"}
                >
                  {isDone && <Check className="h-3.5 w-3.5 text-emerald-300" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium ${
                      isDone ? "text-slate-400 line-through" : "text-white"
                    }`}
                  >
                    {q.title}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-slate-500">
                    {q.hint}
                  </div>
                </div>
                <div
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-amber-500/15 text-amber-200"
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5" />+{q.xp} XP
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-3 rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-orange-500/10 px-3 py-2 text-center text-xs font-bold text-amber-200"
        >
          ✨ +150 XP bonus claimed — show up like this every day.
        </motion.div>
      )}
    </section>
  );
}
