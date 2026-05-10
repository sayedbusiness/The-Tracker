"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame, Sparkles, Target, Zap } from "lucide-react";
import { RingProgress } from "@/components/ui/progress";
import { user, todayMetrics } from "@/lib/mock-data";

export function HeroStats() {
  const completionPct = Math.round(
    (todayMetrics.tasksCompleted / todayMetrics.tasksTotal) * 100
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.08] via-indigo-500/[0.04] to-cyan-500/[0.06] p-6 lg:p-8"
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute -top-32 -right-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-violet-300/80">
            Today's mission
          </div>
          <h1 className="text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">Become</span> the version of you
            <br />
            tomorrow won't catch up to.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            You're {completionPct}% through today's plan. The Meridian call at
            2 PM is your highest-leverage moment. AI has flagged 3 patterns from
            your last 7 days — review when you have a minute.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Pill
              icon={<Flame className="h-3.5 w-3.5" />}
              label="Streak"
              value={`${user.streak}d`}
              accent="amber"
            />
            <Pill
              icon={<Zap className="h-3.5 w-3.5" />}
              label="Discipline"
              value={`${user.disciplineScore}`}
              accent="violet"
            />
            <Pill
              icon={<Target className="h-3.5 w-3.5" />}
              label="Focus"
              value={`${user.focusScore}`}
              accent="cyan"
            />
            <Pill
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label="Agency"
              value={`${user.agencyScore}`}
              accent="emerald"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <RingProgress
            value={user.disciplineScore}
            size={180}
            stroke={10}
            label="DISCIPLINE"
            color="violet"
          />
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs">
            <ArrowUpRight className="h-3 w-3 text-emerald-400" />
            <span className="font-semibold text-emerald-300">+4.2 this week</span>
          </div>
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
    violet: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
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
