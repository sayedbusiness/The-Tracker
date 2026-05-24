"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Search, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { user } from "@/lib/mock-data";
import { getGreeting, getDayLabel, todayKey } from "@/lib/dates";
import { useSyncedState } from "@/hooks/use-synced-state";

interface Challenge {
  active: boolean;
  progress: number;
  total: number;
}

interface Breach {
  loggedAt: number;
}

export function TopBar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [dayLabel, setDayLabel] = useState<string | null>(null);
  const [today, setToday] = useState<string>("ssr");

  useEffect(() => {
    setGreeting(getGreeting());
    setDayLabel(getDayLabel());
    setToday(todayKey());
  }, []);

  // Live streak from activeDays + live discipline from challenges/breaches.
  const [activeDays] = useSyncedState<Set<string>>(
    "active-days",
    new Set<string>(),
    { serializer: "set" }
  );
  const [challenges] = useSyncedState<Challenge[]>(
    "discipline:challenges",
    []
  );
  const [breaches] = useSyncedState<Breach[]>("discipline:breaches", []);

  const streak = useMemo(() => {
    const days = Array.from(activeDays).sort();
    if (days.length === 0) return 0;
    const dayMs = 24 * 3600 * 1000;
    const asDate = (s: string) => new Date(`${s}T12:00:00Z`).getTime();
    const last = days[days.length - 1];
    const gap = (asDate(today) - asDate(last)) / dayMs;
    if (gap > 1) return 0;
    let cur = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (asDate(days[i + 1]) - asDate(days[i]) === dayMs) cur++;
      else break;
    }
    return cur;
  }, [activeDays, today]);

  const discipline = useMemo(() => {
    const active = challenges.filter((c) => c.active);
    if (active.length === 0) return 0;
    const avg =
      active.reduce(
        (s, c) => s + Math.min(1, c.progress / Math.max(1, c.total)),
        0
      ) / active.length;
    const recent = breaches.filter(
      (b) => Date.now() - b.loggedAt < 7 * 24 * 3600 * 1000
    ).length;
    return Math.max(0, Math.round(avg * 100 - recent * 8));
  }, [challenges, breaches]);

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/[0.04] bg-black/30 backdrop-blur-2xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-16 items-center gap-4 px-4 lg:px-8">
        <div className="hidden flex-1 md:block" suppressHydrationWarning>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {dayLabel ?? " "}
          </div>
          <div className="text-sm font-medium text-slate-200">
            {greeting ? `${greeting}, ${user.name}.` : " "}
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
              {streak}
            </span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-xl border border-blue-600/20 bg-blue-600/10 px-2.5 py-1.5 md:flex">
            <Zap className="h-3.5 w-3.5 text-blue-300" />
            <span className="text-xs font-semibold tabular text-blue-200">
              {discipline}
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
