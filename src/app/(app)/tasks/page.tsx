"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ListTodo,
  Plus,
  Filter,
  Sparkles,
  TrendingUp,
  Calendar,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/tasks/page-header";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { tasks } from "@/lib/mock-data";

const filters = [
  { id: "all", label: "All", count: tasks.length },
  { id: "today", label: "Today", count: tasks.length },
  { id: "p0", label: "P0", count: tasks.filter((t) => t.priority === "p0").length },
  { id: "deep-work", label: "Deep Work", count: tasks.filter((t) => t.category === "deep-work").length },
  { id: "agency", label: "Agency", count: tasks.filter((t) => t.category === "agency").length },
  { id: "health", label: "Health", count: tasks.filter((t) => t.category === "health").length },
];

export default function TasksPage() {
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.completed).length;
    const totalMin = tasks.reduce((sum, t) => sum + t.estimated, 0);
    const doneMin = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.estimated, 0);
    const avgDifficulty =
      tasks.length === 0
        ? "—"
        : (tasks.reduce((sum, t) => sum + t.difficulty, 0) / tasks.length).toFixed(1);
    return {
      done,
      total: tasks.length,
      totalMin,
      doneMin,
      avgDifficulty,
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="AI Adaptive Tasks"
        title={
          <>
            <span className="gradient-text">Today's plan,</span> intelligently
            sequenced
          </>
        }
        subtitle="The AI re-prioritizes your day based on your energy curve, deadlines, and completion patterns. Difficulty scales with you — the more you ship, the harder the next day gets."
        icon={ListTodo}
        accent="violet"
        actions={
          <>
            <Button variant="secondary" size="md">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button size="md">
              <Plus className="h-4 w-4" /> Add task
            </Button>
          </>
        }
      />

      {/* Smart stats strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock
          icon={<TrendingUp className="h-4 w-4" />}
          label="Completion"
          value={`${stats.done}/${stats.total}`}
          sub={stats.total === 0 ? "no tasks yet" : `${Math.round((stats.done / stats.total) * 100)}%`}
          accent="violet"
        />
        <StatBlock
          icon={<Calendar className="h-4 w-4" />}
          label="Deep work"
          value={`${stats.doneMin}m`}
          sub={`of ${stats.totalMin}m planned`}
          accent="cyan"
        />
        <StatBlock
          icon={<Zap className="h-4 w-4" />}
          label="Avg difficulty"
          value={stats.avgDifficulty}
          sub="calibrating"
          accent="amber"
        />
        <StatBlock
          icon={<Brain className="h-4 w-4" />}
          label="AI confidence"
          value="—"
          sub="needs 7 days of data"
          accent="emerald"
        />
      </section>

      {/* AI suggestion card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-blue-600/20 bg-gradient-to-br from-blue-600/10 via-blue-600/5 to-sky-500/10 p-5"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-[0_0_20px_rgba(30,58,138,0.5)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                AI Coach · Day 1 setup
              </span>
              <Badge variant="violet">GET STARTED</Badge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              Add your first 3 tasks for today. Pick at least one P0 (the
              one thing you must do), one health task, and one deep work
              block. I'll learn your energy curve as you complete them.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="primary">
                <Plus className="h-3 w-3" /> Add first task
              </Button>
              <Button size="sm" variant="secondary">
                Suggest a template
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all ${
              filter === f.id
                ? "border-blue-400/30 bg-blue-600/15 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12] hover:text-white"
            }`}
          >
            {f.label}
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold tabular text-slate-300">
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="surface-card rounded-2xl p-6">
        <TodayTasks />
      </div>

      {/* Energy / difficulty intelligence panel */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">
            Difficulty calibration
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            The AI raises task difficulty when your completion rate stays above
            85% for 7+ days. It lowers difficulty if you skip 3 days in a row —
            without ever making it easy enough to coast.
          </p>
          <div className="mt-5 space-y-3">
            {[
              { label: "Week 1 · this week", level: 1.0, output: 0, current: true },
              { label: "Week 2 · target", level: 2.0, output: 0 },
              { label: "Week 3 · target", level: 2.5, output: 0 },
              { label: "Week 4 · target", level: 3.0, output: 0 },
            ].map((w) => (
              <div key={w.label} className="flex items-center gap-3">
                <span
                  className={`w-44 shrink-0 text-xs ${
                    w.current ? "text-blue-300" : "text-slate-400"
                  }`}
                >
                  {w.label}
                </span>
                <div className="flex flex-1 items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < Math.round(w.level)
                          ? w.current
                            ? "bg-gradient-to-r from-blue-400 to-sky-400"
                            : "bg-white/20"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
                <span className="w-12 shrink-0 text-right text-xs tabular text-slate-400">
                  {w.output > 0 ? `${w.output}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white">Your energy curve</h3>
          <p className="mt-1 text-xs text-slate-500">
            No sessions logged yet — this map fills in automatically.
          </p>
          <div className="mt-5 space-y-2">
            {[
              "5–7 AM",
              "7–9 AM",
              "9–11 AM",
              "11 AM–1 PM",
              "1–3 PM",
              "3–5 PM",
              "5–7 PM",
              "7–10 PM",
            ].map((time) => (
              <div key={time} className="flex items-center gap-2">
                <span className="w-24 text-[11px] text-slate-500">{time}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-white/[0.04]" />
                <span className="w-8 text-right text-[11px] tabular text-slate-500">
                  —
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "violet" | "emerald" | "cyan" | "amber";
}) {
  const accents = {
    violet: "text-blue-300 from-blue-600/20",
    emerald: "text-emerald-300 from-emerald-500/20",
    cyan: "text-sky-300 from-sky-500/20",
    amber: "text-amber-300 from-amber-500/20",
  };
  return (
    <div className="surface-card relative overflow-hidden rounded-2xl p-4">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent blur-2xl ${accents[accent]}`}
      />
      <div className="relative flex items-center gap-2">
        <div className={`grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] ${accents[accent]}`}>
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
      </div>
      <div className="relative mt-2 text-2xl font-semibold tabular text-white">
        {value}
      </div>
      <div className="relative mt-0.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}
