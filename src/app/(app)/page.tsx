"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Apple,
  Brain,
  Droplet,
  Footprints,
  Moon,
  Smile,
  Timer,
} from "lucide-react";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { TodayTimeline } from "@/components/dashboard/today-timeline";
import { HabitsGrid } from "@/components/dashboard/habits-grid";
import { DisciplineQuote } from "@/components/dashboard/discipline-quote";
import { WaterTracker } from "@/components/health/water-tracker";
import { todayMetrics } from "@/lib/mock-data";
import { getTodayPlan } from "@/lib/thirty-day-plan";

export default function DashboardPage() {
  const m = todayMetrics;
  // Defer getTodayPlan to the client; server-side it'd run in UTC and
  // could pick a different calendar day than the user's local time,
  // causing a hydration mismatch that prevents links from attaching.
  const [todayPlan, setTodayPlan] = useState<ReturnType<typeof getTodayPlan>>(null);
  useEffect(() => {
    setTodayPlan(getTodayPlan());
  }, []);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <HeroStats />

      {/* Metric strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <MetricTile
          icon={Timer}
          label="Focus"
          value={`${m.focusMinutes}`}
          unit="min"
          delta={12}
          progress={(m.focusMinutes / m.focusTarget) * 100}
          accent="violet"
        />
        <MetricTile
          icon={Apple}
          label="Calories"
          value={m.calories.toLocaleString()}
          unit={`/${m.caloriesTarget}`}
          delta={-3}
          progress={(m.calories / m.caloriesTarget) * 100}
          accent="rose"
        />
        <MetricTile
          icon={Droplet}
          label="Water"
          value={m.water.toFixed(1)}
          unit="L"
          progress={(m.water / m.waterTarget) * 100}
          accent="cyan"
        />
        <MetricTile
          icon={Footprints}
          label="Steps"
          value={m.steps.toLocaleString()}
          delta={8}
          progress={(m.steps / m.stepsTarget) * 100}
          accent="emerald"
        />
        <MetricTile
          icon={Moon}
          label="Sleep"
          value={m.sleep}
          unit="hrs"
          delta={-5}
          progress={(m.sleep / m.sleepTarget) * 100}
          accent="indigo"
        />
        <MetricTile
          icon={Activity}
          label="Weight"
          value={m.weight}
          unit="lb"
          delta={-1}
          accent="amber"
        />
        <MetricTile
          icon={Smile}
          label="Mood"
          value={`${m.mood}/10`}
          delta={14}
          progress={m.mood * 10}
          accent="violet"
        />
        <MetricTile
          icon={Brain}
          label="Energy"
          value={`${m.energy}/10`}
          delta={20}
          progress={m.energy * 10}
          accent="cyan"
        />
      </section>

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Productivity chart */}
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

          {/* Today's hour-by-hour timeline */}
          <div className="surface-card rounded-2xl p-6">
            <TodayTimeline plan={todayPlan} />
          </div>

          {/* Quote */}
          <DisciplineQuote />
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <WaterTracker />

          <div className="surface-card rounded-2xl p-5">
            <AiInsights />
          </div>

          <div className="surface-card rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Habits · This week</h2>
              <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                6 active
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
