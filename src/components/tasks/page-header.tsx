"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  accent = "violet",
  actions,
}: {
  eyebrow: string;
  title: string | React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: "violet" | "emerald" | "amber" | "cyan" | "rose" | "indigo";
  actions?: React.ReactNode;
}) {
  const accents = {
    violet: "from-blue-600 to-blue-600 shadow-[0_0_30px_rgba(30,58,138,0.45)]",
    emerald: "from-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.45)]",
    amber: "from-amber-500 to-orange-500 shadow-[0_0_30px_rgba(245,158,11,0.45)]",
    cyan: "from-sky-500 to-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.45)]",
    rose: "from-rose-500 to-pink-500 shadow-[0_0_30px_rgba(244,63,94,0.45)]",
    indigo: "from-blue-600 to-blue-600 shadow-[0_0_30px_rgba(29,78,216,0.45)]",
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br",
              accents[accent]
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {eyebrow}
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </motion.header>
  );
}
