"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Shield,
  Skull,
  Trophy,
  Lock,
  Quote,
  Plus,
  X,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RingProgress } from "@/components/ui/progress";
import { user, disciplineQuotes, habits } from "@/lib/mock-data";
import { useSyncedState } from "@/hooks/use-synced-state";
import { cn } from "@/lib/utils";

type Severity = "low" | "warn" | "high";

interface Breach {
  id: string;
  label: string;
  cost: string;
  severity: Severity;
  loggedAt: number;
}

interface Challenge {
  id: string;
  name: string;
  target: string;
  total: number;
  reward: string;
  progress: number;
  active: boolean;
}

const SEED_CHALLENGES: Omit<Challenge, "progress" | "active">[] = [
  {
    id: "c1",
    name: "Morning Operator",
    target: "Wake 5 AM · 30 days",
    total: 30,
    reward: "+1500 XP · Operator badge",
  },
  {
    id: "c2",
    name: "75 Hard — Apex Edition",
    target: "Workout 2× · Quran daily · 30m Speechify · Walk 20m",
    total: 75,
    reward: "+5000 XP · Hardened badge",
  },
  {
    id: "c3",
    name: "Deep Work Marathon",
    target: "60 hrs of deep work this month",
    total: 60,
    reward: "+2000 XP · Monk-Mode badge",
  },
  {
    id: "c4",
    name: "Silent Sunday",
    target: "No social, no Slack, every Sunday for 8 weeks",
    total: 8,
    reward: "+1200 XP · Stillness badge",
  },
  {
    id: "c5",
    name: "Cold Call Crucible",
    target: "500 dials in 7 days — owners only",
    total: 500,
    reward: "+3000 XP · Dialer badge",
  },
];

const SEVERITY_COST: Record<Severity, string> = {
  low: "−50 XP",
  warn: "−150 XP · streak break warning",
  high: "−400 XP · streak reset",
};

export default function DisciplinePage() {
  const [challenges, setChallenges] = useSyncedState<Challenge[]>(
    "discipline:challenges",
    SEED_CHALLENGES.map((c) => ({ ...c, progress: 0, active: false }))
  );
  const [breaches, setBreaches] = useSyncedState<Breach[]>(
    "discipline:breaches",
    []
  );

  const [newChallengeOpen, setNewChallengeOpen] = useState(false);
  const [draftChallenge, setDraftChallenge] = useState({
    name: "",
    target: "",
    total: 30,
    reward: "+1000 XP",
  });
  const [newBreachOpen, setNewBreachOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("breach") === "1") setNewBreachOpen(true);
    if (params.get("challenge") === "1") setNewChallengeOpen(true);
    if (params.get("breach") || params.get("challenge")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("breach");
      url.searchParams.delete("challenge");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);
  const [draftBreach, setDraftBreach] = useState<{
    label: string;
    severity: Severity;
  }>({ label: "", severity: "warn" });

  const activeCount = challenges.filter((c) => c.active).length;

  const score = useMemo(() => {
    // Live discipline score = % of active-challenge progress, dampened by
    // recent breaches. Starts at 0, climbs as you commit + complete.
    if (activeCount === 0) return user.disciplineScore;
    const total = challenges
      .filter((c) => c.active)
      .reduce((sum, c) => sum + Math.min(1, c.progress / c.total), 0);
    const recentPenalty = Math.min(
      30,
      breaches.filter((b) => Date.now() - b.loggedAt < 7 * 24 * 3600 * 1000)
        .length * 6
    );
    return Math.max(
      0,
      Math.round((total / activeCount) * 100 - recentPenalty)
    );
  }, [challenges, breaches, activeCount]);

  const toggleActive = (id: string) =>
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );

  const advance = (id: string) =>
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, progress: Math.min(c.total, c.progress + 1) }
          : c
      )
    );

  const retreat = (id: string) =>
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, progress: Math.max(0, c.progress - 1) } : c
      )
    );

  const addChallenge = () => {
    const name = draftChallenge.name.trim();
    if (!name) return;
    setChallenges((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name,
        target: draftChallenge.target.trim() || "Custom challenge",
        total: Math.max(1, draftChallenge.total),
        reward: draftChallenge.reward || "+1000 XP",
        progress: 0,
        active: true,
      },
    ]);
    setDraftChallenge({ name: "", target: "", total: 30, reward: "+1000 XP" });
    setNewChallengeOpen(false);
  };

  const addBreach = () => {
    const label = draftBreach.label.trim();
    if (!label) return;
    setBreaches((prev) => [
      {
        id: `b-${Date.now()}`,
        label,
        cost: SEVERITY_COST[draftBreach.severity],
        severity: draftBreach.severity,
        loggedAt: Date.now(),
      },
      ...prev,
    ]);
    setDraftBreach({ label: "", severity: "warn" });
    setNewBreachOpen(false);
  };

  const removeBreach = (id: string) =>
    setBreaches((prev) => prev.filter((b) => b.id !== id));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Discipline Engine"
        title={
          <>
            <span className="gradient-gold">Discipline equals freedom.</span>
          </>
        }
        subtitle="This is the accountability core. Activate challenges, log breaches honestly, and let the system weaponize your own commitments back at you when you slip."
        icon={Shield}
        accent="amber"
        actions={
          <Button onClick={() => setNewChallengeOpen(true)}>
            <Flame className="h-4 w-4" /> New challenge
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-elevated relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative flex items-center gap-6">
            <RingProgress
              value={score}
              size={140}
              stroke={10}
              label="SCORE"
              color="amber"
            />
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
                Discipline rating · Tier I
              </div>
              <div className="mt-1 text-3xl font-bold gradient-gold">
                {score === 0 ? "UNRANKED" : score < 40 ? "FORGING" : score < 70 ? "OPERATOR" : "HARDENED"}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {activeCount === 0
                  ? "Activate a challenge to start a rating."
                  : `${activeCount} active · ${breaches.length} lifetime breaches`}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="font-semibold text-orange-300 tabular">
                  {user.streak} day streak
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  Longest: <b className="text-white">{user.longestStreak}d</b>
                </span>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-elevated relative overflow-hidden rounded-3xl p-6"
        >
          <Quote className="absolute -top-2 -right-2 h-32 w-32 rotate-12 text-white/[0.03]" />
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400/70">
            Today's reinforcement
          </div>
          <blockquote className="mt-3 text-2xl font-medium leading-tight tracking-tight text-white lg:text-3xl">
            "You said you wanted greatness.
            <br />
            <span className="gradient-gold">This is the cost.</span>"
          </blockquote>
          <div className="mt-3 text-xs text-slate-500">
            — Day-1 message. As your data grows, the AI will write these for you based on your own patterns.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {disciplineQuotes.slice(0, 3).map((q, i) => (
              <span
                key={i}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-slate-400"
              >
                "{q.text}"
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {newChallengeOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="surface-elevated space-y-3 rounded-2xl border border-amber-500/30 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-200">
                Define a new challenge
              </h3>
              <button
                onClick={() => setNewChallengeOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              placeholder="Name · e.g. 100 cold calls × 30 days"
              value={draftChallenge.name}
              onChange={(e) =>
                setDraftChallenge((d) => ({ ...d, name: e.target.value }))
              }
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none"
            />
            <input
              placeholder="What you'll do · e.g. 100 dials before 12 PM, no skipping"
              value={draftChallenge.target}
              onChange={(e) =>
                setDraftChallenge((d) => ({ ...d, target: e.target.value }))
              }
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400/40 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={1}
                value={draftChallenge.total}
                onChange={(e) =>
                  setDraftChallenge((d) => ({
                    ...d,
                    total: Number(e.target.value) || 30,
                  }))
                }
                placeholder="Days / reps target"
                className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <input
                placeholder="Reward · e.g. +2000 XP"
                value={draftChallenge.reward}
                onChange={(e) =>
                  setDraftChallenge((d) => ({ ...d, reward: e.target.value }))
                }
                className="rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNewChallengeOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={addChallenge}
                disabled={!draftChallenge.name.trim()}
                className="rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(245,158,11,0.4)] disabled:opacity-40"
              >
                Activate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Challenges
          </h2>
          <Badge variant="amber">
            {activeCount} / {challenges.length} ACTIVE
          </Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {challenges.map((c) => (
            <motion.div
              key={c.id}
              layout
              whileHover={{ y: -2 }}
              className={cn(
                "surface-card group relative overflow-hidden rounded-2xl p-5 transition-opacity",
                !c.active && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{c.name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{c.target}</div>
                </div>
                <button
                  onClick={() => toggleActive(c.id)}
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-colors",
                    c.active
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                      : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-amber-400/30 hover:text-amber-200"
                  )}
                  aria-label={c.active ? "Deactivate" : "Activate"}
                >
                  {c.active ? <Flame className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    {c.progress} / {c.total}
                  </span>
                  <span className="tabular font-bold text-amber-300">
                    {Math.round((c.progress / c.total) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={false}
                    animate={{ width: `${(c.progress / c.total) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Trophy className="h-3 w-3 text-amber-400" />
                  {c.reward}
                </span>
                {c.active && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => retreat(c.id)}
                      disabled={c.progress === 0}
                      className="grid h-6 w-6 place-items-center rounded-md border border-white/[0.08] text-slate-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-30"
                    >
                      −
                    </button>
                    <button
                      onClick={() => advance(c.id)}
                      disabled={c.progress >= c.total}
                      className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-amber-500/80 to-orange-500/80 text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.6)] disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recent breaches
              </h2>
              <p className="text-[10px] text-slate-500">
                The AI logs every commitment you break — and the cost.
              </p>
            </div>
            <button
              onClick={() => setNewBreachOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-200 transition-colors hover:bg-rose-500/20"
            >
              <Plus className="h-3 w-3" /> Log breach
            </button>
          </div>

          <AnimatePresence>
            {newBreachOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 space-y-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3"
              >
                <input
                  autoFocus
                  placeholder="What did you break? e.g. Skipped gym, watched social"
                  value={draftBreach.label}
                  onChange={(e) =>
                    setDraftBreach((d) => ({ ...d, label: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && addBreach()}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-rose-400/40 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={draftBreach.severity}
                    onChange={(e) =>
                      setDraftBreach((d) => ({
                        ...d,
                        severity: e.target.value as Severity,
                      }))
                    }
                    className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="low" className="bg-slate-900">low · −50 XP</option>
                    <option value="warn" className="bg-slate-900">warn · −150 XP</option>
                    <option value="high" className="bg-slate-900">high · −400 XP + streak reset</option>
                  </select>
                  <div className="flex-1" />
                  <button
                    onClick={() => setNewBreachOpen(false)}
                    className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addBreach}
                    disabled={!draftBreach.label.trim()}
                    className="rounded-lg bg-rose-500/80 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                  >
                    Log
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {breaches.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 text-center">
                <div className="text-2xl">🧘</div>
                <div className="mt-1 text-sm font-medium text-white">
                  Clean record so far
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  Honest logging is the only way the discipline score is real. Tap "Log breach" the moment you slip.
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {breaches.map((b) => (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="group flex items-center gap-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.04] p-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-500/15">
                      <Skull className="h-4 w-4 text-rose-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{b.label}</div>
                      <div className="mt-0.5 text-xs text-rose-300/80">
                        {b.cost}
                      </div>
                    </div>
                    <button
                      onClick={() => removeBreach(b.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 opacity-0 transition-all hover:bg-white/[0.05] hover:text-white group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="text-amber-400">⚠</div>
              <div>
                <b className="text-amber-200">AI escalation rule:</b>{" "}
                <span className="text-slate-300">
                  3 breaches in 30 days unlocks a recovery protocol — a 7-day
                  redemption challenge with double XP.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <h2 className="mb-1 text-sm font-semibold text-white">
            Non-negotiables
          </h2>
          <p className="mb-4 text-[10px] text-slate-500">
            Daily habits that anchor your identity.
          </p>
          <div className="space-y-2.5">
            {habits.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5"
              >
                <div className="text-xl">{h.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{h.name}</div>
                  <div className="text-[10px] text-slate-500">
                    Tap on the dashboard to log
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-md border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-300">
                  <Flame className="h-2.5 w-2.5" />
                  {h.streak}d
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-3 text-xs text-slate-300">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-blue-300" />
            <span>
              <b className="text-blue-200">Tip:</b> activate the Morning Operator challenge first. It pulls Fajr + Quran + gym into a single locked structure.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
