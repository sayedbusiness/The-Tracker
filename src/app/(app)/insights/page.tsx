"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart as LineChartIcon,
  Brain,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthlyTrend, todayMetrics } from "@/lib/mock-data";
import { useSyncedState } from "@/hooks/use-synced-state";
import type { Task } from "@/lib/mock-data";
import type { LoggedMeal } from "@/components/health/meal-composer";
import { todayKey } from "@/lib/dates";

type SavedTask = Omit<Task, "completed">;

interface Challenge {
  id: string;
  name: string;
  target: string;
  total: number;
  reward: string;
  progress: number;
  active: boolean;
}

interface Breach {
  id: string;
  label: string;
  cost: string;
  severity: "low" | "warn" | "high";
  loggedAt: number;
}

interface Deal {
  id: string;
  value: number;
  stage: string;
  probability: number;
}

interface Client {
  id: string;
  mrr: number;
}

export default function InsightsPage() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);

  // Pull live state from all the places the user has been working.
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
  const [pipeline] = useSyncedState<Deal[]>("agency:pipeline", []);
  const [clients] = useSyncedState<Client[]>("agency:clients", []);
  const [completedLearn] = useSyncedState<Set<string>>(
    "learn:completed",
    new Set<string>(),
    { serializer: "set" }
  );

  const meals = useMemo(
    () =>
      foodLog.reduce(
        (a, m) => ({
          calories: a.calories + m.calories,
          protein: a.protein + m.protein,
        }),
        { calories: 0, protein: 0 }
      ),
    [foodLog]
  );

  const scores = useMemo(() => {
    // Productivity = completion % of today's tasks
    const productivity =
      tasksList.length === 0
        ? 0
        : Math.round((completedIds.size / tasksList.length) * 100);

    // Health = (protein hit% + water hit% + calorie band hit%) / 3
    const proteinPct = Math.min(
      100,
      (meals.protein / todayMetrics.proteinTarget) * 100
    );
    const waterPct = Math.min(100, (waterCups / 12) * 100);
    const inBand =
      meals.calories === 0
        ? 0
        : meals.calories <= todayMetrics.caloriesTarget * 1.05
          ? 100
          : Math.max(0, 100 - (meals.calories - todayMetrics.caloriesTarget) / 5);
    const health = Math.round((proteinPct + waterPct + inBand) / 3);

    // Discipline = active challenges progress avg, minus recent breaches
    const activeChallenges = challenges.filter((c) => c.active);
    const challengeAvg =
      activeChallenges.length === 0
        ? 0
        : activeChallenges.reduce(
            (s, c) => s + Math.min(1, c.progress / c.total),
            0
          ) / activeChallenges.length;
    const recentBreaches = breaches.filter(
      (b) => Date.now() - b.loggedAt < 7 * 24 * 3600 * 1000
    ).length;
    const discipline = Math.max(
      0,
      Math.round(challengeAvg * 100 - recentBreaches * 8)
    );

    // Focus = % of deep-work tasks completed today
    const deepTotal = tasksList.filter((t) => t.category === "deep-work").length;
    const deepDone = tasksList.filter(
      (t) => t.category === "deep-work" && completedIds.has(t.id)
    ).length;
    const focus =
      deepTotal === 0 ? 0 : Math.round((deepDone / deepTotal) * 100);

    // Learning = % of catalog touched (cap at 100)
    const learning = Math.min(100, completedLearn.size * 5);

    // Business = log10-ish scaling on MRR + pipeline value
    const mrr = clients.reduce((s, c) => s + c.mrr, 0);
    const pipeValue = pipeline.reduce((s, d) => s + d.value, 0);
    const business = Math.min(
      100,
      Math.round((mrr / 100) + (pipeValue / 500))
    );

    return { productivity, health, discipline, focus, learning, business };
  }, [
    tasksList,
    completedIds,
    meals,
    waterCups,
    challenges,
    breaches,
    completedLearn,
    clients,
    pipeline,
  ]);

  const radarData = [
    { subject: "Discipline", you: scores.discipline },
    { subject: "Focus", you: scores.focus },
    { subject: "Health", you: scores.health },
    { subject: "Productivity", you: scores.productivity },
    { subject: "Learning", you: scores.learning },
    { subject: "Business", you: scores.business },
  ];

  const lifeScore = Math.round(
    (scores.discipline +
      scores.focus +
      scores.health +
      scores.productivity +
      scores.learning +
      scores.business) /
      6
  );

  // Live AI insights derived from the actual data
  const liveInsights = useMemo(() => {
    const out: Array<{
      id: string;
      type: "win" | "warning" | "pattern" | "challenge";
      title: string;
      body: string;
      icon: string;
      confidence: number;
    }> = [];

    if (tasksList.length === 0) {
      out.push({
        id: "no-tasks",
        type: "challenge",
        title: "No tasks logged today",
        body: "Open Tasks and add 3: one P0, one health, one deep-work. Until then I can't read your execution.",
        icon: "📝",
        confidence: 1,
      });
    } else if (scores.productivity >= 80) {
      out.push({
        id: "high-productivity",
        type: "win",
        title: `${scores.productivity}% of today's tasks done`,
        body: "Strong execution. Lock this rhythm by closing the last few before sunset.",
        icon: "🚀",
        confidence: 0.95,
      });
    } else if (scores.productivity < 30 && tasksList.length > 0) {
      out.push({
        id: "low-productivity",
        type: "warning",
        title: "Execution lagging",
        body: `Only ${completedIds.size}/${tasksList.length} done. Pick the smallest task and ship it now to break the freeze.`,
        icon: "⚠️",
        confidence: 0.9,
      });
    }

    if (foodLog.length === 0) {
      out.push({
        id: "no-meals",
        type: "challenge",
        title: "No meals logged today",
        body: `Cutting target is ${todayMetrics.caloriesTarget} kcal with ${todayMetrics.proteinTarget}g protein. Open Health → Scan or type your first meal.`,
        icon: "🍽️",
        confidence: 1,
      });
    } else if (meals.protein < todayMetrics.proteinTarget * 0.5) {
      out.push({
        id: "low-protein",
        type: "warning",
        title: "Protein behind pace",
        body: `${meals.protein}g logged · target ${todayMetrics.proteinTarget}g. Add a shake or chicken now — preserve muscle in the cut.`,
        icon: "💪",
        confidence: 0.9,
      });
    } else if (meals.protein >= todayMetrics.proteinTarget) {
      out.push({
        id: "protein-hit",
        type: "win",
        title: "Protein target hit",
        body: `${meals.protein}g logged. Muscle preserved. Now stay under ${todayMetrics.caloriesTarget} kcal.`,
        icon: "✅",
        confidence: 0.95,
      });
    }

    if (waterCups < 4) {
      out.push({
        id: "low-water",
        type: "challenge",
        title: `Water at ${(waterCups * 0.25).toFixed(1)} L`,
        body: "Target 3 L. Tap a cup on the dashboard every time you drink — invisible until you're behind.",
        icon: "💧",
        confidence: 1,
      });
    }

    const activeChallengeCount = challenges.filter((c) => c.active).length;
    if (activeChallengeCount === 0) {
      out.push({
        id: "no-challenges",
        type: "challenge",
        title: "No challenges active",
        body: "Open Discipline → Activate the Morning Operator challenge. Identity-level habits build first.",
        icon: "🔥",
        confidence: 1,
      });
    } else {
      out.push({
        id: "challenges",
        type: "pattern",
        title: `${activeChallengeCount} challenge${activeChallengeCount > 1 ? "s" : ""} active`,
        body: "Every progress tick raises your discipline score. Tap + on the discipline page after each rep.",
        icon: "🛡️",
        confidence: 0.92,
      });
    }

    if (breaches.length === 0) {
      out.push({
        id: "no-breaches",
        type: "win",
        title: "Clean record",
        body: "No breaches logged. Stay honest — the score is only as real as your logging.",
        icon: "🧘",
        confidence: 0.85,
      });
    }

    if (clients.length === 0 && pipeline.length === 0) {
      out.push({
        id: "no-revenue",
        type: "challenge",
        title: "No deals or clients yet",
        body: "Agency board is empty. Add your first cold call follow-up as a Lead — turns activity into a pipeline number.",
        icon: "💼",
        confidence: 1,
      });
    } else if (pipeline.length > 0) {
      const pipeValue = pipeline.reduce((s, d) => s + d.value, 0);
      out.push({
        id: "pipe",
        type: "pattern",
        title: `Pipeline at $${pipeValue.toLocaleString()}`,
        body: `${pipeline.length} deal${pipeline.length > 1 ? "s" : ""} live. Advance one stage today to keep the weighted number trending up.`,
        icon: "📈",
        confidence: 0.9,
      });
    }

    return out.slice(0, 6);
  }, [
    tasksList,
    completedIds,
    scores,
    foodLog,
    meals,
    waterCups,
    challenges,
    breaches,
    clients,
    pipeline,
  ]);

  const memories = useMemo(() => {
    const items: { time: string; text: string }[] = [
      {
        time: "Day 1",
        text: "Sayed started APEX OS. Goal: lean and muscular. Starting weight: 172 lb. Cycle: May 25 → July 23.",
      },
    ];
    if (tasksList.length > 0) {
      items.unshift({
        time: "Today",
        text: `${tasksList.length} task${tasksList.length > 1 ? "s" : ""} on the board · ${completedIds.size} complete.`,
      });
    }
    if (foodLog.length > 0) {
      items.unshift({
        time: "Today",
        text: `${foodLog.length} meal${foodLog.length > 1 ? "s" : ""} logged · ${meals.calories} kcal · ${meals.protein}g protein.`,
      });
    }
    if (waterCups > 0) {
      items.unshift({
        time: "Today",
        text: `${waterCups} cup${waterCups > 1 ? "s" : ""} of water (${(waterCups * 0.25).toFixed(2)} L).`,
      });
    }
    const activeC = challenges.filter((c) => c.active);
    if (activeC.length > 0) {
      items.unshift({
        time: "Active",
        text: `Challenges: ${activeC.map((c) => c.name).join(", ")}.`,
      });
    }
    if (breaches.length > 0) {
      items.unshift({
        time: "Recent",
        text: `${breaches.length} breach${breaches.length > 1 ? "es" : ""} logged.`,
      });
    }
    return items;
  }, [tasksList, completedIds, foodLog, meals, waterCups, challenges, breaches]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Pattern analysis · AI memory"
        title={
          <>
            What the system has <span className="gradient-electric">learned</span> about you
          </>
        }
        subtitle="Live read of your discipline, focus, health, productivity, learning, and business — derived from what you've actually logged today. Updates as you make changes anywhere in the app."
        icon={LineChartIcon}
        accent="cyan"
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Life balance</h3>
              <p className="text-[10px] text-slate-500">
                Live snapshot · 6 dimensions
              </p>
            </div>
            <Badge variant="default">LIVE</Badge>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#9c9ca8", fontSize: 10 }}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,28,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Life score · {lifeScore}/100
              </h3>
              <p className="text-[10px] text-slate-500">
                Average of all 6 dimensions
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="font-bold tabular text-emerald-300">
                live
              </span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend.map((d, i) => ({ day: d.day, score: i === monthlyTrend.length - 1 ? lifeScore : d.score }))}>
                <defs>
                  <linearGradient id="g-life" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6e6e7a", fontSize: 10 }}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(20,20,28,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#g-life)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {liveInsights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface-card relative overflow-hidden rounded-2xl p-5"
          >
            <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="text-xl">{insight.icon}</div>
                <Badge
                  variant={
                    insight.type === "warning"
                      ? "amber"
                      : insight.type === "win"
                        ? "emerald"
                        : insight.type === "challenge"
                          ? "cyan"
                          : "violet"
                  }
                >
                  {insight.type}
                </Badge>
              </div>
              <h3 className="mt-3 text-base font-semibold text-white">
                {insight.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {insight.body}
              </p>
              <div className="mt-4 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">
                  Updates whenever you log anything
                </span>
                <span className="tabular text-slate-400">
                  {Math.round(insight.confidence * 100)}% conf
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="surface-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Behavioral correlations
            </h3>
            <p className="text-[10px] text-slate-500">
              How your actions actually drive outcomes — ranked by impact.
            </p>
          </div>
          <Brain className="h-4 w-4 text-blue-400" />
        </div>
        <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
          <div className="text-3xl">🧠</div>
          <div className="mt-2 text-sm font-medium text-white">
            Calibrating
          </div>
          <div className="mt-1 max-w-md mx-auto text-xs leading-relaxed text-slate-400">
            The AI needs ~7 days of consistent logging before it can
            isolate which of your behaviors actually drive outcomes.
            Log your meals, workouts, sleep, and tasks honestly — the
            correlations will surface here automatically.
          </div>
        </div>
      </section>

      <section className="surface-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                AI Memory · activity log
              </h3>
              <p className="text-[10px] text-slate-500">
                Live snapshot of what you've done so far
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-0">
          {memories.map((m, i) => (
            <div key={i} className="relative flex gap-4 py-3 last:pb-0">
              <div className="relative">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-blue-600/30 to-sky-400/30 ring-1 ring-blue-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                </div>
                {i < memories.length - 1 && (
                  <div className="absolute left-1/2 top-6 h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-400/20 to-transparent" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
                  {m.time}
                </div>
                <div className="mt-0.5 text-sm text-slate-300">{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
