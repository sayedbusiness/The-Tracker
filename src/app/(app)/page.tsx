"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  CheckCircle2,
  Droplet,
  Footprints,
  Moon,
  Timer,
} from "lucide-react";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { NextUp } from "@/components/dashboard/next-up";
import { DailyQuests } from "@/components/dopamine/daily-quests";
import { SummerGoals } from "@/components/dashboard/summer-goals";
import { CallSprintCounter } from "@/components/dashboard/call-sprint-counter";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { TodayTimeline } from "@/components/dashboard/today-timeline";
import { HabitsGrid } from "@/components/dashboard/habits-grid";
import { DisciplineQuote } from "@/components/dashboard/discipline-quote";
import { WaterTracker } from "@/components/health/water-tracker";
import { todayMetrics, habits } from "@/lib/mock-data";
import { getTodayPlan } from "@/lib/thirty-day-plan";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import type { LoggedMeal } from "@/components/health/meal-composer";

type SavedTask = { id: string; estimated: number; category: string };
interface WeightEntry { date: string; weight: number; }

export default function DashboardPage() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);

  // Pull live data from synced state so every tile reflects what
  // you've actually logged today.
  const [tasksList] = useSyncedState<SavedTask[]>(`tasks:list:${today}`, []);
  const [completedIds] = useSyncedState<Set<string>>(
    `tasks:completed:${today}`,
    new Set<string>(),
    { serializer: "set" }
  );
  const [foodLog] = useSyncedState<LoggedMeal[]>(`health:meals:${today}`, []);
  const [waterCups] = useSyncedState<number>(`water:${today}`, 0);
  const [steps] = useSyncedState<number>(`health:steps:${today}`, 0);
  const [sleepHrs] = useSyncedState<number>(`health:sleep:${today}`, 0);
  const [weightHistory] = useSyncedState<WeightEntry[]>(
    "health:weight:history",
    []
  );

  const tiles = useMemo(() => {
    const focusMinutes = tasksList
      .filter((t) => t.category === "deep-work" && completedIds.has(t.id))
      .reduce((s, t) => s + t.estimated, 0);
    const totals = foodLog.reduce(
      (a, m) => ({
        calories: a.calories + m.calories,
      }),
      { calories: 0 }
    );
    const waterL = waterCups * 0.25;
    const latestWeight =
      weightHistory.length > 0
        ? weightHistory[weightHistory.length - 1].weight
        : todayMetrics.weight;
    const tasksDone = completedIds.size;
    return {
      focusMinutes,
      calories: totals.calories,
      waterL,
      latestWeight,
      tasksDone,
      tasksTotal: tasksList.length,
    };
  }, [tasksList, completedIds, foodLog, waterCups, weightHistory]);

  const m = todayMetrics;
  const [todayPlan, setTodayPlan] = useState<ReturnType<typeof getTodayPlan>>(null);
  useEffect(() => {
    setTodayPlan(getTodayPlan());
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <NextUp />

      <HeroStats />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <CallSprintCounter />
        <SummerGoals />
      </div>

      {/* Live metric strip — only what we can actually measure. */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <MetricTile
          icon={CheckCircle2}
          label="Tasks"
          value={`${tiles.tasksDone}`}
          unit={`/${tiles.tasksTotal || "-"}`}
          progress={
            tiles.tasksTotal === 0 ? 0 : (tiles.tasksDone / tiles.tasksTotal) * 100
          }
          accent="emerald"
        />
        <MetricTile
          icon={Timer}
          label="Focus"
          value={`${tiles.focusMinutes}`}
          unit="min"
          progress={(tiles.focusMinutes / m.focusTarget) * 100}
          accent="violet"
        />
        <MetricTile
          icon={Apple}
          label="Calories"
          value={tiles.calories.toLocaleString()}
          unit={`/${m.caloriesTarget}`}
          progress={(tiles.calories / m.caloriesTarget) * 100}
          accent="rose"
        />
        <MetricTile
          icon={Droplet}
          label="Water"
          value={tiles.waterL.toFixed(1)}
          unit="L"
          progress={(tiles.waterL / m.waterTarget) * 100}
          accent="cyan"
        />
        <MetricTile
          icon={Footprints}
          label="Steps"
          value={steps.toLocaleString()}
          progress={(steps / m.stepsTarget) * 100}
          accent="emerald"
        />
        <MetricTile
          icon={Moon}
          label="Sleep"
          value={sleepHrs}
          unit="hrs"
          progress={(sleepHrs / m.sleepTarget) * 100}
          accent="indigo"
        />
        <MetricTile
          icon={Activity}
          label="Weight"
          value={tiles.latestWeight}
          unit="lb"
          accent="amber"
        />
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="surface-card rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Performance · 7 days
                </h2>
                <p className="text-[10px] text-slate-500">
                  Productivity vs. Discipline — your two highest-correlated metrics
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <Legend color="violet" label="Productivity" />
                <Legend color="cyan" label="Discipline" />
              </div>
            </div>
            <ProductivityChart />
          </div>

          <div className="surface-card rounded-2xl p-6">
            <TodayTimeline plan={todayPlan} />
          </div>

          <DisciplineQuote />
        </div>

        <div className="space-y-6">
          <DailyQuests />

          <WaterTracker />

          <div className="surface-card rounded-2xl p-5">
            <AiInsights />
          </div>

          <div className="surface-card rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Habits · This week</h2>
              <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                {habits.length} active
              </span>
            </div>
            <HabitsGrid />
          </div>
        </div>
      </section>
    </div>
  );
}

function Legend({ color, label }: { color: "violet" | "cyan"; label: string }) {
  const colors = { violet: "bg-blue-400", cyan: "bg-sky-400" };
  return (
    <span className="flex items-center gap-1.5 text-slate-400">
      <span className={`h-1.5 w-1.5 rounded-full ${colors[color]}`} />
      {label}
    </span>
  );
}
