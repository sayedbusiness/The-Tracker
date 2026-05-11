"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Zap,
  Crown,
  Shield,
  Lock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import { user } from "@/lib/mock-data";

const achievements: Array<{
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  date?: string;
  progress?: number;
}> = [
  { id: "a1", name: "First Light", desc: "Complete your first day", icon: "🌅", unlocked: false, rarity: "common", progress: 0 },
  { id: "a2", name: "Streak Hunter", desc: "30-day discipline streak", icon: "🔥", unlocked: false, rarity: "rare", progress: 0 },
  { id: "a3", name: "Operator", desc: "100 days of disciplined execution", icon: "⚡", unlocked: false, rarity: "epic", progress: 0 },
  { id: "a4", name: "Iron Mind", desc: "75 Hard completion", icon: "🛡️", unlocked: false, rarity: "epic", progress: 0 },
  { id: "a5", name: "Six Figures", desc: "$100k+ MRR achieved", icon: "💎", unlocked: false, rarity: "legendary", progress: 0 },
  { id: "a6", name: "Hardened", desc: "Complete 75 Hard — Apex Edition", icon: "⚔️", unlocked: false, rarity: "legendary", progress: 0 },
  { id: "a7", name: "The Scholar", desc: "Read 24 books in a year", icon: "📚", unlocked: false, rarity: "rare", progress: 0 },
  { id: "a8", name: "Monk Mode", desc: "60 hrs of deep work in a month", icon: "🧘", unlocked: false, rarity: "epic", progress: 0 },
  { id: "a9", name: "Centurion", desc: "100-day workout streak", icon: "💪", unlocked: false, rarity: "epic", progress: 0 },
  { id: "a10", name: "Apex Predator", desc: "Reach Tier V Discipline rating", icon: "👑", unlocked: false, rarity: "legendary", progress: 0 },
  { id: "a11", name: "Untouchable", desc: "365-day streak", icon: "♾️", unlocked: false, rarity: "legendary", progress: 0 },
  { id: "a12", name: "Architect", desc: "Build a $1M ARR agency", icon: "🏛️", unlocked: false, rarity: "mythic", progress: 0 },
];

const rarityStyles = {
  common: {
    border: "border-slate-500/30",
    bg: "from-slate-500/10",
    text: "text-slate-300",
    glow: "",
  },
  rare: {
    border: "border-cyan-500/30",
    bg: "from-cyan-500/10",
    text: "text-cyan-300",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
  },
  epic: {
    border: "border-violet-500/30",
    bg: "from-violet-500/10",
    text: "text-violet-300",
    glow: "shadow-[0_0_25px_rgba(124,58,237,0.25)]",
  },
  legendary: {
    border: "border-amber-500/30",
    bg: "from-amber-500/10",
    text: "text-amber-300",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
  },
  mythic: {
    border: "border-rose-500/30",
    bg: "from-rose-500/10",
    text: "text-rose-300",
    glow: "shadow-[0_0_35px_rgba(244,63,94,0.35)]",
  },
};

export default function AchievementsPage() {
  const unlocked = achievements.filter((a) => a.unlocked).length;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Achievements · trophy room"
        title={
          <>
            Earn it. <span className="gradient-gold">Keep it.</span>
          </>
        }
        subtitle="Every badge here represents a real shift you've made. Nothing handed. Nothing inflated. Earn the next one."
        icon={Trophy}
        accent="amber"
      />

      {/* Level + XP hero */}
      <section className="surface-elevated relative overflow-hidden rounded-3xl p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr_auto]">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-3xl font-black text-white shadow-[0_0_40px_rgba(245,158,11,0.5)]">
              {user.level}
            </div>
            <Crown className="absolute -right-2 -top-2 h-6 w-6 fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
              Level {user.level} · Initiate
            </div>
            <div className="mt-1 text-3xl font-bold text-white">
              {user.xp.toLocaleString()}{" "}
              <span className="text-base font-normal text-slate-500">
                / {user.xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {(user.xpToNext - user.xp).toLocaleString()} XP to Level{" "}
              {user.level + 1} — <span className="text-amber-300">Operator</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatChip icon={Trophy} label="Earned" value={`${unlocked}/${achievements.length}`} />
            <StatChip icon={Flame} label="Streak" value={`${user.streak}d`} />
            <StatChip icon={Star} label="Tier" value="I" />
            <StatChip icon={Zap} label="Rank" value="—" />
          </div>
        </div>
      </section>

      {/* Recent unlocks banner */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">
              First badge is <b className="text-amber-300">First Light</b>
            </div>
            <div className="text-xs text-slate-400">
              Complete every habit you commit to today and unlock it.
            </div>
          </div>
        </div>
      </motion.section>

      {/* Achievement grid */}
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
          {achievements.map((a, i) => {
            const r = rarityStyles[a.rarity as keyof typeof rarityStyles];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b ${r.border} ${r.bg} to-transparent p-4 ${a.unlocked ? r.glow : ""}`}
              >
                {!a.unlocked && (
                  <div className="absolute right-2 top-2">
                    <Lock className="h-3 w-3 text-slate-500" />
                  </div>
                )}
                <div className={`mb-3 text-3xl ${!a.unlocked && "grayscale opacity-40"}`}>
                  {a.icon}
                </div>
                <h3 className={`text-sm font-semibold ${a.unlocked ? "text-white" : "text-slate-400"}`}>
                  {a.name}
                </h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  {a.desc}
                </p>
                {a.unlocked ? (
                  <div className={`mt-3 text-[10px] uppercase tracking-wider ${r.text}`}>
                    ✓ {a.date}
                  </div>
                ) : (
                  <>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          a.rarity === "mythic"
                            ? "from-rose-400 to-pink-400"
                            : a.rarity === "legendary"
                              ? "from-amber-400 to-orange-400"
                              : a.rarity === "epic"
                                ? "from-violet-400 to-purple-400"
                                : "from-cyan-400 to-blue-400"
                        }`}
                        style={{ width: `${(a.progress ?? 0) * 100}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] tabular text-slate-500">
                      {Math.round((a.progress ?? 0) * 100)}%
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Leaderboard preview */}
      <section className="surface-card rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Operator leaderboard · this week
          </h3>
          <Badge variant="default">UNRANKED</Badge>
        </div>
        <div className="mb-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-xs text-slate-400">
          You'll appear on the leaderboard after 7 days of consistent
          logging. Top 3 shown so you know what elite looks like.
        </div>
        <div className="space-y-1">
          {[
            { rank: 1, name: "M. Wahab", score: 9842, change: 0, you: false },
            { rank: 2, name: "L. Petrov", score: 9620, change: 1, you: false },
            { rank: 3, name: "K. Tanaka", score: 9510, change: -1, you: false },
            { rank: 0, name: "You · Sayed", score: 0, change: 0, you: true },
          ].map((row) => (
            <div
              key={row.rank}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                row.you
                  ? "border border-amber-500/30 bg-amber-500/[0.06]"
                  : "border border-transparent hover:bg-white/[0.02]"
              }`}
            >
              <span className="w-10 text-[11px] font-bold tabular text-slate-500">
                {row.rank === 0 ? "—" : `#${row.rank}`}
              </span>
              <span className={`flex-1 text-sm ${row.you ? "font-semibold text-amber-200" : "text-slate-300"}`}>
                {row.name}
              </span>
              <span
                className={`text-[11px] tabular ${
                  row.change > 0
                    ? "text-emerald-400"
                    : row.change < 0
                      ? "text-rose-400"
                      : "text-slate-500"
                }`}
              >
                {row.change > 0 ? "▲" : row.change < 0 ? "▼" : "—"} {Math.abs(row.change)}
              </span>
              <span className="w-16 text-right text-sm font-semibold tabular text-white">
                {row.score.toLocaleString()}
              </span>
            </div>
          ))}
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
