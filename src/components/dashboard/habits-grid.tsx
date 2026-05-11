"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { habits } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const colorMap = {
  emerald: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30 text-emerald-300",
  indigo: "from-blue-600/20 to-blue-600/0 border-blue-600/30 text-blue-300",
  violet: "from-blue-600/20 to-blue-600/0 border-blue-600/30 text-blue-300",
  cyan: "from-sky-500/20 to-sky-500/0 border-sky-500/30 text-sky-300",
  rose: "from-rose-500/20 to-rose-500/0 border-rose-500/30 text-rose-300",
  amber: "from-amber-500/20 to-amber-500/0 border-amber-500/30 text-amber-300",
};

export function HabitsGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {habits.map((habit, i) => (
        <motion.button
          key={habit.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -2 }}
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-3 text-left transition-all",
            colorMap[habit.color as keyof typeof colorMap]
          )}
        >
          <div className="flex items-start justify-between">
            <div className="text-2xl">{habit.icon}</div>
            <div className="flex items-center gap-0.5 text-[10px] font-bold tabular">
              <Flame className="h-3 w-3" />
              {habit.streak}
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-white">{habit.name}</div>
          <div className="mt-1 flex items-center gap-0.5">
            {Array.from({ length: habit.target }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < habit.done ? "bg-current" : "bg-white/[0.06]"
                )}
              />
            ))}
          </div>
          <div className="mt-1.5 text-[9px] uppercase tracking-wider opacity-60">
            {habit.done}/{habit.target} this week
          </div>
        </motion.button>
      ))}
    </div>
  );
}
