"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Briefcase,
  Calendar as CalendarIcon,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Coffee,
  Dumbbell,
  Flame,
  Hand,
  Heart,
  Home,
  MapPin,
  Moon,
  Pencil,
  Phone,
  PlayCircle,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applyOverrides,
  buildDayBlocks,
  type Block,
  type BlockKind,
  type BlockOverride,
  type DayPlan,
  type UserBlock,
} from "@/lib/thirty-day-plan";
import { useSyncedState } from "@/hooks/use-synced-state";
import { minutesOfDayPT } from "@/lib/dates";

const KIND_META: Record<
  BlockKind,
  { icon: LucideIcon; tone: string; label: string }
> = {
  spiritual: { icon: Hand, tone: "from-blue-700/40 to-blue-700/0 border-blue-600/30 text-blue-200", label: "Spiritual" },
  skincare: { icon: Sparkles, tone: "from-sky-500/30 to-sky-500/0 border-sky-500/30 text-sky-200", label: "Self-care" },
  study: { icon: BookOpen, tone: "from-blue-600/30 to-blue-600/0 border-blue-500/30 text-blue-200", label: "Study" },
  "deep-work": { icon: Star, tone: "from-blue-500/30 to-blue-500/0 border-blue-400/30 text-blue-200", label: "Deep work" },
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
  calendar: { icon: CalendarIcon, tone: "from-blue-600/30 to-blue-600/0 border-blue-400/40 text-blue-200", label: "Calendar" },
  custom: { icon: Briefcase, tone: "from-blue-500/30 to-blue-500/0 border-blue-400/30 text-blue-200", label: "Custom" },
};

const BLOCK_KINDS: BlockKind[] = [
  "deep-work",
  "agency",
  "content",
  "affiliate",
  "meal",
  "gym",
  "study",
  "personal",
  "custom",
];

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function blockStartMin(b: Block): number {
  const [h, m] = b.time.split(":").map(Number);
  return h * 60 + m;
}

function blockEndMin(b: Block): number {
  return blockStartMin(b) + b.durationMin;
}

interface CalEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  location: string | null;
  link: string | null;
  allDay: boolean;
}

function eventToBlock(e: CalEvent): Block | null {
  if (!e.start || e.allDay) return null;
  const d = new Date(e.start);
  const hh = d.toLocaleTimeString("en-CA", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });
  const time = hh.slice(0, 5);
  const durationMin = e.end
    ? Math.max(
        15,
        Math.round((new Date(e.end).getTime() - d.getTime()) / 60000)
      )
    : 30;
  return {
    id: `cal-${e.id}`,
    time,
    durationMin,
    label: e.title,
    detail: e.location ? `📍 ${e.location}` : "From your Google Calendar",
    kind: "calendar",
    source: "calendar",
    link: e.link ?? undefined,
  };
}

export function TodayTimeline({ plan }: { plan: DayPlan | null }) {
  const dayKey = plan ? `day-${plan.dayNumber}` : "noop";

  const [starbucks, setStarbucks] = useSyncedState<boolean>(
    `starbucks:${dayKey}`,
    false
  );
  const [completed, setCompleted] = useSyncedState<Set<string>>(
    `completed:${dayKey}`,
    new Set<string>(),
    { serializer: "set" }
  );
  const [overrides, setOverrides] = useSyncedState<BlockOverride[]>(
    `plan:overrides:${dayKey}`,
    []
  );
  const [userBlocks, setUserBlocks] = useSyncedState<UserBlock[]>(
    `plan:custom:${dayKey}`,
    []
  );

  const [showAll, setShowAll] = useState(false);
  const [calEvents, setCalEvents] = useState<Block[]>([]);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [addingBlock, setAddingBlock] = useState(false);

  // Pull Google Calendar events (today only) and translate to blocks.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/calendar/events", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as { events?: CalEvent[] };
        if (cancelled) return;
        const blocks = (body.events ?? [])
          .map(eventToBlock)
          .filter((b): b is Block => b !== null);
        setCalEvents(blocks);
      } catch {
        /* offline or not connected — silently fall back to base plan */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [dayKey]);

  const baseBlocks = useMemo<Block[]>(() => {
    if (!plan) return [];
    return buildDayBlocks(starbucks, plan.weekday, plan);
  }, [plan, starbucks]);

  const blocks = useMemo<Block[]>(() => {
    return applyOverrides(baseBlocks, overrides, userBlocks, calEvents);
  }, [baseBlocks, overrides, userBlocks, calEvents]);

  // Live "now" pointer in Pacific time.
  const [now, setNow] = useState<number>(-1);
  useEffect(() => {
    setNow(minutesOfDayPT());
    const interval = setInterval(() => setNow(minutesOfDayPT()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const currentIdx =
    now < 0
      ? -1
      : blocks.findIndex(
          (b) => blockStartMin(b) <= now && blockEndMin(b) > now
        );
  const upcomingIdx =
    now < 0
      ? -1
      : currentIdx === -1
        ? blocks.findIndex((b) => blockStartMin(b) > now)
        : -1;

  const visibleBlocks = showAll
    ? blocks
    : now < 0
      ? blocks.slice(0, 8)
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

  const saveEdit = (b: Block) => {
    if (b.source === "user") {
      setUserBlocks((prev) =>
        prev.map((ub) => (ub.id === b.id ? { ...b, source: "user" as const } : ub))
      );
    } else if (b.source === "calendar") {
      // Calendar blocks aren't editable from here — they come from Google.
    } else {
      // Base block — write an override
      setOverrides((prev) => {
        const without = prev.filter((o) => o.blockId !== b.id);
        return [
          ...without,
          {
            blockId: b.id,
            time: b.time,
            durationMin: b.durationMin,
            label: b.label,
            detail: b.detail,
          },
        ];
      });
    }
    setEditingBlock(null);
  };

  const resetBlock = (b: Block) => {
    if (b.source === "user") {
      setUserBlocks((prev) => prev.filter((ub) => ub.id !== b.id));
    } else if (b.source === "base") {
      setOverrides((prev) => prev.filter((o) => o.blockId !== b.id));
    }
  };

  const removeBlock = (b: Block) => {
    if (b.source === "user") {
      setUserBlocks((prev) => prev.filter((ub) => ub.id !== b.id));
    } else if (b.source === "base") {
      setOverrides((prev) => {
        const without = prev.filter((o) => o.blockId !== b.id);
        return [...without, { blockId: b.id, removed: true }];
      });
    }
    setEditingBlock(null);
  };

  const addUserBlock = (b: UserBlock) => {
    setUserBlocks((prev) => [...prev, b]);
    setAddingBlock(false);
  };

  if (!plan) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <Sun className="mx-auto h-7 w-7 text-blue-400" />
        <div className="mt-3 text-sm font-semibold text-white">
          Outside the 60-day cycle
        </div>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
          Your 60-day operating system runs{" "}
          <b className="text-white">May 25 → July 23</b>. Today's date isn't in
          that range — but you can still open any day.
        </p>
        <a
          href="/plan/1"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-blue-700 to-sky-500 px-4 py-2 text-xs font-medium text-white shadow-[0_4px_15px_rgba(30,58,138,0.4)] transition-all hover:shadow-[0_6px_20px_rgba(59,130,246,0.55)]"
        >
          Open Day 1 →
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-blue-300/80">
            <Star className="h-3 w-3" />
            Day {plan.dayNumber} of 60 · Week {plan.weekNumber}
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
            {calEvents.length > 0 && (
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-200">
                {calEvents.length} cal
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAddingBlock(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-200 transition-colors hover:bg-blue-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Add block
          </button>
          <StarbucksToggle starbucks={starbucks} onChange={setStarbucks} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
          <motion.div
            initial={false}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
          />
        </div>
        <span className="text-xs tabular text-slate-400">
          <b className="text-white">{done}</b> / {total} · {completionPct}%
        </span>
      </div>

      {/* Day-specific call-out */}
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
            const isCal = block.source === "calendar";
            const isUser = block.source === "user";

            return (
              <motion.li
                key={block.id}
                layout
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
                    {isCal && (
                      <span className="flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-200">
                        <CalendarIcon className="h-2.5 w-2.5" /> google
                      </span>
                    )}
                    {isUser && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                        custom
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
                  {block.link && isCal && (
                    <a
                      href={block.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-300 hover:text-blue-200"
                    >
                      Open in Google Calendar →
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!isCal && (
                    <button
                      onClick={() => setEditingBlock(block)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      aria-label="Edit block"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
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

      <AnimatePresence>
        {editingBlock && (
          <BlockEditor
            block={editingBlock}
            onClose={() => setEditingBlock(null)}
            onSave={saveEdit}
            onReset={() => {
              resetBlock(editingBlock);
              setEditingBlock(null);
            }}
            onRemove={() => removeBlock(editingBlock)}
          />
        )}
        {addingBlock && (
          <BlockEditor
            block={{
              id: `u-${Date.now()}`,
              time: "12:00",
              durationMin: 30,
              label: "",
              detail: "",
              kind: "custom",
              source: "user",
            }}
            isNew
            onClose={() => setAddingBlock(false)}
            onSave={(b) => addUserBlock({ ...b, source: "user" })}
            onReset={() => setAddingBlock(false)}
            onRemove={() => setAddingBlock(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BlockEditor({
  block,
  isNew,
  onClose,
  onSave,
  onReset,
  onRemove,
}: {
  block: Block;
  isNew?: boolean;
  onClose: () => void;
  onSave: (b: Block) => void;
  onReset: () => void;
  onRemove: () => void;
}) {
  const [time, setTime] = useState(block.time);
  const [durationMin, setDurationMin] = useState(block.durationMin);
  const [label, setLabel] = useState(block.label);
  const [detail, setDetail] = useState(block.detail ?? "");
  const [kind, setKind] = useState<BlockKind>(block.kind);

  const save = () => {
    if (!label.trim()) return;
    onSave({
      ...block,
      time,
      durationMin: Math.max(0, durationMin),
      label: label.trim(),
      detail: detail.trim() || undefined,
      kind,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="glass-strong fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-3 overflow-hidden rounded-3xl p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            {isNew ? "Add a custom block" : "Edit block"}
          </h3>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Field label="Label">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Gym moved to 4pm"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start time">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Duration (min)">
            <input
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Category">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as BlockKind)}
            className={inputCls}
          >
            {BLOCK_KINDS.map((k) => (
              <option key={k} value={k} className="bg-slate-900">
                {KIND_META[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes">
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Anything you want to remember about this block"
            rows={2}
            className={`${inputCls} min-h-[60px] resize-y`}
          />
        </Field>
        <div className="flex items-center justify-between gap-2 pt-1">
          {!isNew && (
            <div className="flex gap-2">
              {block.source === "base" && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/[0.04]"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              )}
              <button
                onClick={onRemove}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200 hover:bg-rose-500/20"
              >
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!label.trim()}
              className="rounded-lg bg-gradient-to-br from-blue-700 to-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(30,58,138,0.4)] disabled:opacity-40"
            >
              {isNew ? "Add block" : "Save changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      {children}
    </label>
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
}: {
  starbucks: boolean;
  onChange: (v: boolean) => void;
}) {
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
        <Home className="h-3.5 w-3.5" />
        Home
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

// Lucide imports kept tidy (unused-import suppressor — keep nav imports).
void Flame;
void MapPin;
