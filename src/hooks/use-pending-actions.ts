"use client";

import { useEffect, useMemo, useState } from "react";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey, weekKeyMonday } from "@/lib/dates";
import { questsForDate } from "@/lib/dopamine";
import { getTodayPlan } from "@/lib/thirty-day-plan";
import { habits as habitDefs } from "@/lib/mock-data";

/** A single "you still have to do this" item. */
export interface PendingAction {
  id: string;
  label: string;
  hint?: string;
  href: string;
  emoji: string;
  /** Higher = more urgent. Used for sorting + which one to notify about. */
  priority: number;
  /** Which nav section this rolls up to, for red-dot counts. */
  section: "today" | "tasks" | "work" | "health" | "plan";
}

interface SavedTask {
  id: string;
  title: string;
  priority: string;
}
interface WorkItem {
  id: string;
  title: string;
  done: boolean;
}
interface Meal {
  id: string;
}
interface WeightEntry {
  date: string;
}

const WATER_TARGET = 12; // cups (~3L)

/**
 * Reads live synced state and derives everything still open today. Feeds
 * the notification center, the nav red-dots, and the dashboard "next up"
 * card. All read-only.
 */
export function usePendingActions() {
  const [today, setToday] = useState("ssr");
  const [weekKey, setWeekKey] = useState("ssr-week");
  useEffect(() => {
    setToday(todayKey());
    setWeekKey(weekKeyMonday());
  }, []);

  const [questsDone] = useSyncedState<Record<string, string[]>>("dopamine:quests-done", {});
  const [tasksList] = useSyncedState<SavedTask[]>(`tasks:list:${today}`, []);
  const [completedIds] = useSyncedState<Set<string>>(`tasks:completed:${today}`, new Set<string>(), { serializer: "set" });
  const [workItems] = useSyncedState<WorkItem[]>("work:list", []);
  const [water] = useSyncedState<number>(`water:${today}`, 0);
  const [steps] = useSyncedState<number>(`health:steps:${today}`, 0);
  const [sleep] = useSyncedState<number>(`health:sleep:${today}`, 0);
  const [meals] = useSyncedState<Meal[]>(`health:meals:${today}`, []);
  const [weightHistory] = useSyncedState<WeightEntry[]>("health:weight:history", []);
  const [calls] = useSyncedState<number>(`calls:${today}`, 0);
  const [habitDone] = useSyncedState<Set<string>>(`habits:${weekKey}`, new Set<string>(), { serializer: "set" });

  return useMemo(() => {
    const actions: PendingAction[] = [];
    if (today === "ssr") return { actions, count: 0, sectionCounts: emptySections() };

    const plan = getTodayPlan();

    // ── Calls (the needle-mover) ──
    const callTarget = plan?.coldCallTarget ?? 0;
    if (callTarget > 0 && calls < callTarget) {
      actions.push({
        id: "calls",
        label: `Make your calls — ${calls}/${callTarget} dials`,
        hint: "Owners answer in the morning. Pick up the phone.",
        href: "/agency",
        emoji: "📞",
        priority: 100,
        section: "today",
      });
    }

    // ── Today's tasks ──
    const openTasks = tasksList.filter((t) => !completedIds.has(t.id));
    if (openTasks.length > 0) {
      const p0 = openTasks.find((t) => t.priority === "p0");
      actions.push({
        id: "tasks",
        label: p0 ? `P0: ${p0.title}` : `${openTasks.length} task${openTasks.length === 1 ? "" : "s"} left today`,
        hint: p0 ? "Your one must-do. Knock it out first." : "Close out your list before the day ends.",
        href: "/tasks",
        emoji: "✅",
        priority: p0 ? 95 : 70,
        section: "tasks",
      });
    }

    // ── Daily quests ──
    const quests = questsForDate(today);
    const doneToday = questsDone[today] ?? [];
    const openQuests = quests.filter((q) => !doneToday.includes(q.id));
    if (openQuests.length > 0) {
      actions.push({
        id: "quests",
        label: `${openQuests.length} of ${quests.length} daily quests left`,
        hint: `Next: ${openQuests[0].title} (+${openQuests[0].xp} XP)`,
        href: "/",
        emoji: "👑",
        priority: 80,
        section: "today",
      });
    }

    // ── Work list ──
    const openWork = workItems.filter((w) => !w.done);
    if (openWork.length > 0) {
      actions.push({
        id: "work",
        label: `${openWork.length} item${openWork.length === 1 ? "" : "s"} on your work list`,
        hint: `Next: ${openWork[0].title}`,
        href: "/work",
        emoji: "🗂️",
        priority: 60,
        section: "work",
      });
    }

    // ── Habits not ticked today ──
    const openHabits = habitDefs.filter((h) => !habitDone.has(`${h.id}@${today}`));
    if (openHabits.length > 0) {
      actions.push({
        id: "habits",
        label: `${openHabits.length} habit${openHabits.length === 1 ? "" : "s"} not logged`,
        hint: `Next: ${openHabits[0].name}`,
        href: "/",
        emoji: "🔥",
        priority: 55,
        section: "today",
      });
    }

    // ── Health logging ──
    if (meals.length === 0) {
      actions.push({ id: "meals", label: "No meals logged yet", hint: "Snap a photo with Meal Vision or log it.", href: "/health", emoji: "🍽️", priority: 50, section: "health" });
    }
    if (water < WATER_TARGET) {
      actions.push({ id: "water", label: `Water — ${water}/${WATER_TARGET} cups`, hint: "Stay hydrated. Tap the meter.", href: "/health", emoji: "💧", priority: 30, section: "health" });
    }
    if (steps === 0) {
      actions.push({ id: "steps", label: "Steps not tracked yet", hint: "Turn on auto-tracking so it counts itself.", href: "/health", emoji: "👟", priority: 28, section: "health" });
    }
    if (!weightHistory.some((w) => w.date === today)) {
      actions.push({ id: "weight", label: "Weigh-in not logged", hint: "Same time daily, after Fajr.", href: "/health", emoji: "⚖️", priority: 25, section: "health" });
    }
    if (sleep === 0) {
      actions.push({ id: "sleep", label: "Last night's sleep not logged", hint: "Log it to track recovery.", href: "/health", emoji: "😴", priority: 22, section: "health" });
    }

    actions.sort((a, b) => b.priority - a.priority);

    const sectionCounts = emptySections();
    for (const a of actions) sectionCounts[a.section] += 1;

    return { actions, count: actions.length, sectionCounts };
  }, [today, calls, tasksList, completedIds, questsDone, workItems, habitDone, meals, water, steps, weightHistory, sleep]);
}

function emptySections(): Record<PendingAction["section"], number> {
  return { today: 0, tasks: 0, work: 0, health: 0, plan: 0 };
}
