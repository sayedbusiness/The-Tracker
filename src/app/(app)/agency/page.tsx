"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Sparkles,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  clients,
  pipeline,
  campaigns,
  agencyRevenue,
  sales,
  type PipelineStage,
} from "@/lib/mock-data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatCompact } from "@/lib/utils";

const stageOrder: PipelineStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
];

const stageLabels: Record<PipelineStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const stageColors: Record<PipelineStage, string> = {
  lead: "border-slate-500/20 from-slate-500/10",
  qualified: "border-cyan-500/20 from-cyan-500/10",
  proposal: "border-violet-500/20 from-violet-500/10",
  negotiation: "border-amber-500/20 from-amber-500/10",
  won: "border-emerald-500/20 from-emerald-500/10",
  lost: "border-rose-500/20 from-rose-500/10",
};

const campaignStatusColors = {
  planning: "default",
  running: "violet",
  review: "amber",
  complete: "emerald",
} as const;

export default function AgencyPage() {
  const totalMRR = clients.reduce((sum, c) => sum + c.mrr, 0);
  const mrrGrowth =
    ((agencyRevenue[agencyRevenue.length - 1].mrr -
      agencyRevenue[agencyRevenue.length - 2].mrr) /
      agencyRevenue[agencyRevenue.length - 2].mrr) *
    100;

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader
        eyebrow="Apex Growth Corp · Command Center"
        title={
          <>
            Run the agency like a <span className="gradient-text">machine.</span>
          </>
        }
        subtitle="One operational picture: clients, pipeline, campaigns, and revenue. The AI advisor flags risks and scaling opportunities daily."
        icon={Briefcase}
        accent="emerald"
        actions={
          <>
            <Button variant="secondary">
              <Sparkles className="h-4 w-4" /> AI advisor
            </Button>
            <Button>
              <Plus className="h-4 w-4" /> New deal
            </Button>
          </>
        }
      />

      {/* KPI strip */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi
          icon={DollarSign}
          label="MRR"
          value={formatCurrency(totalMRR)}
          delta={mrrGrowth}
          accent="emerald"
        />
        <Kpi
          icon={TrendingUp}
          label="Pipeline value"
          value={formatCurrency(sales.pipelineValue)}
          delta={28}
          accent="violet"
        />
        <Kpi
          icon={Target}
          label="Weighted pipe"
          value={formatCurrency(sales.weightedPipeline)}
          sub="probability-adjusted"
          accent="cyan"
        />
        <Kpi
          icon={Calendar}
          label="Calls booked"
          value={`${sales.appointments}`}
          delta={
            ((sales.appointments - sales.appointmentsLastMonth) /
              sales.appointmentsLastMonth) *
            100
          }
          accent="amber"
        />
        <Kpi
          icon={Users}
          label="Active clients"
          value={`${clients.filter((c) => c.status === "active").length}`}
          sub={`${clients.length} total`}
          accent="rose"
        />
      </section>

      {/* Revenue chart + AI advisor */}
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Revenue trajectory · 7 months
              </h3>
              <p className="text-[10px] text-slate-500">
                MRR growth · {formatCurrency(58000)} → {formatCurrency(95500)} ·{" "}
                <b className="text-emerald-300">+64.6%</b>
              </p>
            </div>
            <Badge variant="emerald">+{mrrGrowth.toFixed(1)}% MoM</Badge>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={agencyRevenue}>
                <defs>
                  <linearGradient id="g-mrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6e6e7a", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6e6e7a", fontSize: 10 }}
                  tickFormatter={(v) => formatCompact(v)}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                  contentStyle={{
                    background: "rgba(20,20,28,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#g-mrr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elevated relative overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  AI Business Advisor
                </div>
                <div className="text-[10px] text-slate-500">
                  Updated 18 minutes ago
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <Insight
                tone="warn"
                title="Northwind Labs health: 72"
                body="Down from 88 last month. Two missed reporting cadences. Schedule a strategy call this week."
              />
              <Insight
                tone="win"
                title="Hire #4 unlocks Q3"
                body="At current velocity you'll hit ceiling at $108k MRR. Adding a paid media specialist projects +$22k by Sept."
              />
              <Insight
                tone="info"
                title="Repeat the Helios playbook"
                body="The case study converted 3 deals at avg $26k. Productize it as your tier-2 offer."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Kanban */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Sales pipeline</h2>
            <p className="text-[10px] text-slate-500">
              Drag deals between stages · AI scores probability automatically
            </p>
          </div>
          <Button variant="secondary" size="sm">
            <Plus className="h-3 w-3" /> Add deal
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          {stageOrder.map((stage) => {
            const deals = pipeline.filter((d) => d.stage === stage);
            const total = deals.reduce((s, d) => s + d.value, 0);
            return (
              <div
                key={stage}
                className={`rounded-2xl border bg-gradient-to-b ${stageColors[stage]} to-transparent p-3`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-white">
                      {stageLabels[stage]}
                    </div>
                    <div className="text-[10px] tabular text-slate-500">
                      {deals.length} · {formatCurrency(total)}
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-white">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {deals.map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ y: -2 }}
                      className="cursor-grab rounded-xl border border-white/[0.06] bg-black/40 p-3 backdrop-blur-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-semibold text-white">
                          {d.company}
                        </div>
                        <button className="text-slate-500 hover:text-white">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500">
                        {d.contact}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-bold tabular gradient-text">
                          {formatCurrency(d.value)}
                        </span>
                        <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] tabular text-slate-300">
                          {d.probability}%
                        </span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400"
                          style={{ width: `${d.probability}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clients + Campaigns */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Clients */}
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Active clients</h3>
            <Badge variant="emerald">
              {formatCurrency(totalMRR)} MRR
            </Badge>
          </div>
          <div className="space-y-2">
            {clients.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-sm font-bold text-emerald-200">
                  {c.logo}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {c.name}
                    </span>
                    {c.status === "onboarding" && (
                      <Badge variant="amber">onboarding</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-500">
                    {c.owner} · since {c.since}
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className={`h-full ${
                        c.health > 85
                          ? "bg-emerald-400"
                          : c.health > 70
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                      style={{ width: `${c.health}%` }}
                    />
                  </div>
                  <span className="w-7 text-right text-[10px] tabular text-slate-400">
                    {c.health}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular text-white">
                    {formatCurrency(c.mrr)}
                  </div>
                  <div className="text-[9px] text-slate-500">/ mo</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Campaigns */}
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Active campaigns</h3>
            <Button variant="ghost" size="sm">
              View all <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {campaigns.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ x: 2 }}
                className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {c.client} · {c.channel}
                    </div>
                  </div>
                  <Badge variant={campaignStatusColors[c.status]}>
                    {c.status}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <div className="text-slate-500">Budget</div>
                    <div className="font-semibold tabular text-white">
                      {formatCurrency(c.budget)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Spent</div>
                    <div className="font-semibold tabular text-white">
                      {formatCurrency(c.spent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Performance</div>
                    <div
                      className={`font-semibold tabular ${
                        c.performance >= 120
                          ? "text-emerald-300"
                          : c.performance >= 90
                            ? "text-amber-300"
                            : "text-rose-300"
                      }`}
                    >
                      {c.performance > 0 ? `${c.performance}%` : "—"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                    style={{ width: `${(c.spent / c.budget) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  sub,
  accent,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  delta?: number;
  sub?: string;
  accent: "emerald" | "violet" | "cyan" | "amber" | "rose";
}) {
  const colors = {
    emerald: "from-emerald-500 to-teal-500",
    violet: "from-violet-500 to-indigo-500",
    cyan: "from-cyan-500 to-blue-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
  };
  return (
    <div className="surface-card rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div
          className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${colors[accent]}`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        {typeof delta === "number" && (
          <div
            className={`flex items-center gap-0.5 text-[10px] font-bold ${
              delta >= 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular text-white">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

function Insight({
  tone,
  title,
  body,
}: {
  tone: "warn" | "win" | "info";
  title: string;
  body: string;
}) {
  const tones = {
    warn: { border: "border-amber-500/20", bg: "bg-amber-500/[0.04]", icon: "⚠️" },
    win: { border: "border-emerald-500/20", bg: "bg-emerald-500/[0.04]", icon: "🚀" },
    info: { border: "border-cyan-500/20", bg: "bg-cyan-500/[0.04]", icon: "💡" },
  };
  const t = tones[tone];
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-3`}>
      <div className="flex items-start gap-2">
        <div className="text-base">{t.icon}</div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white">{title}</div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}
