"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Flame, Plus, Sparkles, Trash2 } from "lucide-react";
import type { Task } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";

const categoryColors = {
  agency: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  health: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  learning: "bg-blue-600/15 text-blue-300 border-blue-600/20",
  personal: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  "deep-work": "bg-blue-600/15 text-blue-300 border-blue-600/20",
};

const priorityColors = {
  p0: "text-rose-400",
  p1: "text-amber-400",
  p2: "text-sky-400",
  p3: "text-slate-500",
};

type SavedTask = Omit<Task, "completed">;

const CATEGORIES: Task["category"][] = [
  "deep-work",
  "agency",
  "health",
  "learning",
  "personal",
];
const PRIORITIES: Task["priority"][] = ["p0", "p1", "p2", "p3"];

export function TodayTasks({ compact = false }: { compact?: boolean }) {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);

  const [tasksList, setTasksList] = useSyncedState<SavedTask[]>(
    `tasks:list:${today}`,
    []
  );
  const [completedIds, setCompletedIds] = useSyncedState<Set<string>>(
    `tasks:completed:${today}`,
    new Set<string>(),
    { serializer: "set" }
  );

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<SavedTask>({
    id: "",
    title: "",
    category: "deep-work",
    priority: "p1",
    estimated: 30,
    difficulty: 3,
    energy: "med",
  });

  const tasks = useMemo<Task[]>(
    () =>
      tasksList.map((t) => ({ ...t, completed: completedIds.has(t.id) })),
    [tasksList, completedIds]
  );

  const toggleTask = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeTask = (id: string) => {
    setTasksList((prev) => prev.filter((t) => t.id !== id));
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const startAdd = () => {
    setDraft({
      id: "",
      title: "",
      category: "deep-work",
      priority: "p1",
      estimated: 30,
      difficulty: 3,
      energy: "med",
    });
    setAdding(true);
  };

  const commitAdd = () => {
    const title = draft.title.trim();
    if (!title) return;
    const newTask: SavedTask = {
      ...draft,
      title,
      id: `t-${Date.now()}`,
    };
    setTasksList((prev) => [newTask, ...prev]);
    setAdding(false);
  };

  const visible = compact ? tasks.slice(0, 5) : tasks;

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Today's Tasks</h2>
            <p className="text-[10px] text-slate-500">
              {tasks.filter((t) => t.completed).length}/{tasks.length} complete
            </p>
          </div>
          <button
            data-add-task-trigger
            onClick={startAdd}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Plus className="h-3 w-3" /> Add task
          </button>
        </div>
      )}

      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-2 rounded-2xl border border-blue-500/30 bg-blue-950/30 p-3"
          >
            <input
              autoFocus
              value={draft.title}
              onChange={(e) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") commitAdd();
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="What needs to ship?"
              className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    category: e.target.value as Task["category"],
                  }))
                }
                className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1.5 text-xs text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={draft.priority}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    priority: e.target.value as Task["priority"],
                  }))
                }
                className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1.5 text-xs text-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-slate-900">
                    {p.toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={5}
                step={5}
                value={draft.estimated}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    estimated: Math.max(5, Number(e.target.value) || 5),
                  }))
                }
                className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1.5 text-xs text-white"
                placeholder="Minutes"
              />
              <select
                value={draft.difficulty}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    difficulty: Number(e.target.value) as Task["difficulty"],
                  }))
                }
                className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-1.5 text-xs text-white"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n} className="bg-slate-900">
                    Diff {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setAdding(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={commitAdd}
                disabled={!draft.title.trim()}
                className="rounded-lg bg-gradient-to-br from-blue-700 to-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(30,58,138,0.4)] disabled:opacity-40"
              >
                <Plus className="mr-1 inline h-3 w-3" /> Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tasks.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
          <div className="text-3xl">📋</div>
          <div className="mt-2 text-sm font-medium text-white">
            No tasks yet — make today count
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Add at least one P0 and one health task. The AI will suggest the rest.
          </div>
          <button
            onClick={startAdd}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-blue-700 to-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_4px_15px_rgba(30,58,138,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(59,130,246,0.55)]"
          >
            <Plus className="h-3 w-3" /> Add your first task
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {visible.map((task, i) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all hover:border-white/[0.08] hover:bg-white/[0.03]",
              task.completed && "opacity-60"
            )}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition-all",
                task.completed
                  ? "border-emerald-500/40 bg-emerald-500/20"
                  : "border-white/[0.1] hover:border-blue-400/40 hover:bg-blue-500/10"
              )}
            >
              {task.completed && <Check className="h-3.5 w-3.5 text-emerald-300" />}
            </button>

            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "truncate text-sm font-medium text-white",
                  task.completed && "line-through text-slate-500"
                )}
              >
                {task.title}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 uppercase tracking-wider",
                    categoryColors[task.category]
                  )}
                >
                  {task.category}
                </span>
                <span className={cn("font-mono font-bold", priorityColors[task.priority])}>
                  {task.priority.toUpperCase()}
                </span>
                <span className="flex items-center gap-0.5 text-slate-500">
                  <Clock className="h-2.5 w-2.5" />
                  {task.estimated}m
                </span>
                {task.deadline && (
                  <span className="font-mono text-amber-400">@ {task.deadline}</span>
                )}
                {task.streak && task.streak > 0 && (
                  <span className="flex items-center gap-0.5 text-orange-400">
                    <Flame className="h-2.5 w-2.5" />
                    {task.streak}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 w-1 rounded-full",
                    i < task.difficulty ? "bg-blue-400" : "bg-white/[0.06]"
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => removeTask(task.id)}
              aria-label="Remove task"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {compact && tasks.length > 5 && (
        <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.08] py-2.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.03] hover:text-white">
          <Sparkles className="h-3 w-3" />
          AI suggests 4 more for today
        </button>
      )}
    </div>
  );
}
