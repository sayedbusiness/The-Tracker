"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Camera,
  Plus,
  Droplet,
  Moon,
  Footprints,
  Apple,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RingProgress } from "@/components/ui/progress";
import { PhotoMealScanner } from "@/components/health/photo-meal-scanner";
import { foodLog, todayMetrics } from "@/lib/mock-data";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from "recharts";

const macroTargets = {
  protein: 220,
  carbs: 280,
  fat: 75,
};

const totals = foodLog.reduce(
  (acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }),
  { calories: 0, protein: 0, carbs: 0, fat: 0 }
);

const weightData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  weight: 184 - i * 0.18 + Math.sin(i * 0.4) * 0.6,
}));

const sleepData = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  hours: 6 + Math.random() * 2.5,
  deep: 1.2 + Math.random() * 0.8,
}));

const workouts = [
  { day: "Mon", type: "Push", duration: 64, intensity: 92 },
  { day: "Tue", type: "Run · 5k", duration: 28, intensity: 78 },
  { day: "Wed", type: "Pull", duration: 71, intensity: 88 },
  { day: "Thu", type: "Rest", duration: 0, intensity: 0 },
  { day: "Fri", type: "Legs", duration: 82, intensity: 95 },
  { day: "Sat", type: "Run · 8k", duration: 41, intensity: 84 },
  { day: "Sun", type: "Mobility", duration: 35, intensity: 45 },
];

export default function HealthPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Health & Performance"
        title={
          <>
            Your body is the <span className="gradient-violet">vehicle.</span>
          </>
        }
        subtitle="Track meals with a photo, log workouts, monitor sleep and recovery. The AI cross-correlates everything against your productivity score."
        icon={Heart}
        accent="rose"
        actions={
          <>
            <Button variant="secondary">
              <Plus className="h-4 w-4" /> Log meal
            </Button>
            <PhotoMealScanner />
          </>
        }
      />

      {/* Macros + Calories hero */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-elevated relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="relative grid gap-6 sm:grid-cols-[auto_1fr]">
            <RingProgress
              value={(totals.calories / todayMetrics.caloriesTarget) * 100}
              size={160}
              stroke={12}
              label="KCAL"
              color="rose"
            />
            <div className="flex flex-col justify-center gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300/80">
                  Today's fuel
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tabular text-white">
                    {totals.calories.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400">
                    / {todayMetrics.caloriesTarget.toLocaleString()} kcal
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {todayMetrics.caloriesTarget - totals.calories} kcal remaining ·
                  on track
                </div>
              </div>
              <div className="space-y-2">
                <MacroBar
                  label="Protein"
                  value={totals.protein}
                  target={macroTargets.protein}
                  color="from-emerald-500 to-emerald-400"
                />
                <MacroBar
                  label="Carbs"
                  value={totals.carbs}
                  target={macroTargets.carbs}
                  color="from-amber-500 to-amber-400"
                />
                <MacroBar
                  label="Fat"
                  value={totals.fat}
                  target={macroTargets.fat}
                  color="from-violet-500 to-violet-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick log + Photo CTA */}
        <motion.div
          whileHover={{ y: -2 }}
          className="surface-elevated relative overflow-hidden rounded-3xl p-6"
        >
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Photo meal scan
                </div>
                <div className="text-[10px] text-slate-500">
                  Gemini 2.5 · multimodal vision
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Snap a picture of your plate. The AI identifies ingredients,
              estimates portion size, and logs macros in under 3 seconds.
            </p>
            <div className="mt-auto pt-4">
              <PhotoMealScanner />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Vitals grid */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <VitalCard
          icon={Droplet}
          label="Water"
          value={`${todayMetrics.water} L`}
          progress={(todayMetrics.water / todayMetrics.waterTarget) * 100}
          accent="cyan"
        />
        <VitalCard
          icon={Footprints}
          label="Steps"
          value={todayMetrics.steps.toLocaleString()}
          progress={(todayMetrics.steps / todayMetrics.stepsTarget) * 100}
          accent="emerald"
        />
        <VitalCard
          icon={Moon}
          label="Sleep"
          value={`${todayMetrics.sleep} hrs`}
          progress={(todayMetrics.sleep / todayMetrics.sleepTarget) * 100}
          accent="indigo"
        />
        <VitalCard
          icon={Heart}
          label="Resting HR"
          value="54 bpm"
          progress={88}
          sub="elite range"
          accent="rose"
        />
      </section>

      {/* Meal log */}
      <section className="surface-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Today's meals</h2>
            <p className="text-[10px] text-slate-500">{foodLog.length} logged</p>
          </div>
          <Button variant="secondary" size="sm">
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {foodLog.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-base">
                {meal.meal === "Breakfast" ? "🍳" : meal.meal === "Lunch" ? "🥗" : "🥤"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="rose">{meal.meal}</Badge>
                  <span className="text-[11px] tabular text-slate-500">{meal.time}</span>
                </div>
                <div className="mt-1 truncate text-sm text-white">{meal.name}</div>
              </div>
              <div className="hidden gap-3 text-[10px] sm:flex">
                <Stat label="P" value={meal.protein} color="text-emerald-300" />
                <Stat label="C" value={meal.carbs} color="text-amber-300" />
                <Stat label="F" value={meal.fat} color="text-violet-300" />
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold tabular text-white">
                  {meal.calories}
                </div>
                <div className="text-[10px] text-slate-500">kcal</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Charts grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Weight trend */}
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Body weight</h3>
              <p className="text-[10px] text-slate-500">30-day trend</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="font-semibold tabular text-emerald-300">-5.4 lb</span>
            </div>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="g-weight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,28,0.9)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#g-weight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular text-white">178.4</span>
            <span className="text-xs text-slate-500">lb · target 175</span>
          </div>
        </div>

        {/* Sleep */}
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Sleep · 14 days</h3>
              <p className="text-[10px] text-slate-500">Avg 7.2 hrs · deep 1.7 hrs</p>
            </div>
            <Badge variant="indigo">7.4 LAST NIGHT</Badge>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData}>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,28,0.9)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {sleepData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.hours >= 7 ? "#6366f1" : "#f43f5e"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workouts */}
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Workouts · week</h3>
              <p className="text-[10px] text-slate-500">5 of 6 target · 281 min</p>
            </div>
            <Dumbbell className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="space-y-2">
            {workouts.map((w) => (
              <div key={w.day} className="flex items-center gap-2 text-xs">
                <span className="w-9 text-slate-500">{w.day}</span>
                <span className="w-20 text-slate-300">{w.type}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${w.intensity}%` }}
                  />
                </div>
                <span className="w-10 text-right tabular text-slate-400">
                  {w.duration}m
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="tabular text-slate-500">
          <b className="text-white">{value}g</b> / {target}g
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / target) * 100)}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}

function VitalCard({
  icon: Icon,
  label,
  value,
  progress,
  sub,
  accent,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  progress: number;
  sub?: string;
  accent: "cyan" | "emerald" | "indigo" | "rose";
}) {
  const colors = {
    cyan: "from-cyan-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    indigo: "from-indigo-500 to-violet-500",
    rose: "from-rose-500 to-pink-500",
  };
  return (
    <div className="surface-card rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <div
          className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${colors[accent]}`}
        >
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tabular text-white">{value}</div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={`h-full bg-gradient-to-r ${colors[accent]}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {sub && <div className="mt-1.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-bold tabular ${color}`}>{value}g</span>
      <span className="text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}
