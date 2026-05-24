"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Zap,
  Crown,
  Lock,
  Sparkles,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import { user } from "@/lib/mock-data";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import type { LoggedMeal } from "@/components/health/meal-composer";

type SavedTask = {
  id: string;
  estimated: number;
  difficulty: number;
  category: "agency" | "health" | "learning" | "personal" | "deep-work";
};

interface Challenge {
  id: string;
  active: boolean;
  progress: number;
  total: number;
}

interface Client {
  mrr: number;
}

interface Deal {
  value: number;
}

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  rarity: Rarity;
  /** 0..1 progress; >= 1 means unlocked. */
  compute: (ctx: Ctx) => number;
  /** A hint about what to do next. */
  next?: string;
}

interface Ctx {
  activeDays: number;
  tasksCompletedToday: number;
  mealsToday: number;
  waterCups: number;
  deepWorkMinsToday: number;
  learnCompleted: number;
  mrr: number;
  pipeValue: number;
  challenges: Challenge[];
  breaches: number;
  streak: number;
  longestStreak: number;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-light",
    name: "First Light",
    desc: "Log your first thing today (task, meal, or cup of water).",
    icon: "🌅",
    rarity: "common",
    compute: (c) =>
      c.tasksCompletedToday + c.mealsToday + c.waterCups > 0 ? 1 : 0,
    next: "Tap a habit on the dashboard or log a meal in Health.",
  },
  {
    id: "active-week",
    name: "Week One",
    desc: "Use APEX OS on 7 different days.",
    icon: "📅",
    rarity: "common",
    compute: (c) => Math.min(1, c.activeDays / 7),
    next: "Open the app and log at least one thing every day this week.",
  },
  {
    id: "streak-hunter",
    name: "Streak Hunter",
    desc: "30-day active streak.",
    icon: "🔥",
    rarity: "rare",
    compute: (c) => Math.min(1, c.streak / 30),
    next: "Don't break the chain — touch at least one thing each day.",
  },
  {
    id: "operator",
    name: "Operator",
    desc: "100 days of execution.",
    icon: "⚡",
    rarity: "epic",
    compute: (c) => Math.min(1, c.activeDays / 100),
  },
  {
    id: "monk-mode",
    name: "Monk Mode",
    desc: "60 hours of deep work tasks completed.",
    icon: "🧘",
    rarity: "epic",
    compute: (c) => Math.min(1, c.deepWorkMinsToday / (60 * 60)),
    next: "Mark deep-work tasks complete on the Tasks page.",
  },
  {
    id: "iron-mind",
    name: "Iron Mind",
    desc: "Complete the 75 Hard challenge.",
    icon: "🛡️",
    rarity: "legendary",
    compute: (c) => {
      const ch = c.challenges.find(
        (x) => x.active && x.total >= 75
      );
      return ch ? Math.min(1, ch.progress / ch.total) : 0;
    },
    next: "Activate the 75 Hard challenge on Discipline.",
  },
  {
    id: "scholar",
    name: "The Scholar",
    desc: "Complete 24 learning tracks.",
    icon: "📚",
    rarity: "rare",
    compute: (c) => Math.min(1, c.learnCompleted / 24),
    next: "Open a video on the Learn page and mark it complete.",
  },
  {
    id: "centurion",
    name: "Centurion",
    desc: "100 active days in a row.",
    icon: "💪",
    rarity: "epic",
    compute: (c) => Math.min(1, c.longestStreak / 100),
  },
  {
    id: "architect",
    name: "Architect",
    desc: "Build to $1M ARR ($83k MRR).",
    icon: "🏛️",
    rarity: "mythic",
    compute: (c) => Math.min(1, c.mrr / 83333),
    next: "Add paying clients on Apex Growth.",
  },
  {
    id: "six-figures",
    name: "Six Figures",
    desc: "Reach $100k+ MRR.",
    icon: "💎",
    rarity: "legendary",
    compute: (c) => Math.min(1, c.mrr / 100000),
  },
  {
    id: "pipe-fat",
    name: "Stacked Pipe",
    desc: "Build a pipeline worth $50k+.",
    icon: "📈",
    rarity: "rare",
    compute: (c) => Math.min(1, c.pipeValue / 50000),
    next: "Add deals on the Apex Growth pipeline.",
  },
  {
    id: "untouchable",
    name: "Untouchable",
    desc: "365-day active streak.",
    icon: "♾️",
    rarity: "legendary",
    compute: (c) => Math.min(1, c.longestStreak / 365),
  },
];

const rarityStyles: Record<Rarity, {
  border: string;
  bg: string;
  text: string;
  glow: string;
}> = {
  common: { border: "border-slate-500/30", bg: "from-slate-500/10", text: "text-slate-300", glow: "" },
  rare: { border: "border-sky-500/30", bg: "from-sky-500/10", text: "text-sky-300", glow: "shadow-[0_0_20px_rgba(59,130,246,0.2)]" },
  epic: { border: "border-blue-600/30", bg: "from-blue-600/10", text: "text-blue-300", glow: "shadow-[0_0_25px_rgba(30,58,138,0.25)]" },
  legendary: { border: "border-amber-500/30", bg: "from-amber-500/10", text: "text-amber-300", glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]" },
  mythic: { border: "border-rose-500/30", bg: "from-rose-500/10", text: "text-rose-300", glow: "shadow-[0_0_35px_rgba(244,63,94,0.35)]" },
};

export default function AchievementsPage() {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);

  // Live read of every relevant synced state.
  const [tasksList] = useSyncedState<SavedTask[]>(`tasks:list:${today}`, []);
  const [completedIds] = useSyncedState<Set<string>>(
    `tasks:completed:${today}`,
    new Set<string>(),
    { serializer: "set" }
  );
  const [meals] = useSyncedState<LoggedMeal[]>(`health:meals:${today}`, []);
  const [waterCups] = useSyncedState<number>(`water:${today}`, 0);
  const [challenges] = useSyncedState<Challenge[]>(
    "discipline:challenges",
    []
  );
  const [breaches] = useSyncedState<{ id: string }[]>(
    "discipline:breaches",
    []
  );
  const [clients] = useSyncedState<Client[]>("agency:clients", []);
  const [pipeline] = useSyncedState<Deal[]>("agency:pipeline", []);
  const [learnComplete] = useSyncedState<Set<string>>(
    "learn:completed",
    new Set<string>(),
    { serializer: "set" }
  );
  // Day-by-day activity log — every page touch on a fresh day appends today.
  const [activeDays, setActiveDays] = useSyncedState<Set<string>>(
    "active-days",
    new Set<string>(),
    { serializer: "set" }
  );

  // Add today to activeDays as soon as the user has done anything.
  useEffect(() => {
    if (today === "ssr") return;
    const didSomething =
      completedIds.size > 0 ||
      meals.length > 0 ||
      waterCups > 0 ||
      tasksList.length > 0;
    if (didSomething && !activeDays.has(today)) {
      setActiveDays((prev) => new Set(prev).add(today));
    }
  }, [today, completedIds, meals, waterCups, tasksList, activeDays, setActiveDays]);

  // Compute streak from activeDays — the longest tail of consecutive days
  // ending today (or yesterday if today is still empty).
  const { streak, longestStreak } = useMemo(() => {
    const days = Array.from(activeDays).sort();
    if (days.length === 0) return { streak: 0, longestStreak: 0 };

    const dayMs = 24 * 3600 * 1000;
    const asDate = (s: string) => new Date(`${s}T12:00:00Z`).getTime();

    // Longest streak — scan all gaps.
    let longest = 1;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
      if (asDate(days[i]) - asDate(days[i - 1]) === dayMs) {
        run++;
        if (run > longest) longest = run;
      } else {
        run = 1;
      }
    }

    // Current streak — count back from the last active day if it's today
    // or yesterday in PT.
    const last = days[days.length - 1];
    const todayMs = asDate(today);
    const lastMs = asDate(last);
    const gap = (todayMs - lastMs) / dayMs;
    if (gap > 1) return { streak: 0, longestStreak: longest };
    let cur = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (asDate(days[i + 1]) - asDate(days[i]) === dayMs) {
        cur++;
      } else break;
    }
    return { streak: cur, longestStreak: longest };
  }, [activeDays, today]);

  const ctx: Ctx = useMemo(() => {
    const deepWorkMinsToday = tasksList
      .filter((t) => t.category === "deep-work" && completedIds.has(t.id))
      .reduce((s, t) => s + t.estimated, 0);
    return {
      activeDays: activeDays.size,
      tasksCompletedToday: completedIds.size,
      mealsToday: meals.length,
      waterCups,
      deepWorkMinsToday,
      learnCompleted: learnComplete.size,
      mrr: clients.reduce((s, c) => s + c.mrr, 0),
      pipeValue: pipeline.reduce((s, d) => s + d.value, 0),
      challenges,
      breaches: breaches.length,
      streak,
      longestStreak,
    };
  }, [
    activeDays,
    completedIds,
    meals,
    waterCups,
    tasksList,
    learnComplete,
    clients,
    pipeline,
    challenges,
    breaches,
    streak,
    longestStreak,
  ]);

  const computed = ACHIEVEMENTS.map((a) => {
    const progress = a.compute(ctx);
    return { ...a, progress, unlocked: progress >= 1 };
  });

  const unlocked = computed.filter((a) => a.unlocked).length;
  const xp = computed.reduce((s, a) => s + Math.round(a.progress * 100), 0);
  const xpToNext = 1000;
  const level =
    xp < 100 ? 1 : xp < 300 ? 2 : xp < 700 ? 3 : xp < 1500 ? 4 : 5;
  const tierName = ["Initiate", "Operator", "Hardened", "Apex", "Mythic"][
    level - 1
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Achievements · trophy room"
        title={
          <>
            Earn it. <span className="gradient-gold">Keep it.</span>
          </>
        }
        subtitle="Every badge here represents a real shift you've made. Progress updates live as you log anything anywhere in the app."
        icon={Trophy}
        accent="amber"
      />

      <section className="surface-elevated relative overflow-hidden rounded-3xl p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr_auto]">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-3xl font-black text-white shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              {level}
            </div>
            <Crown className="absolute -right-2 -top-2 h-6 w-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
              Level {level} · {tierName}
            </div>
            <div className="mt-1 text-3xl font-bold text-white">
              {xp.toLocaleString()}{" "}
              <span className="text-base font-normal text-slate-500">
                / {xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {Math.max(0, xpToNext - xp).toLocaleString()} XP to the next tier — every percentage of progress on any badge counts.
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={false}
                animate={{ width: `${Math.min(100, (xp / xpToNext) * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatChip icon={Trophy} label="Earned" value={`${unlocked}/${ACHIEVEMENTS.length}`} />
            <StatChip icon={Flame} label="Streak" value={`${streak}d`} />
            <StatChip icon={Star} label="Active" value={`${ctx.activeDays}d`} />
            <StatChip icon={Zap} label="Longest" value={`${longestStreak}d`} />
          </div>
        </div>
      </section>

      {!computed[0].unlocked && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-sky-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                Next badge:{" "}
                <b className="text-amber-300">{computed[0].name}</b>
              </div>
              <div className="text-xs text-slate-400">{computed[0].next}</div>
            </div>
          </div>
        </motion.section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Badges</h2>
          <div className="flex gap-2">
            {(["common", "rare", "epic", "legendary", "mythic"] as const).map((r) => (
              <Badge
                key={r}
                variant={
                  r === "rare"
                    ? "cyan"
                    : r === "epic"
                      ? "violet"
                      : r === "legendary"
                        ? "amber"
                        : r === "mythic"
                          ? "rose"
                          : "default"
                }
              >
                {r}
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {computed.map((a, i) => {
            const r = rarityStyles[a.rarity];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b ${r.border} ${r.bg} to-transparent p-4 ${a.unlocked ? r.glow : ""}`}
              >
                <div className="absolute right-2 top-2">
                  {a.unlocked ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Lock className="h-3 w-3 text-slate-500" />
                  )}
                </div>
                <div
                  className={`mb-3 text-3xl ${!a.unlocked && "grayscale opacity-40"}`}
                >
                  {a.icon}
                </div>
                <h3
                  className={`text-sm font-semibold ${a.unlocked ? "text-white" : "text-slate-400"}`}
                >
                  {a.name}
                </h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  {a.desc}
                </p>
                {a.unlocked ? (
                  <div
                    className={`mt-3 text-[10px] uppercase tracking-wider ${r.text}`}
                  >
                    ✓ Unlocked
                  </div>
                ) : (
                  <>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={false}
                        animate={{ width: `${a.progress * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full bg-gradient-to-r ${
                          a.rarity === "mythic"
                            ? "from-rose-400 to-pink-400"
                            : a.rarity === "legendary"
                              ? "from-amber-400 to-orange-400"
                              : a.rarity === "epic"
                                ? "from-blue-400 to-blue-400"
                                : "from-sky-400 to-blue-400"
                        }`}
                      />
                    </div>
                    <div className="mt-1 text-[10px] tabular text-slate-500">
                      {Math.round(a.progress * 100)}%
                      {a.next && a.progress < 0.05 && (
                        <span className="ml-1 text-slate-400">· {a.next}</span>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-amber-400" />
        <span className="text-[9px] uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-1 text-sm font-bold tabular text-white">{value}</div>
    </div>
  );
}

void user;
