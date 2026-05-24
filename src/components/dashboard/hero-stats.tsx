"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Flame, Sparkles, Target, Zap } from "lucide-react";
import { RingProgress } from "@/components/ui/progress";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import type { LoggedMeal } from "@/components/health/meal-composer";

type SavedTask = {
  id: string;
  category: string;
};

interface Challenge {
  id: string;
  active: boolean;
  progress: number;
  total: number;
}

interface Breach {
  loggedAt: number;
}

interface Client {
  mrr: number;
}

interface Deal {
  value: number;
}

/**
 * Live hero stats — pulls from every synced source so the numbers
 * across the top update the moment any tab logs anything.
 */
export function HeroStats() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);

  const [tasksList] = useSyncedState<SavedTask[]>(`tasks:list:${today}`, []);
  const [completedIds] = useSyncedState<Set<string>>(
    `tasks:completed:${today}`,
    new Set<string>(),
    { serializer: "set" }
  );
  const [foodLog] = useSyncedState<LoggedMeal[]>(`health:meals:${today}`, []);
  const [waterCups] = useSyncedState<number>(`water:${today}`, 0);
  const [challenges] = useSyncedState<Challenge[]>(
    "discipline:challenges",
    []
  );
  const [breaches] = useSyncedState<Breach[]>("discipline:breaches", []);
  const [clients] = useSyncedState<Client[]>("agency:clients", []);
  const [pipeline] = useSyncedState<Deal[]>("agency:pipeline", []);
  const [activeDays] = useSyncedState<Set<string>>(
    "active-days",
    new Set<string>(),
    { serializer: "set" }
  );

  const stats = useMemo(() => {
    const tasksDone = completedIds.size;
    const tasksTotal = tasksList.length;
    const completionPct =
      tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);

    // Active challenges progress avg, dampened by recent breaches.
    const active = challenges.filter((c) => c.active);
    const challengeAvg =
      active.length === 0
        ? 0
        : active.reduce(
            (s, c) => s + Math.min(1, c.progress / Math.max(1, c.total)),
            0
          ) / active.length;
    const recentBreaches = breaches.filter(
      (b) => Date.now() - b.loggedAt < 7 * 24 * 3600 * 1000
    ).length;
    const discipline = Math.max(
      0,
      Math.round(challengeAvg * 100 - recentBreaches * 8)
    );

    // Focus = % deep-work tasks done today.
    const deepTotal = tasksList.filter((t) => t.category === "deep-work").length;
    const deepDone = tasksList.filter(
      (t) => t.category === "deep-work" && completedIds.has(t.id)
    ).length;
    const focus = deepTotal === 0 ? 0 : Math.round((deepDone / deepTotal) * 100);

    // Agency = log-ish score from MRR + pipeline.
    const mrr = clients.reduce((s, c) => s + c.mrr, 0);
    const pipeValue = pipeline.reduce((s, d) => s + d.value, 0);
    const agency = Math.min(
      100,
      Math.round((mrr / 100) + (pipeValue / 500))
    );

    // Streak — derive from activeDays (last consecutive run ending today/yesterday).
    const days = Array.from(activeDays).sort();
    let streak = 0;
    if (days.length > 0) {
      const dayMs = 24 * 3600 * 1000;
      const asDate = (s: string) => new Date(`${s}T12:00:00Z`).getTime();
      const last = days[days.length - 1];
      const gap = (asDate(today) - asDate(last)) / dayMs;
      if (gap <= 1) {
        streak = 1;
        for (let i = days.length - 2; i >= 0; i--) {
          if (asDate(days[i + 1]) - asDate(days[i]) === dayMs) streak++;
          else break;
        }
      }
    }

    return {
      tasksDone,
      tasksTotal,
      completionPct,
      discipline,
      focus,
      agency,
      streak,
      meals: foodLog.length,
      water: waterCups,
    };
  }, [
    tasksList,
    completedIds,
    foodLog,
    waterCups,
    challenges,
    breaches,
    clients,
    pipeline,
    activeDays,
    today,
  ]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-blue-600/[0.08] via-blue-600/[0.04] to-sky-500/[0.06] p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-blue-300/80">
            {stats.streak === 0
              ? "Day 1 · everything starts now"
              : `Day ${stats.streak} of the streak · keep it alive`}
          </div>
          <h1 className="text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">Become</span> the version of you
            <br />
            tomorrow won't catch up to.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            {stats.tasksTotal === 0
              ? "Clean slate. Add your first task, log your first meal, drink your first cup. The AI starts learning your patterns the moment you do."
              : `${stats.tasksDone} of ${stats.tasksTotal} tasks done. ${stats.meals} meals logged. ${stats.water} cups of water. Keep shipping.`}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Pill
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Streak"
              value={`${stats.streak}d`}
              accent="amber"
            />
            <Pill
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Discipline"
              value={`${stats.discipline}`}
              accent="violet"
            />
            <Pill
              icon={<Target className="h-3.5 w-3.5" />}
              label="Focus"
              value={`${stats.focus}`}
              accent="cyan"
            />
            <Pill
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Agency"
              value={`${stats.agency}`}
              accent="emerald"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <RingProgress
            value={stats.discipline}
            size={180}
            stroke={10}
            label="DISCIPLINE"
            color="violet"
          />
          {stats.completionPct > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs">
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              <span className="font-semibold text-emerald-300">
                {stats.completionPct}% today
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function Pill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "amber" | "violet" | "cyan" | "emerald";
}) {
  const accents = {
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    violet: "text-blue-300 bg-blue-600/10 border-blue-600/20",
    cyan: "text-sky-300 bg-sky-500/10 border-sky-500/20",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className={`grid h-7 w-7 place-items-center rounded-lg border ${accents[accent]}`}>
          {icon}
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            {label}
          </div>
          <div className="text-base font-semibold tabular text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}
