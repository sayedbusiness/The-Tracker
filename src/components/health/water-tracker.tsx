"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Droplet, Plus, Minus } from "lucide-react";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import { useDopamine } from "@/components/dopamine/dopamine-provider";

/** Track water in 250mL cups; 12 cups = 3L target for cutting. */
const CUP_ML = 250;
const TARGET_L = 3;
const TARGET_CUPS = (TARGET_L * 1000) / CUP_ML;

export function WaterTracker({ compact = false }: { compact?: boolean }) {
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);

  const [cups, setCups] = useSyncedState<number>(`water:${today}`, 0);
  const { hit } = useDopamine();

  const addCup = (ev?: { clientX: number; clientY: number }) => {
    setCups((c) => c + 1);
    hit("water", {
      label: "+250 mL",
      x: ev?.clientX,
      y: ev?.clientY,
    });
  };

  // Quick-action support: the command palette dispatches apex:water-cup
  // to add one cup from anywhere in the app.
  useEffect(() => {
    const onCup = () => addCup();
    window.addEventListener("apex:water-cup", onCup);
    return () => window.removeEventListener("apex:water-cup", onCup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liters = (cups * CUP_ML) / 1000;
  const pct = Math.min(100, (cups / TARGET_CUPS) * 100);

  return (
    <div className={compact ? "" : "surface-card rounded-2xl p-5"}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
            <Droplet className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Water</div>
            <div className="text-[10px] text-slate-500">3 L target · cutting</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular text-white">
            {liters.toFixed(2)}<span className="text-xs text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500">
            {cups} / {TARGET_CUPS} cups
          </div>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      </div>

      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: TARGET_CUPS }).map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              if (i < cups) {
                setCups(i);
              } else {
                setCups(i + 1);
                hit("water", { label: "+250 mL", x: e.clientX, y: e.clientY });
              }
            }}
            aria-label={`Toggle cup ${i + 1}`}
            className={`aspect-square rounded-md border transition-all ${
              i < cups
                ? "border-sky-400/40 bg-sky-500/30 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                : "border-white/[0.06] bg-white/[0.02] hover:border-sky-400/30 hover:bg-sky-500/10"
            }`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => setCups(Math.max(0, cups - 1))}
          disabled={cups === 0}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/[0.06] disabled:opacity-40"
        >
          <Minus className="h-3 w-3" /> Undo
        </button>
        <button
          onClick={(e) => addCup({ clientX: e.clientX, clientY: e.clientY })}
          className="flex flex-[2] items-center justify-center gap-1 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 py-1.5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)] transition-all hover:shadow-[0_6px_18px_rgba(59,130,246,0.55)]"
        >
          <Plus className="h-3 w-3" /> +250 mL
        </button>
      </div>
    </div>
  );
}
