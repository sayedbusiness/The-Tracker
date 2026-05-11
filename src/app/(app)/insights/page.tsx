"use client";

import { motion } from "framer-motion";
import {
  LineChart as LineChartIcon,
  Brain,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Line,
  LineChart,
  Area,
  AreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { aiInsights, monthlyTrend } from "@/lib/mock-data";

const radarData = [
  { subject: "Discipline", you: 0, avg: 65 },
  { subject: "Focus", you: 0, avg: 60 },
  { subject: "Health", you: 0, avg: 58 },
  { subject: "Productivity", you: 0, avg: 62 },
  { subject: "Learning", you: 0, avg: 55 },
  { subject: "Business", you: 0, avg: 70 },
];

const correlations: Array<{
  pair: string;
  strength: number;
  direction: "positive" | "negative";
  insight: string;
}> = [];

const memories = [
  {
    time: "Today",
    text: "Sayed started APEX OS. Goal: lean and muscular. Starting weight: 167 lb.",
  },
];

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Pattern analysis · AI memory"
        title={
          <>
            What the system has <span className="gradient-electric">learned</span> about you
          </>
        }
        subtitle="Every action, every skip, every spike. The AI mines patterns across months of your data and surfaces the signal hiding in the noise."
        icon={LineChartIcon}
        accent="cyan"
      />

      {/* Top: radar + life score trend */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Life balance</h3>
              <p className="text-[10px] text-slate-500">
                You vs. peer-avg (top 10% operators)
              </p>
            </div>
            <Badge variant="default">DAY 1</Badge>
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
                  name="Peer avg"
                  dataKey="avg"
                  stroke="#6e6e7a"
                  fill="#6e6e7a"
                  fillOpacity={0.1}
                  strokeWidth={1}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="#7c3aed"
                  fill="#7c3aed"
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
              <h3 className="text-sm font-semibold text-white">Life score · 30 days</h3>
              <p className="text-[10px] text-slate-500">
                Composite of all metrics, weighted by your goals
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="font-bold tabular text-emerald-300">+18.4</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
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
                <YAxis hide domain={[40, 100]} />
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

      {/* AI Insights cards */}
      <section className="grid gap-3 sm:grid-cols-2">
        {aiInsights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
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
                <span className="text-slate-500">Day 1 · pattern learning starts now</span>
                <span className="tabular text-slate-400">
                  {Math.round(insight.confidence * 100)}% conf
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Correlations */}
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
        <div className="space-y-2">
          {correlations.length === 0 ? (
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
          ) : correlations.map((c, i) => (
            <motion.div
              key={c.pair}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {c.pair}
                    </span>
                    {c.direction === "positive" ? (
                      <Badge variant="emerald">+</Badge>
                    ) : (
                      <Badge variant="rose">−</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {c.insight}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`text-base font-bold tabular ${
                      c.direction === "positive"
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {(c.strength * 100).toFixed(0)}
                  </span>
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={`h-full ${
                        c.direction === "positive"
                          ? "bg-emerald-400"
                          : "bg-rose-400"
                      }`}
                      style={{ width: `${c.strength * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Memory log */}
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
                Every meaningful event the AI has remembered about you
              </p>
            </div>
          </div>
          <button className="text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-white">
            Export
          </button>
        </div>
        <div className="space-y-0">
          {memories.map((m, i) => (
            <div
              key={i}
              className="relative flex gap-4 py-3 last:pb-0"
            >
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
