"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricTile({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  progress,
  accent = "violet",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  progress?: number;
  accent?: "violet" | "emerald" | "cyan" | "amber" | "rose" | "indigo";
}) {
  const accents = {
    violet: "from-blue-600 to-blue-600",
    emerald: "from-emerald-500 to-teal-500",
    cyan: "from-sky-500 to-blue-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
    indigo: "from-blue-600 to-blue-600",
  };
  const glows = {
    violet: "shadow-[0_0_24px_rgba(30,58,138,0.25)]",
    emerald: "shadow-[0_0_24px_rgba(16,185,129,0.25)]",
    cyan: "shadow-[0_0_24px_rgba(59,130,246,0.25)]",
    amber: "shadow-[0_0_24px_rgba(245,158,11,0.25)]",
    rose: "shadow-[0_0_24px_rgba(244,63,94,0.25)]",
    indigo: "shadow-[0_0_24px_rgba(29,78,216,0.25)]",
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="surface-card group relative overflow-hidden rounded-2xl p-4"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20 [&]:bg-gradient-to-br" />
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br",
            accents[accent],
            glows[accent]
          )}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              delta >= 0
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-rose-500/10 text-rose-300"
            )}
          >
            {delta >= 0 ? (
              <ArrowUp className="h-2.5 w-2.5" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5" />
            )}
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular text-white">{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {typeof progress === "number" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className={cn("h-full rounded-full bg-gradient-to-r", accents[accent])}
          />
        </div>
      )}
    </motion.div>
  );
}
