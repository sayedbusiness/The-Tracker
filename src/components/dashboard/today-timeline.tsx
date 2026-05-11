"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  Dumbbell,
  Flame,
  GraduationCap,
  Hand,
  Heart,
  Home,
  Moon,
  Phone,
  PlayCircle,
  Sparkles,
  Star,
  Sun,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildDayBlocks,
  type Block,
  type BlockKind,
  type DayPlan,
} from "@/lib/thirty-day-plan";

const KIND_META: Record<
  BlockKind,
  { icon: LucideIcon; tone: string; label: string }
> = {
  spiritual: { icon: Hand, tone: "from-blue-700/40 to-blue-700/0 border-blue-600/30 text-blue-200", label: "Spiritual" },
  skincare: { icon: Sparkles, tone: "from-sky-500/30 to-sky-500/0 border-sky-500/30 text-sky-200", label: "Self-care" },
  study: { icon: BookOpen, tone: "from-blue-600/30 to-blue-600/0 border-blue-500/30 text-blue-200", label: "Study" },
  "deep-work": { icon: Star, tone: "from-blue-500/30 to-blue-500/0 border-blue-400/30 text-blue-200", label: "Deep work" },
  school: { icon: GraduationCap, tone: "from-blue-700/40 to-blue-700/0 border-blue-600/30 text-blue-200", label: "School" },
  starbucks: { icon: Coffee, tone: "from-amber-700/30 to-amber-700/0 border-amber-600/30 text-amber-200", label: "Starbucks" },
  commute: { icon: Home, tone: "from-slate-600/30 to-slate-600/0 border-slate-500/30 text-slate-300", label: "Commute" },
  meal: { icon: Utensils, tone: "from-emerald-600/30 to-emerald-600/0 border-emerald-500/30 text-emerald-200", label: "Meal" },
  agency: { icon: Phone, tone: "from-blue-500/30 to-blue-500/0 border-blue-400/30 text-blue-200", label: "Agency" },
  content: { icon: Camera, tone: "from-sky-500/30 to-sky-500/0 border-sky-500/30 text-sky-200", label: "Content" },
  affiliate: { icon: PlayCircle, tone: "from-blue-500/30 to-blue-500/0 border-blue-400/30 text-blue-200", label: "Affiliate" },
  gym: { icon: Dumbbell, tone: "from-rose-600/30 to-rose-600/0 border-rose-500/30 text-rose-200", label: "Gym" },
  reflection: { icon: Moon, tone: "from-blue-700/30 to-blue-700/0 border-blue-600/30 text-blue-300", label: "Reflection" },
  sleep: { icon: Moon, tone: "from-blue-900/40 to-blue-900/0 border-blue-800/30 text-blue-300", label: "Sleep" },
  personal: { icon: Heart, tone: "from-slate-600/30 to-slate-600/0 border-slate-500/30 text-slate-300", label: "Personal" },
  review: { icon: Star, tone: "from-amber-500/30 to-amber-500/0 border-amber-500/30 text-amber-200", label: "Review" },
};

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function blockStartMin(b: Block): number {
  const [h, m] = b.time.split(":").map(Number);
  return h * 60 + m;
}

function blockEndMin(b: Block): number {
  return blockStartMin(b) + b.durationMin;
}

export function TodayTimeline({ plan }: { plan: DayPlan | null }) {
  const [starbucks, setStarbucks] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const blocks = useMemo<Block[]>(() => {
    if (!plan) return [];
    return buildDayBlocks(starbucks, plan.weekday);
  }, [plan, starbucks]);

  const now = nowMinutes();
  const currentIdx = blocks.findIndex(
    (b) => blockStartMin(b) <= now && blockEndMin(b) > now
  );
  const upcomingIdx =
    currentIdx === -1 ? blocks.findIndex((b) => blockStartMin(b) > now) : -1;

  const visibleBlocks = showAll
    ? blocks
    : blocks.slice(
        Math.max(0, currentIdx === -1 ? upcomingIdx - 2 : currentIdx - 1),
        Math.max(8, (currentIdx === -1 ? upcomingIdx : currentIdx) + 6)
      );

  const total = blocks.length;
  const done = blocks.filter((b) => completed.has(b.id)).length;
  const completionPct = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!plan) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <Sun className="mx-auto h-7 w-7 text-blue-400" />
        <div className="mt-3 text-sm font-semibold text-white">
          Outside the 30-day cycle
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Your 30-day operating system runs May 12 – June 10. Today's date
          isn't in that range — but the system is ready for cycle 2 when
          you're ready.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-blue-300/80">
            <Star className="h-3 w-3" />
            Day {plan.dayNumber} of 30 · Week {plan.weekNumber}
            {plan.isJummah && (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-300">
                Jummah
              </span>
            )}
            {plan.isWeeklyReview && (
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-300">
                Weekly review
              </span>
            )}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white">{plan.fullDate}</h2>
          {plan.oneThing && (
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              <span className="text-blue-300">Today's one thing →</span>{" "}
              {plan.oneThing}
            </p>
          )}
        </div>

        {/* Starbucks toggle */}
        <StarbucksToggle starbucks={starbucks} onChange={setStarbucks} weekday={plan.weekday} />
      </div>

      {/* Progress bar */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          />
        </div>
        <span className="text-xs tabular text-slate-400">
          <b className="text-white">{done}</b> / {total} · {completionPct}%
        </span>
      </div>

      {/* Day-specific call-out (cold calls, study, affiliate) */}
      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        {typeof plan.coldCallTarget === "number" && plan.coldCallTarget > 0 && (
          <Callout
            icon={Phone}
            label="Cold call target"
            value={`${plan.coldCallTarget} dials`}
            sub="Track every pickup + set"
          />
        )}
        {plan.studyFocus && (
          <Callout icon={BookOpen} label="Study" value={plan.studyFocus} />
        )}
        {plan.affiliateAction && (
          <Callout icon={PlayCircle} label="Affiliate" value={plan.affiliateAction} />
        )}
      </div>

      {/* Timeline */}
      <ol className="relative space-y-2">
        <AnimatePresence initial={false}>
          {visibleBlocks.map((block) => {
            const meta = KIND_META[block.kind];
            const Icon = meta.icon;
            const isCompleted = completed.has(block.id);
            const startMin = blockStartMin(block);
            const endMin = blockEndMin(block);
            const isCurrent = startMin <= now && endMin > now;
            const isPast = endMin <= now && !isCurrent;

            return (
              <motion.li
                key={block.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "group relative flex items-start gap-3 rounded-2xl border bg-gradient-to-r p-3 transition-all",
                  meta.tone,
                  isCompleted && "opacity-50",
                  isCurrent && "ring-1 ring-blue-400/40 shadow-[0_0_24px_rgba(59,130,246,0.18)]"
                )}
              >
                {/* Time column */}
                <div className="w-16 shrink-0 text-right">
                  <div
                    className={cn(
                      "text-xs font-bold tabular",
                      isCurrent ? "text-white" : isPast ? "text-slate-500" : "text-slate-300"
                    )}
                  >
                    {formatTime12(block.time)}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">
                    {block.durationMin > 0 ? `${block.durationMin}m` : "—"}
                  </div>
                </div>

                {/* Icon */}
                <button
                  onClick={() => toggle(block.id)}
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all",
                    isCompleted
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                      : "border-white/10 bg-black/30 text-slate-200 hover:border-blue-400/40 hover:bg-blue-500/10"
                  )}
                  aria-label={`Toggle ${block.label}`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </button>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cn(
                        "text-sm font-semibold leading-tight",
                        isCompleted ? "line-through text-slate-500" : "text-white"
                      )}
                    >
                      {block.label}
                    </h3>
                    {block.prayer && (
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-300">
                        prayer
                      </span>
                    )}
                    {isCurrent && (
                      <span className="flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-200">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-blue-300" />
                        now
                      </span>
                    )}
                  </div>
                  {block.detail && (
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                      {block.detail}
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {!showAll && blocks.length > visibleBlocks.length && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.02] hover:text-white"
        >
          <ChevronDown className="h-3 w-3" />
          Show all {blocks.length} blocks for today
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.02] hover:text-white"
        >
          <ChevronUp className="h-3 w-3" />
          Collapse to current window
        </button>
      )}
    </div>
  );
}

function Callout({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-blue-300" />
        <span className="text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div className="mt-1 line-clamp-2 text-xs font-medium text-white">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

function StarbucksToggle({
  starbucks,
  onChange,
  weekday,
}: {
  starbucks: boolean;
  onChange: (v: boolean) => void;
  weekday: string;
}) {
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
      <button
        onClick={() => onChange(false)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
          !starbucks
            ? "bg-blue-600/20 text-white shadow-[0_0_15px_rgba(30,58,138,0.4)] ring-1 ring-blue-400/30"
            : "text-slate-400 hover:text-white"
        )}
      >
        {isWeekend ? <Home className="h-3.5 w-3.5" /> : <GraduationCap className="h-3.5 w-3.5" />}
        {isWeekend ? "Home" : "School"}
      </button>
      <button
        onClick={() => onChange(true)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
          starbucks
            ? "bg-amber-600/20 text-amber-100 shadow-[0_0_15px_rgba(180,83,9,0.4)] ring-1 ring-amber-400/30"
            : "text-slate-400 hover:text-white"
        )}
      >
        <Coffee className="h-3.5 w-3.5" />
        Starbucks
      </button>
    </div>
  );
}
