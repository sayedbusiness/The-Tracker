"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Camera,
  Plus,
  Droplet,
  Moon,
  Footprints,
  Dumbbell,
  Trash2,
} from "lucide-react";
import { WaterTracker } from "@/components/health/water-tracker";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RingProgress } from "@/components/ui/progress";
import { PhotoMealScanner } from "@/components/health/photo-meal-scanner";
import { MealComposer, type LoggedMeal } from "@/components/health/meal-composer";
import { todayMetrics } from "@/lib/mock-data";
import { useSyncedState } from "@/hooks/use-synced-state";
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
  protein: 200,
  carbs: 200,
  fat: 65,
};

// 30-day starting weight series — single point at 167 lb until logged.
const weightData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  weight: i === 29 ? 167 : null,
}));

const sleepData = Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  hours: 0,
  deep: 0,
}));

const workouts = [
  { day: "Mon", type: "—", duration: 0, intensity: 0 },
  { day: "Tue", type: "—", duration: 0, intensity: 0 },
  { day: "Wed", type: "—", duration: 0, intensity: 0 },
  { day: "Thu", type: "—", duration: 0, intensity: 0 },
  { day: "Fri", type: "—", duration: 0, intensity: 0 },
  { day: "Sat", type: "—", duration: 0, intensity: 0 },
  { day: "Sun", type: "—", duration: 0, intensity: 0 },
];

const MEAL_EMOJI: Record<string, string> = {
  Breakfast: "🍳",
  Lunch: "🥗",
  Dinner: "🍽️",
  Snack: "🥜",
  Drink: "🥤",
};

export default function HealthPage() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const [foodLog, setFoodLog] = useSyncedState<LoggedMeal[]>(
    `health:meals:${today}`,
    []
  );

  const [composerOpen, setComposerOpen] = useState(false);

  const totals = useMemo(
    () =>
      foodLog.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [foodLog]
  );

  const addMeal = (meal: LoggedMeal) => {
    setFoodLog((prev) => [meal, ...prev]);
  };

  const removeMeal = (id: string) => {
    setFoodLog((prev) => prev.filter((m) => m.id !== id));
  };

  // Photo scanner returns a MealAnalysis — translate to LoggedMeal.
  const onPhotoLogged = (m: {
    name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
  }) => {
    const cap = (s: string) =>
      (s.charAt(0).toUpperCase() + s.slice(1)) as LoggedMeal["meal"];
    addMeal({
      id: `m-${Date.now()}`,
      meal: cap(m.meal_type),
      name: m.name,
      calories: m.calories,
      protein: m.protein_g,
      carbs: m.carbs_g,
      fat: m.fat_g,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      loggedAt: Date.now(),
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Health & Performance"
        title={
          <>
            Your body is the <span className="gradient-electric">vehicle.</span>
          </>
        }
        subtitle="Track meals with a photo, scan a barcode, type ingredients with how much you ate, or log manually. The AI cross-correlates everything against your productivity score."
        icon={Heart}
        accent="rose"
        actions={
          <>
            <Button variant="secondary" onClick={() => setComposerOpen(true)}>
              <Plus className="h-4 w-4" /> Log meal
            </Button>
            <PhotoMealScanner onLogged={onPhotoLogged} />
          </>
        }
      />

      <MealComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSave={addMeal}
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
                  {totals.calories === 0
                    ? `${todayMetrics.caloriesTarget} kcal · cutting · 200g protein floor`
                    : totals.calories > todayMetrics.caloriesTarget
                      ? `+${totals.calories - todayMetrics.caloriesTarget} kcal over · breaks the cut`
                      : `${todayMetrics.caloriesTarget - totals.calories} kcal left · stay in deficit`}
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
                  color="from-blue-600 to-blue-400"
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
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Three ways to log
                </div>
                <div className="text-[10px] text-slate-500">
                  Photo · barcode/ingredients · manual
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              <b>Photo:</b> snap your plate, Gemini estimates portions.<br />
              <b>Barcode/ingredients:</b> paste the back of the package + how much you ate.<br />
              <b>Manual:</b> type the macros directly when you know them.
            </p>
            <div className="mt-auto flex gap-2 pt-4">
              <PhotoMealScanner onLogged={onPhotoLogged} />
              <Button variant="secondary" onClick={() => setComposerOpen(true)}>
                <Plus className="h-4 w-4" /> Type or scan
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <WaterTracker />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <VitalCard
          icon={Droplet}
          label="Water target"
          value={`${todayMetrics.waterTarget} L`}
          progress={0}
          sub="cutting target"
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

      <section className="surface-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Today's meals</h2>
            <p className="text-[10px] text-slate-500">{foodLog.length} logged</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setComposerOpen(true)}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
        {foodLog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
            <div className="text-3xl">🍳</div>
            <div className="mt-2 text-sm font-medium text-white">
              Log your first meal
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Tap "Scan photo" above, or use "Log meal" to type macros / paste a barcode.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {foodLog.map((meal, i) => (
                <motion.div
                  key={meal.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.04 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-base">
                    {MEAL_EMOJI[meal.meal] ?? "🍽️"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="rose">{meal.meal}</Badge>
                      <span className="text-[11px] tabular text-slate-500">
                        {meal.time}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-sm text-white">
                      {meal.name}
                    </div>
                  </div>
                  <div className="hidden gap-3 text-[10px] sm:flex">
                    <Stat label="P" value={meal.protein} color="text-emerald-300" />
                    <Stat label="C" value={meal.carbs} color="text-amber-300" />
                    <Stat label="F" value={meal.fat} color="text-blue-300" />
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular text-white">
                      {meal.calories}
                    </div>
                    <div className="text-[10px] text-slate-500">kcal</div>
                  </div>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    aria-label="Remove"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Body weight</h3>
              <p className="text-[10px] text-slate-500">30-day trend</p>
            </div>
            <Badge variant="cyan">DAY 1</Badge>
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
            <span className="text-2xl font-semibold tabular text-white">167</span>
            <span className="text-xs text-slate-500">lb · goal: lean & muscular</span>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Sleep · 14 days</h3>
              <p className="text-[10px] text-slate-500">No sleep logged yet</p>
            </div>
            <Badge variant="indigo">LOG TONIGHT</Badge>
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

        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Workouts · week</h3>
              <p className="text-[10px] text-slate-500">0 of 6 target this week</p>
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
          initial={false}
          animate={{ width: `${Math.min(100, (value / target) * 100)}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
    cyan: "from-sky-500 to-blue-500",
    emerald: "from-emerald-500 to-teal-500",
    indigo: "from-blue-600 to-blue-600",
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

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-sm font-bold tabular ${color}`}>{value}g</span>
      <span className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}
