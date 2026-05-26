"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { useDopamine } from "./dopamine-provider";
import { xpForLevel, levelFromXP } from "@/lib/dopamine";

/**
 * Always-visible XP/level chip + combo flame. Sits in the top bar and
 * pulses every time it ticks up.
 */
export function XPRail() {
  const { xp, level, progress, tierName, tierGradient, tierGlow, combo } =
    useDopamine();

  const xpInLevel = xp - xpForLevel(level - 1);
  const xpForNext = xpForLevel(level) - xpForLevel(level - 1);

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            key={`combo-${combo}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold tabular ${
              combo >= 5
                ? "border-amber-400/50 bg-amber-500/15 text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.4)]"
                : "border-orange-400/30 bg-orange-500/10 text-orange-200"
            }`}
          >
            <Flame className="h-3 w-3" />
            {combo}× combo
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={`xp-${level}`}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/30 pl-1 pr-3 py-1"
      >
        <div
          className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${tierGradient} text-[11px] font-black text-white shadow-[0_0_14px_var(--g)]`}
          style={{ ["--g" as string]: tierGlow }}
        >
          {level}
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/70">
            <Zap className="h-2.5 w-2.5" />
            <span>{tierName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative h-1 w-20 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tierGradient}`}
                initial={false}
                animate={{ width: `${progress * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 28 }}
              />
            </div>
            <span className="text-[9px] tabular text-white/50">
              {xpInLevel}/{xpForNext}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
