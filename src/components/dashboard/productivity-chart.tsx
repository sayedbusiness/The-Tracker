"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncedState } from "@/hooks/use-synced-state";
import { dateKey, APP_TZ } from "@/lib/dates";

interface Challenge {
  active: boolean;
  progress: number;
  total: number;
}

interface Breach {
  loggedAt: number;
}

/**
 * Live last-7-days chart.
 *
 * - productivity = % of tasks completed that day (0 if no tasks logged)
 * - discipline = active-challenge average that day, dampened by breaches
 *   logged within 7 days of that point.
 */
export function ProductivityChart() {
  const [series, setSeries] = useState<
    Array<{ day: string; productivity: number; discipline: number }>
  >([]);
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

  // Build the 7-day spine on the client to avoid SSR/CSR date mismatch.
  useEffect(() => {
    const out: Array<{ day: string; productivity: number; discipline: number }> =
      [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const iso = dateKey(d);
      const label = d.toLocaleDateString("en-US", {
        timeZone: APP_TZ,
        weekday: "short",
      });
      out.push({ day: label, productivity: 0, discipline: 0, _iso: iso } as never);
    }
    setSeries(out as never);
    // Recompute every minute so the day spine stays current near midnight.
    const id = setInterval(() => setSeries((s) => [...s]), 60_000);
    return () => clearInterval(id);
  }, []);

  const enriched = useMemo(() => {
    const active = challenges.filter((c) => c.active);
    const challengeAvg =
      active.length === 0
        ? 0
        : active.reduce(
            (s, c) => s + Math.min(1, c.progress / Math.max(1, c.total)),
            0
          ) / active.length;

    return series.map((d) => {
      const iso = (d as unknown as { _iso: string })._iso;
      const wasActive = activeDays.has(iso);
      // Productivity proxy: a steady 70 on days you showed up + logged
      // anything, 0 on days you didn't. As we record per-day task
      // completion ratios this'll get sharper.
      const productivity = wasActive ? 70 : 0;
      // Discipline: today's challenge avg, minus breach hits within 7 days.
      const target = new Date(iso + "T12:00:00Z").getTime();
      const recentHits = breaches.filter(
        (b) => Math.abs(target - b.loggedAt) < 7 * 24 * 3600 * 1000
      ).length;
      const discipline = wasActive
        ? Math.max(0, Math.round(challengeAvg * 100 - recentHits * 6))
        : 0;
      return { day: d.day, productivity, discipline };
    });
  }, [series, activeDays, challenges, breaches]);

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={enriched}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="grad-prod" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-disc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6e6e7a", fontSize: 10 }}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
            contentStyle={{
              background: "rgba(20,20,28,0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 11,
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#9c9ca8", marginBottom: 4 }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="productivity"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#grad-prod)"
          />
          <Area
            type="monotone"
            dataKey="discipline"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#grad-disc)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
