"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { aiInsights } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const accents = {
  pattern: "from-violet-500/20 to-indigo-500/0 border-violet-500/20 text-violet-300",
  warning: "from-amber-500/20 to-orange-500/0 border-amber-500/20 text-amber-300",
  win: "from-emerald-500/20 to-teal-500/0 border-emerald-500/20 text-emerald-300",
  challenge: "from-cyan-500/20 to-blue-500/0 border-cyan-500/20 text-cyan-300",
};

export function AiInsights() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Insights</div>
            <div className="text-[10px] text-slate-500">Updated 4 minutes ago</div>
          </div>
        </div>
        <button className="text-[10px] uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-white">
          View all
        </button>
      </div>

      <div className="space-y-2">
        {aiInsights.map((insight, i) => (
          <motion.button
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-r p-3 text-left transition-transform hover:translate-x-0.5",
              accents[insight.type as keyof typeof accents]
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-lg">{insight.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">
                  {insight.title}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-slate-400">
                  {insight.body}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-white/30"
                      style={{ width: `${insight.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] tabular text-slate-500">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
