"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { habits } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey, dateKey, APP_TZ } from "@/lib/dates";
import { useDopamine } from "@/components/dopamine/dopamine-provider";

const colorMap = {
  emerald: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30 text-emerald-300",
  indigo: "from-blue-600/20 to-blue-600/0 border-blue-600/30 text-blue-300",
  violet: "from-blue-600/20 to-blue-600/0 border-blue-600/30 text-blue-300",
  cyan: "from-sky-500/20 to-sky-500/0 border-sky-500/30 text-sky-300",
  rose: "from-rose-500/20 to-rose-500/0 border-rose-500/30 text-rose-300",
  amber: "from-amber-500/20 to-amber-500/0 border-amber-500/30 text-amber-300",
};

/** Monday-anchored week key in Pacific time so habits roll on Monday morning PT. */
function getWeekKey(): string {
  const today = dateKey(new Date());
  const d = new Date(today + "T12:00:00Z");
  const weekdayShort = d.toLocaleString("en-US", {
    timeZone: APP_TZ,
    weekday: "short",
  });
  // Mon=1, Tue=2, ..., Sun=0
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const jsDay = map[weekdayShort] ?? 1;
  // 0=Sun → 6 days back to Mon; 1=Mon → 0 back; ...
  const offset = jsDay === 0 ? 6 : jsDay - 1;
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

export function HabitsGrid() {
  const [keys, setKeys] = useState<{ weekKey: string; today: string }>({
    weekKey: "ssr-week",
    today: "ssr-day",
  });
  useEffect(() => {
    setKeys({ weekKey: getWeekKey(), today: todayKey() });
  }, []);

  const [done, setDone] = useSyncedState<Set<string>>(
    `habits:${keys.weekKey}`,
    new Set<string>(),
    { serializer: "set" }
  );

  // When a habit is toggled today, also mark today as "active" so the
  // streak / achievements pages reflect it.
  const [activeDays, setActiveDays] = useSyncedState<Set<string>>(
    "active-days",
    new Set<string>(),
    { serializer: "set" }
  );

  const { hit } = useDopamine();

  const toggleToday = (habitId: string, ev?: React.MouseEvent) => {
    const key = `${habitId}@${keys.today}`;
    const wasDone = done.has(key);
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (keys.today !== "ssr-day" && !activeDays.has(keys.today)) {
      setActiveDays((prev) => {
        const next = new Set(prev);
        next.add(keys.today);
        return next;
      });
    }
    // XP only fires on completion, not un-completion. No regret tax.
    if (!wasDone && ev) {
      const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
      const habit = habits.find((h) => h.id === habitId);
      hit("habit", {
        label: habit?.name ?? "Habit",
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const countDoneThisWeek = (habitId: string) => {
    let n = 0;
    done.forEach((k) => {
      if (k.startsWith(`${habitId}@`)) n++;
    });
    return n;
  };

  const isDoneToday = (habitId: string) => done.has(`${habitId}@${keys.today}`);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {habits.map((habit, i) => {
        const checked = isDoneToday(habit.id);
        const weekCount = countDoneThisWeek(habit.id);
        return (
          <motion.button
            key={habit.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            onClick={(e) => toggleToday(habit.id, e)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3 text-left transition-all",
              colorMap[habit.color as keyof typeof colorMap],
              checked && "ring-1 ring-current"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="text-2xl">{habit.icon}</div>
              <div className="flex items-center gap-1">
                {checked && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-current/20">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs font-semibold text-white">{habit.name}</div>
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: habit.target }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i < weekCount ? "bg-current" : "bg-white/[0.06]"
                  )}
                />
              ))}
            </div>
            <div className="mt-1.5 text-[9px] uppercase tracking-wider opacity-60">
              {weekCount}/{habit.target} this week
              {checked && " · done today"}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
