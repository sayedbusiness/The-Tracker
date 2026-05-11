"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays,
  Phone,
  BookOpen,
  PlayCircle,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import {
  thirtyDayPlan,
  NON_NEGOTIABLES,
  getTodayPlan,
} from "@/lib/thirty-day-plan";
import { cn } from "@/lib/utils";

export default function PlanPage() {
  const today = getTodayPlan();
  const todayNumber = today?.dayNumber ?? 0;

  // Group by week
  const weeks: Array<typeof thirtyDayPlan> = [[], [], [], [], []];
  for (const d of thirtyDayPlan) weeks[d.weekNumber - 1].push(d);

  const completedDays = todayNumber > 0 ? todayNumber - 1 : 0;
  const completionPct = Math.round((completedDays / 30) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        eyebrow="30-Day Operating System · Cycle 1"
        title={
          <>
            <span className="gradient-electric">May 12 → June 10.</span> No
            shortcuts.
          </>
        }
        subtitle="Built from your Notion plan + Impact Team training. Every day is locked. Skip nothing. Become someone tomorrow can't catch."
        icon={CalendarDays}
        accent="violet"
      />

      {/* Top progress bar */}
      <div className="surface-elevated relative overflow-hidden rounded-3xl p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-blue-700/15 blur-3xl" />
        <div className="relative grid items-center gap-6 sm:grid-cols-[auto_1fr_auto]">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-400 text-2xl font-black text-white shadow-[0_0_30px_rgba(30,58,138,0.5)]">
            {todayNumber > 0 ? todayNumber : "—"}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300">
              {todayNumber > 0
                ? `Day ${todayNumber} of 30 · ${today?.fullDate}`
                : "Outside the cycle window"}
            </div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {completedDays} of 30 days banked
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular text-white">
              {completionPct}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">
              complete
            </div>
          </div>
        </div>
      </div>

      {/* Weeks */}
      <section className="space-y-6">
        {weeks.map((week, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Week {idx + 1}
                <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {idx === 0 && "· Foundation"}
                  {idx === 1 && "· Volume"}
                  {idx === 2 && "· Intensity"}
                  {idx === 3 && "· Compound"}
                  {idx === 4 && "· Crescendo"}
                </span>
              </h2>
              <span className="text-[10px] tabular text-slate-500">
                {week[0]?.fullDate.split(",")[1]?.trim()} →{" "}
                {week[week.length - 1]?.fullDate.split(",")[1]?.trim()}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
              {week.map((d) => {
                const isToday = d.dayNumber === todayNumber;
                const isPast = todayNumber > 0 && d.dayNumber < todayNumber;
                const isFuture = todayNumber === 0 || d.dayNumber > todayNumber;
                return (
                  <Link
                    key={d.dayNumber}
                    href={isToday ? "/" : "/plan"}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      className={cn(
                        "group relative h-full rounded-2xl border p-3 transition-all",
                        isToday
                          ? "border-blue-400/40 bg-gradient-to-br from-blue-700/15 via-blue-600/5 to-sky-400/10 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                          : isPast
                            ? "border-emerald-500/15 bg-emerald-500/[0.04]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider",
                            isToday
                              ? "text-blue-300"
                              : isPast
                                ? "text-emerald-300"
                                : "text-slate-500"
                          )}
                        >
                          {d.weekday} · {d.fullDate.split(",")[1]?.trim()}
                        </div>
                        {isPast ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : isToday ? (
                          <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-200">
                            <span className="h-1 w-1 animate-pulse rounded-full bg-blue-300" />
                            Today
                          </span>
                        ) : (
                          <Circle className="h-3 w-3 text-slate-600" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "mt-2 text-xl font-bold tabular",
                          isToday
                            ? "text-white"
                            : isPast
                              ? "text-emerald-200"
                              : "text-slate-300"
                        )}
                      >
                        Day {d.dayNumber}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 text-[9px]">
                        {d.isJummah && <Badge variant="amber">Jummah</Badge>}
                        {d.isWeeklyReview && <Badge variant="violet">Review</Badge>}
                        {d.isLightDay && !d.isWeeklyReview && (
                          <Badge variant="default">Light</Badge>
                        )}
                      </div>
                      {d.coldCallTarget !== undefined && d.coldCallTarget > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                          <Phone className="h-2.5 w-2.5" />
                          {d.coldCallTarget} dials
                        </div>
                      )}
                      {d.oneThing && (
                        <div className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-400">
                          {d.oneThing}
                        </div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Today's deep view */}
      {today && (
        <section className="surface-elevated relative overflow-hidden rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Today's deep view
              </h3>
              <Link
                href="/"
                className="flex items-center gap-1 text-xs text-blue-300 transition-colors hover:text-blue-200"
              >
                Open full schedule <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Day {today.dayNumber} · {today.fullDate}
            </h2>
            {today.oneThing && (
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                <span className="font-semibold text-blue-300">One thing:</span>{" "}
                {today.oneThing}
              </p>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {today.coldCallTarget !== undefined && today.coldCallTarget > 0 && (
                <DeepCard icon={Phone} label="Cold dials" value={`${today.coldCallTarget}`} sub="track every call" />
              )}
              {today.studyFocus && (
                <DeepCard icon={BookOpen} label="Study focus" value={today.studyFocus} />
              )}
              {today.affiliateAction && (
                <DeepCard icon={PlayCircle} label="Affiliate" value={today.affiliateAction} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Non-negotiables */}
      <section className="surface-card rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">
            The non-negotiables
          </h2>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            re-read when tired
          </span>
        </div>
        <ol className="grid gap-2 sm:grid-cols-2">
          {NON_NEGOTIABLES.map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-700 text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-slate-200">
                {line}
              </span>
            </li>
          ))}
        </ol>
        <blockquote className="mt-5 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4 text-center">
          <p className="text-base italic text-white">
            "He who has a 'why' to live for can bear almost any 'how.'"
          </p>
          <p className="mt-2 text-xs text-amber-300/80">
            You got this, akhi. Now go close.
          </p>
        </blockquote>
      </section>
    </div>
  );
}

function DeepCard({
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
