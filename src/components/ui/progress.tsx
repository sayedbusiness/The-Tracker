"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  glow?: boolean;
}

export function Progress({ value, max = 100, className, barClassName, glow }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]",
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400",
          glow && "shadow-[0_0_12px_rgba(124,58,237,0.6)]",
          barClassName
        )}
      />
    </div>
  );
}

export function RingProgress({
  value,
  size = 120,
  stroke = 8,
  label,
  color = "violet",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: "violet" | "emerald" | "cyan" | "amber" | "rose";
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, value) / 100) * circ;

  const gradients: Record<typeof color, [string, string]> = {
    violet: ["#7c3aed", "#06b6d4"],
    emerald: ["#10b981", "#34d399"],
    cyan: ["#06b6d4", "#22d3ee"],
    amber: ["#f59e0b", "#fbbf24"],
    rose: ["#f43f5e", "#fb7185"],
  };
  const [from, to] = gradients[color];
  const id = `ring-${color}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${from})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular text-white">{Math.round(value)}</span>
        {label && (
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</span>
        )}
      </div>
    </div>
  );
}
