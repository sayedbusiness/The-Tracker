"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, Target, Scale, Cpu } from "lucide-react";
import { useSyncedState } from "@/hooks/use-synced-state";
import { getTodayPlan } from "@/lib/thirty-day-plan";
import { useDopamine } from "@/components/dopamine/dopamine-provider";

interface Deal {
  stage: string;
  value: number;
}

interface WeightEntry {
  date: string;
  weight: number;
}

/**
 * The four targets locked in for the 60-day summer cycle. Each one pulls
 * its real progress from the synced stores so the bars move as the days do.
 */
export function SummerGoals() {
  const [pipeline] = useSyncedState<Deal[]>("agency:pipeline", []);
  const [history] = useSyncedState<WeightEntry[]>(
    "health:weight:history",
    []
  );
  const [automations, setAutomations] = useSyncedState<number>(
    "automations:shipped",
    0
  );
  const { hit } = useDopamine();

  const today = getTodayPlan();
  const dayNumber = today?.dayNumber ?? 1;
  const daysLeft = Math.max(0, 60 - dayNumber);

  // Revenue — Won deals this cycle.
  const wonValue = pipeline
    .filter((d) => d.stage === "won")
    .reduce((s, d) => s + d.value, 0);

  // Closed clients — count of won deals.
  const wonCount = pipeline.filter((d) => d.stage === "won").length;

  // Weight — latest logged, starting at 172.
  const latestWeight = history.length > 0 ? history[history.length - 1].weight : 172;

  const goals = useMemo(
    () => [
      {
        id: "rev",
        icon: DollarSign,
        label: "Cash month",
        value: `$${wonValue.toLocaleString()}`,
        sub: `of $20,000`,
        progress: Math.min(100, (wonValue / 20000) * 100),
        gradient: "from-emerald-400 to-teal-500",
        glow: "rgba(16,185,129,0.5)",
      },
      {
        id: "clients",
        icon: Target,
        label: "Closed clients",
        value: `${wonCount}`,
        sub: `of 5+ new`,
        progress: Math.min(100, (wonCount / 5) * 100),
        gradient: "from-violet-400 to-purple-600",
        glow: "rgba(139,92,246,0.5)",
      },
      {
        id: "cut",
        icon: Scale,
        label: "Cut to lean",
        value: `${latestWeight} lb`,
        sub: `goal 158 lb`,
        // Inverse — closer to 158 = higher progress. Starting at 172.
        progress:
          latestWeight <= 158
            ? 100
            : Math.max(0, ((172 - latestWeight) / (172 - 158)) * 100),
        gradient: "from-amber-400 to-orange-500",
        glow: "rgba(251,146,60,0.5)",
      },
      {
        id: "ai",
        icon: Cpu,
        label: "AI agents shipped",
        value: `${automations}`,
        sub: `of 8`,
        progress: Math.min(100, (automations / 8) * 100),
        gradient: "from-cyan-400 to-blue-500",
        glow: "rgba(59,130,246,0.5)",
      },
    ],
    [wonValue, wonCount, latestWeight, automations]
  );

  return (
    <section className="surface-elevated relative overflow-hidden rounded-2xl border border-white/[0.06] p-5">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mb-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            60-day cycle · summer lockdown
          </div>
          <h2 className="mt-0.5 text-lg font-bold text-white">
            The four targets.
          </h2>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold tabular text-white">
            {daysLeft} days left
          </div>
          <div className="text-[10px] text-slate-500">until July 23</div>
        </div>
      </div>

      <div className="relative grid gap-3 sm:grid-cols-2">
        {goals.map((g) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/30 p-3 transition-all hover:border-white/15"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${g.gradient} shadow-[0_2px_10px_var(--g)]`}
                    style={{ ["--g" as string]: g.glow }}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    {g.label}
                  </div>
                </div>
                <div className="text-[10px] tabular text-slate-500">
                  {Math.round(g.progress)}%
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <div className="text-xl font-bold tabular text-white">
                  {g.value}
                </div>
                <div className="text-[10px] text-slate-500">{g.sub}</div>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  initial={false}
                  animate={{ width: `${g.progress}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  className={`h-full bg-gradient-to-r ${g.gradient}`}
                />
              </div>
              {g.id === "ai" && (
                <button
                  onClick={(e) => {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setAutomations((n) => n + 1);
                    hit("review", {
                      amount: 60,
                      label: "Automation shipped",
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    });
                  }}
                  className="mt-2 w-full rounded-md border border-cyan-400/20 bg-cyan-500/10 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/20"
                >
                  + Log a shipped automation
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
