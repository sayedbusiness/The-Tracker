"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { weeklyProductivity } from "@/lib/mock-data";

export function ProductivityChart() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={weeklyProductivity}
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
