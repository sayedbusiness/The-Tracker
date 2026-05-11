"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Phone,
  PlayCircle,
  Star,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TodayTimeline } from "@/components/dashboard/today-timeline";
import { getDayByNumber, thirtyDayPlan, getTodayPlan } from "@/lib/thirty-day-plan";

export default function DayDetailPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = use(params);
  const n = parseInt(day, 10);
  if (!Number.isFinite(n) || n < 1 || n > 30) notFound();

  const plan = getDayByNumber(n);
  if (!plan) notFound();

  const todayPlan = getTodayPlan();
  const isToday = todayPlan?.dayNumber === n;
  const isPast = todayPlan && todayPlan.dayNumber > n;
  const prev = n > 1 ? n - 1 : null;
  const next = n < 30 ? n + 1 : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Crumb + nav */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <Link
          href="/plan"
          className="flex items-center gap-1.5 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          30-Day Plan
        </Link>
        <div className="flex items-center gap-2">
          {prev !== null && (
            <Link
              href={`/plan/${prev}`}
              className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" /> Day {prev}
            </Link>
          )}
          {next !== null && (
            <Link
              href={`/plan/${next}`}
              className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Day {next} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Hero card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="surface-elevated relative overflow-hidden rounded-3xl p-6"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-700/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-blue-300/80">
            <CalendarDays className="h-3 w-3" />
            Day {plan.dayNumber} of 30 · Week {plan.weekNumber}
            {plan.isJummah && <Badge variant="amber">Jummah</Badge>}
            {plan.isWeeklyReview && <Badge variant="violet">Weekly review</Badge>}
            {plan.isLightDay && !plan.isWeeklyReview && (
              <Badge variant="default">Light day</Badge>
            )}
            {isToday && (
              <span className="flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/15 px-2 py-0.5 font-bold text-blue-200">
                <span className="h-1 w-1 animate-pulse rounded-full bg-blue-300" />
                TODAY
              </span>
            )}
            {isPast && <Badge variant="emerald">Past</Badge>}
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {plan.fullDate}
          </h1>

          {plan.oneThing && (
            <div className="mt-4 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-700/15 via-blue-600/5 to-transparent p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                Today's one thing
              </div>
              <p className="mt-1 text-lg font-medium text-white">
                {plan.oneThing}
              </p>
            </div>
          )}

          {/* Callouts grid */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {plan.coldCallTarget !== undefined && (
              <Callout
                icon={Phone}
                label="Cold dials"
                value={plan.coldCallTarget > 0 ? `${plan.coldCallTarget}` : "Rest"}
                sub={plan.coldCallTarget > 0 ? "track every call" : "no dials today"}
              />
            )}
            {plan.emailTarget !== undefined && plan.emailTarget > 0 && (
              <Callout
                icon={Mail}
                label="Cold emails"
                value={`${plan.emailTarget}`}
                sub="Instantly · personalized"
              />
            )}
            {plan.studyFocus && (
              <Callout icon={BookOpen} label="Study focus" value={plan.studyFocus} />
            )}
            {plan.affiliateAction && (
              <Callout icon={PlayCircle} label="Affiliate" value={plan.affiliateAction} />
            )}
          </div>
        </div>
      </motion.section>

      {/* Timeline */}
      <div className="surface-card rounded-2xl p-6">
        <TodayTimeline plan={plan} />
      </div>

      {/* Quick jumps to other weeks */}
      <section className="surface-card rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All 30 days</h2>
          <Link
            href="/plan"
            className="text-xs text-blue-300 transition-colors hover:text-blue-200"
          >
            Open full map
          </Link>
        </div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10 lg:grid-cols-15">
          {thirtyDayPlan.map((d) => {
            const isCurrent = d.dayNumber === n;
            const isPastDay = todayPlan && todayPlan.dayNumber > d.dayNumber;
            return (
              <Link
                key={d.dayNumber}
                href={`/plan/${d.dayNumber}`}
                className={`grid aspect-square place-items-center rounded-lg border text-[10px] font-bold tabular transition-all ${
                  isCurrent
                    ? "border-blue-400/60 bg-blue-500/20 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                    : isPastDay
                      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/80 hover:border-emerald-400/40"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.16] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {d.dayNumber}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Callout({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-blue-300" />
        <span className="text-[9px] uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}
