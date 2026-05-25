"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, X } from "lucide-react";
import { aiInsights } from "@/lib/mock-data";
import { useSyncedState } from "@/hooks/use-synced-state";
import { cn } from "@/lib/utils";

const accents = {
  pattern: "from-blue-600/20 to-blue-600/0 border-blue-600/20 text-blue-300",
  warning: "from-amber-500/20 to-orange-500/0 border-amber-500/20 text-amber-300",
  win: "from-emerald-500/20 to-teal-500/0 border-emerald-500/20 text-emerald-300",
  challenge: "from-sky-500/20 to-blue-500/0 border-sky-500/20 text-sky-300",
};

// Where each insight should send the user when they tap.
const ROUTES: Record<string, string> = {
  challenge: "/discipline",
  pattern: "/insights",
  warning: "/discipline",
  win: "/insights",
};

export function AiInsights() {
  const router = useRouter();
  const [dismissed, setDismissed] = useSyncedState<Set<string>>(
    "insights:dismissed",
    new Set<string>(),
    { serializer: "set" }
  );
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);

  const visible = useMemo(
    () => aiInsights.filter((i) => !dismissed.has(i.id)),
    [dismissed]
  );

  const dismiss = (id: string) =>
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const resetAll = () => setDismissed(new Set());

  const open = (insight: (typeof aiInsights)[number]) => {
    const route = ROUTES[insight.type] ?? "/insights";
    router.push(route);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 shadow-[0_0_20px_rgba(30,58,138,0.5)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Insights</div>
            <div className="text-[10px] text-slate-500">
              {now ? `Updated ${now}` : "Live"}
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/insights")}
          className="text-[10px] uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-white"
        >
          View all
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((insight, i) => (
            <motion.div
              key={insight.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.96 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-r p-3 transition-transform hover:translate-x-0.5",
                accents[insight.type as keyof typeof accents]
              )}
            >
              <button
                onClick={() => open(insight)}
                className="flex w-full items-start gap-3 text-left"
              >
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
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(insight.id);
                }}
                aria-label="Dismiss"
                className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-slate-500 opacity-0 transition-all hover:bg-white/[0.06] hover:text-white group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-xs text-slate-400">
            All caught up.{" "}
            <button
              onClick={resetAll}
              className="text-blue-300 hover:text-blue-200"
            >
              Restore dismissed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
