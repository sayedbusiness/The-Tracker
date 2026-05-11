"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Flame, Plus, Sparkles } from "lucide-react";
import { tasks as initialTasks, type Task } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const categoryColors = {
  agency: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  health: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  learning: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  personal: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  "deep-work": "bg-violet-500/15 text-violet-300 border-violet-500/20",
};

const priorityColors = {
  p0: "text-rose-400",
  p1: "text-amber-400",
  p2: "text-cyan-400",
  p3: "text-slate-500",
};

export function TodayTasks({ compact = false }: { compact?: boolean }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
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
          <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white">
            <Plus className="h-3 w-3" /> Add task
          </button>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
          <div className="text-3xl">📋</div>
          <div className="mt-2 text-sm font-medium text-white">
            No tasks yet — make today count
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Add at least one P0 and one health task. The AI will suggest the rest.
          </div>
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_4px_15px_rgba(124,58,237,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(124,58,237,0.55)]">
            <Plus className="h-3 w-3" /> Add your first task
          </button>
        </div>
      )}

      {visible.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
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
                : "border-white/[0.1] hover:border-violet-400/40 hover:bg-violet-500/10"
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
                  i < task.difficulty ? "bg-violet-400" : "bg-white/[0.06]"
                )}
              />
            ))}
          </div>
        </motion.div>
      ))}

      {compact && tasks.length > 5 && (
        <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.08] py-2.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.03] hover:text-white">
          <Sparkles className="h-3 w-3" />
          AI suggests 4 more for today
        </button>
      )}
    </div>
  );
}
