"use client";

import { Bell, Search, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { user, todayMetrics } from "@/lib/mock-data";
import { getGreeting, getDayLabel } from "@/lib/utils";

export function TopBar({ onOpenCommand }: { onOpenCommand: () => void }) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-white/[0.04] bg-black/30 backdrop-blur-2xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <div className="hidden flex-1 md:block">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {getDayLabel()}
          </div>
          <div className="text-sm font-medium text-slate-200">
            {getGreeting()}, {user.name}.
          </div>
        </div>

        <button
          onClick={onOpenCommand}
          className="flex flex-1 items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.05] md:max-w-md md:flex-initial md:px-4"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search tasks, clients, insights…</span>
            <span className="sm:hidden">Search…</span>
          </span>
          <kbd className="hidden rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] md:inline">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 md:flex">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold tabular text-amber-200">
              {user.streak}
            </span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-xl border border-blue-600/20 bg-blue-600/10 px-2.5 py-1.5 md:flex">
            <Zap className="h-3.5 w-3.5 text-blue-300" />
            <span className="text-xs font-semibold tabular text-blue-200">
              {user.disciplineScore}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-black" />
          </Button>
        </div>
      </div>
    </header>
  );
}
