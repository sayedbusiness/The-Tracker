"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Shield,
  Skull,
  Trophy,
  Lock,
  ChevronRight,
  Quote,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RingProgress } from "@/components/ui/progress";
import { user, disciplineQuotes, habits } from "@/lib/mock-data";

const breaches = [
  {
    id: "b1",
    label: "Skipped workout — Thu, May 7",
    cost: "Productivity dropped 27% that day",
    severity: "warn",
  },
  {
    id: "b2",
    label: "Late sleep — Mon, May 5 (12:30 AM)",
    cost: "Tuesday focus score: 65 (your floor)",
    severity: "warn",
  },
  {
    id: "b3",
    label: "Phone usage spike — Sat, May 3 (4h 22m)",
    cost: "12 deep work blocks lost",
    severity: "high",
  },
];

const challenges = [
  {
    id: "c1",
    name: "Morning Operator",
    target: "Wake 5 AM · 30 days",
    progress: 17,
    total: 30,
    reward: "+1500 XP · Operator badge",
    active: true,
  },
  {
    id: "c2",
    name: "75 Hard — Apex Edition",
    target: "Workout 2× · No alcohol · Read · Cold plunge",
    progress: 47,
    total: 75,
    reward: "+5000 XP · Hardened badge",
    active: true,
  },
  {
    id: "c3",
    name: "Deep Work Marathon",
    target: "60 hrs of deep work this month",
    progress: 38,
    total: 60,
    reward: "+2000 XP · Monk-Mode badge",
    active: true,
  },
  {
    id: "c4",
    name: "Silent Sunday",
    target: "No social, no Slack, every Sunday for 8 weeks",
    progress: 0,
    total: 8,
    reward: "+1200 XP · Stillness badge",
    active: false,
  },
];

export default function DisciplinePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Discipline Engine"
        title={
          <>
            <span className="gradient-gold">Discipline equals freedom.</span>
          </>
        }
        subtitle="This is the accountability core. It tracks breaches, escalates challenges, and weaponizes your own commitments back at you when you slip."
        icon={Shield}
        accent="amber"
        actions={
          <Button>
            <Flame className="h-4 w-4" /> New challenge
          </Button>
        }
      />

      {/* Score + Quote hero */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-elevated relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="relative flex items-center gap-6">
            <RingProgress
              value={user.disciplineScore}
              size={140}
              stroke={10}
              label="SCORE"
              color="amber"
            />
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
                Discipline rating · Tier IV
              </div>
              <div className="mt-1 text-3xl font-bold gradient-gold">
                ELITE
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Top 4% globally. Two breaches from Tier V.
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
            — Daily message · written by the AI based on your last 7 days.
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

      {/* Active challenges */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Active challenges
          </h2>
          <Badge variant="amber">3 / 5 SLOTS</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {challenges.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              className={`surface-card group relative overflow-hidden rounded-2xl p-5 ${
                !c.active && "opacity-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{c.name}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{c.target}</div>
                </div>
                {c.active ? (
                  <Badge variant="amber">ACTIVE</Badge>
                ) : (
                  <Lock className="h-4 w-4 text-slate-500" />
                )}
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
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.progress / c.total) * 100}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Trophy className="h-3 w-3 text-amber-400" />
                {c.reward}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Breaches + Habits */}
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
            <Badge variant="rose">3 LAST 30 DAYS</Badge>
          </div>
          <div className="space-y-2">
            {breaches.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.04] p-3"
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
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </div>
            ))}
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
                    {h.done}/{h.target} this week
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-md border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-300">
                  <Flame className="h-2.5 w-2.5" />
                  {h.streak}d
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
