"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Flame, Target } from "lucide-react";
import { usePending } from "@/components/notifications/pending-provider";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import type { Profile } from "@/lib/auth/types";

const LINES = [
  "One move. Right now. Then the next.",
  "Momentum beats motivation. Start the timer.",
  "The version of you that wins does this anyway.",
  "Small hinges swing big doors. Open this one.",
  "You don't feel like it. Do it anyway.",
  "Future you is watching. Make them proud.",
  "Discipline is just remembering what you want.",
];

/**
 * The dashboard "Next up" hero. Always surfaces the single most important
 * open action so the app never feels empty — and nudges onboarding /
 * streak protection. This is the pull-back-in card.
 */
export function NextUp() {
  const { actions, count } = usePending();
  const [profile] = useSyncedState<Profile>("profile", {});
  const [activeDays] = useSyncedState<Set<string>>("active-days", new Set<string>(), { serializer: "set" });
  const [today, setToday] = useState("ssr");
  useEffect(() => setToday(todayKey()), []);

  const streak = useMemo(() => {
    const days = Array.from(activeDays).sort();
    if (days.length === 0 || today === "ssr") return 0;
    const dayMs = 24 * 3600 * 1000;
    const asDate = (s: string) => new Date(`${s}T12:00:00Z`).getTime();
    if ((asDate(today) - asDate(days[days.length - 1])) / dayMs > 1) return 0;
    let cur = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (asDate(days[i + 1]) - asDate(days[i]) === dayMs) cur++;
      else break;
    }
    return cur;
  }, [activeDays, today]);

  const line = useMemo(() => LINES[(today.charCodeAt(today.length - 1) || 0) % LINES.length], [today]);

  // Onboarding not finished → push them to personalize (Zeigarnik nudge).
  if (profile.onboardingComplete === false || (profile && Object.keys(profile).length === 0)) {
    return (
      <Card
        eyebrow="Finish setup"
        tone="violet"
        icon={<Sparkles className="h-5 w-5 text-white" />}
        title="Personalize your Avori OS"
        body="Answer a few quick questions so your plan, targets, and coach fit you."
        href="/onboarding"
        cta="Personalize now"
      />
    );
  }

  const top = actions[0];

  if (!top) {
    return (
      <Card
        eyebrow="Clean day"
        tone="emerald"
        icon={<Flame className="h-5 w-5 text-white" />}
        title={streak > 0 ? `🔥 ${streak}-day streak — protect it` : "Nothing open. Set the bar."}
        body={
          streak > 0
            ? "Everything's checked off. Come back tomorrow before midnight to keep the streak alive."
            : "Add a task or load the starter pack to start your streak today."
        }
        href="/tasks"
        cta="Plan today"
      />
    );
  }

  return (
    <Card
      eyebrow={`Next up · ${count} open`}
      tone="blue"
      icon={<span className="text-2xl">{top.emoji}</span>}
      title={top.label}
      body={top.hint ?? "Knock it out now while you've got the window."}
      href={top.href}
      cta="Do it now"
      footer={
        streak > 0 ? (
          <span className="flex items-center gap-1.5 text-xs text-orange-300">
            <Flame className="h-3.5 w-3.5" /> {streak}-day streak on the line
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Target className="h-3.5 w-3.5" /> {line}
          </span>
        )
      }
    />
  );
}

function Card({
  eyebrow,
  title,
  body,
  href,
  cta,
  icon,
  tone,
  footer,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: React.ReactNode;
  tone: "blue" | "violet" | "emerald";
  footer?: React.ReactNode;
}) {
  const tones = {
    blue: "from-blue-600/20 via-blue-600/5 border-blue-500/25",
    violet: "from-violet-600/20 via-violet-600/5 border-violet-500/25",
    emerald: "from-emerald-600/20 via-emerald-600/5 border-emerald-500/25",
  };
  const iconBg = {
    blue: "from-blue-600 to-sky-400",
    violet: "from-violet-600 to-purple-500",
    emerald: "from-emerald-500 to-teal-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-5 ${tones[tone]}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${iconBg[tone]} shadow-[0_0_24px_rgba(59,130,246,0.4)]`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
            {eyebrow}
          </div>
          <div className="mt-0.5 truncate text-lg font-bold text-white">{title}</div>
          <div className="mt-0.5 line-clamp-2 text-xs text-slate-400">{body}</div>
        </div>
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.14] sm:flex"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="relative mt-3 flex items-center justify-between">
        {footer ?? <span />}
        <Link
          href={href}
          className="flex items-center gap-1.5 rounded-xl bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.14] sm:hidden"
        >
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
