"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Sparkles,
  Plus,
  X,
  Trash2,
  Phone,
  MessageSquare,
  History,
  GripVertical,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LeadImporter,
  type ImportedLead,
} from "@/components/agency/lead-importer";
import { Dialer, type CallActivity } from "@/components/agency/dialer";
import { SmsComposer, type SmsActivity } from "@/components/agency/sms-composer";
import {
  agencyRevenue,
  sales,
  type PipelineStage,
  type CampaignStatus,
} from "@/lib/mock-data";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { useSyncedState } from "@/hooks/use-synced-state";
import { useDopamine } from "@/components/dopamine/dopamine-provider";
import type { Profile } from "@/lib/auth/types";

type Deal = {
  id: string;
  company: string;
  contact: string;
  phone?: string;
  value: number;
  stage: PipelineStage;
  probability: number;
  closeDate: string;
  source: string;
};

type Activity = (CallActivity | SmsActivity) & { contact?: string };

type Client = {
  id: string;
  name: string;
  logo: string;
  mrr: number;
  status: "active" | "onboarding";
  health: number;
  owner: string;
  since: string;
};

type Campaign = {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
  channel: string;
  performance: number;
  endsAt: string;
};

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
  qualified: "border-sky-500/20 from-sky-500/10",
  proposal: "border-blue-600/20 from-blue-600/10",
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
  const [pipeline, setPipeline] = useSyncedState<Deal[]>("agency:pipeline", []);
  const [clients, setClients] = useSyncedState<Client[]>("agency:clients", []);
  const [campaigns, setCampaigns] = useSyncedState<Campaign[]>(
    "agency:campaigns",
    []
  );
  const [activity, setActivity] = useSyncedState<Activity[]>("agency:activity", []);
  const [profile] = useSyncedState<Profile>("profile", {});
  // Deals that have already paid out win-XP — so a deal can't be farmed by
  // moving it out of and back into "Won".
  const [wonRewarded, setWonRewarded] = useSyncedState<Set<string>>(
    "agency:won-rewarded",
    new Set<string>(),
    { serializer: "set" }
  );
  const { hit } = useDopamine();

  const businessName = profile.businessName?.trim();

  const [composer, setComposer] = useState<null | "deal" | "client" | "campaign">(
    null
  );
  const [draftStage, setDraftStage] = useState<PipelineStage>("lead");
  const [importerOpen, setImporterOpen] = useState(false);
  const [smsTarget, setSmsTarget] = useState<{ to: string; contact?: string } | null>(
    null
  );

  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(
    null
  );

  const logActivity = (a: Activity) =>
    setActivity((prev) => [a, ...prev].slice(0, 200));

  const callLead = (deal: Deal) => {
    if (!deal.phone) return;
    window.dispatchEvent(
      new CustomEvent("apex:dial", { detail: { number: deal.phone } })
    );
    document
      .getElementById("apex-dialer")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const textLead = (deal: Deal) =>
    setSmsTarget({ to: deal.phone || "", contact: deal.contact || deal.company });

  // Auto-open composer via command palette: ?add=deal|client|campaign or ?import=1.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const add = params.get("add");
    if (add === "deal" || add === "client" || add === "campaign") {
      setComposer(add);
    }
    if (params.get("import") === "1") {
      setImporterOpen(true);
    }
    if (params.get("dialer") === "1") {
      setTimeout(
        () =>
          document
            .getElementById("apex-dialer")
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        120
      );
    }
    if (add || params.get("import") || params.get("dialer")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("add");
      url.searchParams.delete("import");
      url.searchParams.delete("dialer");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const totalMRR = useMemo(
    () => clients.reduce((sum, c) => sum + c.mrr, 0),
    [clients]
  );
  const pipelineValue = useMemo(
    () =>
      pipeline
        .filter((d) => d.stage !== "lost" && d.stage !== "won")
        .reduce((s, d) => s + d.value, 0),
    [pipeline]
  );
  const weightedPipeline = useMemo(
    () =>
      pipeline
        .filter((d) => d.stage !== "lost" && d.stage !== "won")
        .reduce((s, d) => s + (d.value * d.probability) / 100, 0),
    [pipeline]
  );
  const callsBooked = sales.appointments;

  const prevMRR = agencyRevenue[agencyRevenue.length - 2]?.mrr ?? 0;
  const currMRR = totalMRR;
  const mrrGrowth =
    prevMRR === 0 ? (currMRR > 0 ? 100 : 0) : ((currMRR - prevMRR) / prevMRR) * 100;

  const advanceDeal = (id: string, stage: PipelineStage) => {
    setPipeline((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage } : d))
    );
    // Award XP the first time a lead is moved to "Won" — once per lead.
    if (stage === "won" && !wonRewarded.has(id)) {
      const deal = pipeline.find((d) => d.id === id);
      // Bigger deals = bigger hit: 100 base + 1 XP per $100 of value (cap 400).
      const bonus = Math.min(300, Math.round((deal?.value ?? 0) / 100));
      hit("close", {
        amount: 100 + bonus,
        label: deal ? `Closed ${deal.company}` : "Deal won",
        x: typeof window !== "undefined" ? window.innerWidth / 2 : undefined,
        y: typeof window !== "undefined" ? window.innerHeight / 3 : undefined,
      });
      setWonRewarded((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };
  const removeDeal = (id: string) =>
    setPipeline((prev) => prev.filter((d) => d.id !== id));

  const removeClient = (id: string) =>
    setClients((prev) => prev.filter((c) => c.id !== id));
  const removeCampaign = (id: string) =>
    setCampaigns((prev) => prev.filter((c) => c.id !== id));

  const onImportLeads = (leads: ImportedLead[]) => {
    if (leads.length === 0) return;
    const toDeals: Deal[] = leads.map((l) => ({
      id: l.id,
      company: l.company || l.contact || "Untitled lead",
      contact: l.contact || "—",
      phone: l.phone || "",
      value: l.value,
      stage: l.stage,
      probability: l.probability,
      closeDate: l.closeDate,
      source: l.source,
    }));
    setPipeline((prev) => [...toDeals, ...prev]);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <PageHeader
        eyebrow={
          businessName
            ? `${businessName} · CRM`
            : "Your business · CRM"
        }
        title={
          businessName ? (
            <>
              Run <span className="gradient-text">{businessName}</span> like a
              machine.
            </>
          ) : (
            <>
              Run your business like a{" "}
              <span className="gradient-text">machine.</span>
            </>
          )
        }
        subtitle={
          businessName
            ? `${businessName}'s built-in CRM: call and text leads from the dialer, drag deals through your pipeline, track clients, campaigns, and revenue. Close a lead, earn XP.`
            : "Your built-in CRM: call and text leads from the dialer, drag deals through your pipeline, track clients, campaigns, and revenue. Close a lead, earn XP."
        }
        icon={Briefcase}
        accent="emerald"
        actions={
          <>
            <LeadImporter
              onImport={onImportLeads}
              openExternal={importerOpen}
              onOpenChange={setImporterOpen}
            />
            <Button
              onClick={() => {
                setDraftStage("lead");
                setComposer("deal");
              }}
            >
              <Plus className="h-4 w-4" /> New deal
            </Button>
          </>
        }
      />

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
          value={formatCurrency(pipelineValue)}
          accent="violet"
        />
        <Kpi
          icon={Target}
          label="Weighted pipe"
          value={formatCurrency(weightedPipeline)}
          sub="probability-adjusted"
          accent="cyan"
        />
        <Kpi
          icon={Calendar}
          label="Calls booked"
          value={`${callsBooked}`}
          sub="this month"
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

      <section className="grid min-w-0 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Revenue trajectory · 7 months
              </h3>
              <p className="text-[10px] text-slate-500">
                Track every paying client. First deal closed will populate this.
              </p>
            </div>
            <Badge variant="default">DAY 1</Badge>
          </div>
          <div className="h-[240px] min-w-0 overflow-hidden">
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
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  AI Business Advisor
                </div>
                <div className="text-[10px] text-slate-500">
                  Updates as you log deals
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <Insight
                tone="info"
                title={clients.length === 0 ? "Add your first client" : `${clients.length} client(s) live`}
                body={
                  clients.length === 0
                    ? "Once you log paying clients here, I can rank them by churn risk, expansion potential, and account health."
                    : "Tracking MRR + health for every client. Add campaigns to start performance correlation."
                }
              />
              <Insight
                tone="info"
                title="Define your offer ladder"
                body="Tier 1 / Tier 2 / Tier 3 with clear price points. The AI uses this to score deals and recommend stage advancement."
              />
              <Insight
                tone="warn"
                title={pipeline.length === 0 ? "Lead → revenue baseline" : `${pipeline.length} deal(s) in pipe`}
                body={
                  pipeline.length === 0
                    ? "I'll start tracking your close rate, cycle time, and average deal size from your first added deal."
                    : `Weighted pipe ${formatCurrency(weightedPipeline)}. Keep advancing stages to push close probability.`
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dialer + texting + activity — the CRM comms layer */}
      <section id="apex-dialer" className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Dialer onActivity={(a) => logActivity(a)} />
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Call & text activity</h3>
            </div>
            {activity.length > 0 && (
              <button
                onClick={() => setActivity([])}
                className="text-[10px] text-slate-500 hover:text-rose-300"
              >
                Clear
              </button>
            )}
          </div>
          {activity.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center">
              <div className="text-2xl">☎️</div>
              <div className="mt-1 text-sm font-medium text-white">No activity yet</div>
              <div className="mt-1 text-xs text-slate-400">
                Calls and texts you make from here show up as a live timeline.
                Use the keypad, or tap Call/Text on any deal below.
              </div>
            </div>
          ) : (
            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {activity.map((a) => (
                  <ActivityRow key={a.id} a={a} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Sales pipeline</h2>
            <p className="text-[10px] text-slate-500">
              Press &amp; hold the grip to drag a deal between stages · move one to Won to earn XP (once per lead)
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setDraftStage("lead");
              setComposer("deal");
            }}
          >
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
                data-stage={stage}
                className={`rounded-2xl border bg-gradient-to-b ${stageColors[stage]} to-transparent p-3 transition-all ${
                  dragOverStage === stage
                    ? "ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-black"
                    : ""
                }`}
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
                  <button
                    onClick={() => {
                      setDraftStage(stage);
                      setComposer("deal");
                    }}
                    className="text-slate-500 hover:text-white"
                    aria-label={`Add deal to ${stage}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {deals.length === 0 && (
                    <button
                      onClick={() => {
                        setDraftStage(stage);
                        setComposer("deal");
                      }}
                      className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/[0.06] py-6 text-[10px] text-slate-500 transition-colors hover:bg-white/[0.02] hover:text-slate-300"
                    >
                      <Plus className="h-3 w-3" />
                      Add deal
                    </button>
                  )}
                  <AnimatePresence initial={false}>
                    {deals.map((d, i) => (
                      <DealCard
                        key={d.id}
                        d={d}
                        stage={stage}
                        index={i}
                        onMove={advanceDeal}
                        onRemove={removeDeal}
                        onCall={callLead}
                        onText={textLead}
                        onDragOver={setDragOverStage}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Active clients</h3>
              <p className="text-[10px] text-slate-500">
                MRR tracker · health score 0–100
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setComposer("client")}
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {clients.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center">
                <div className="text-2xl">🤝</div>
                <div className="mt-1 text-sm font-medium text-white">
                  No clients yet
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Add your first paying client to start tracking MRR and health.
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {clients.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ x: 2 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
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
                  <button
                    onClick={() => removeClient(c.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                    aria-label="Remove client"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Active campaigns</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setComposer("campaign")}
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {campaigns.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-6 text-center">
                <div className="text-2xl">📣</div>
                <div className="mt-1 text-sm font-medium text-white">
                  No campaigns running
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Plan your first campaign — budget, channel, target.
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {campaigns.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ x: 2 }}
                  className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
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
                    <button
                      onClick={() => removeCampaign(c.id)}
                      className="ml-1 grid h-6 w-6 place-items-center rounded text-slate-500 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                      aria-label="Remove campaign"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
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
                      className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
                      style={{
                        width: `${
                          c.budget === 0 ? 0 : (c.spent / c.budget) * 100
                        }%`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {composer === "deal" && (
          <DealComposer
            initialStage={draftStage}
            onClose={() => setComposer(null)}
            onSave={(deal) => {
              setPipeline((prev) => [deal, ...prev]);
              setComposer(null);
            }}
          />
        )}
        {composer === "client" && (
          <ClientComposer
            onClose={() => setComposer(null)}
            onSave={(c) => {
              setClients((prev) => [c, ...prev]);
              setComposer(null);
            }}
          />
        )}
        {composer === "campaign" && (
          <CampaignComposer
            clients={clients}
            onClose={() => setComposer(null)}
            onSave={(c) => {
              setCampaigns((prev) => [c, ...prev]);
              setComposer(null);
            }}
          />
        )}
      </AnimatePresence>

      <SmsComposer
        open={smsTarget !== null}
        to={smsTarget?.to ?? ""}
        contact={smsTarget?.contact}
        onClose={() => setSmsTarget(null)}
        onSent={(a) => logActivity({ ...a, contact: smsTarget?.contact })}
      />
    </div>
  );
}

function ActivityRow({ a }: { a: Activity }) {
  const when = relativeTime(a.at);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5"
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          a.type === "call"
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-sky-500/15 text-sky-300"
        }`}
      >
        {a.type === "call" ? (
          <Phone className="h-4 w-4" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {a.contact || a.number}
          </span>
          {a.contact && (
            <span className="truncate text-[10px] tabular text-slate-500">
              {a.number}
            </span>
          )}
        </div>
        <div className="truncate text-[11px] text-slate-500">
          {a.type === "call"
            ? a.durationSec > 0
              ? `Call · ${Math.floor(a.durationSec / 60)}:${String(a.durationSec % 60).padStart(2, "0")}`
              : "Call · not connected"
            : `“${a.body}”`}
        </div>
      </div>
      <span className="shrink-0 text-[10px] text-slate-500">{when}</span>
    </motion.div>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function DealComposer({
  initialStage,
  onClose,
  onSave,
}: {
  initialStage: PipelineStage;
  onClose: () => void;
  onSave: (d: Deal) => void;
}) {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [value, setValue] = useState(2000);
  const [probability, setProbability] = useState(30);
  const [stage, setStage] = useState<PipelineStage>(initialStage);
  const [source, setSource] = useState("cold-call");

  const save = () => {
    if (!company.trim()) return;
    onSave({
      id: `d-${Date.now()}`,
      company: company.trim(),
      contact: contact.trim() || "—",
      phone: phone.trim(),
      value,
      stage,
      probability,
      closeDate: new Date(Date.now() + 14 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
      source,
    });
  };

  return (
    <Modal title="New deal" onClose={onClose}>
      <Field label="Company"><Input value={company} onChange={setCompany} placeholder="Acme Roofing" autoFocus /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact"><Input value={contact} onChange={setContact} placeholder="John, Owner" /></Field>
        <Field label="Phone"><Input value={phone} onChange={setPhone} placeholder="+1 555 123 4567" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Value ($)">
          <NumberInput value={value} onChange={setValue} />
        </Field>
        <Field label="Probability (%)">
          <NumberInput value={probability} onChange={(n) => setProbability(Math.max(0, Math.min(100, n)))} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stage">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as PipelineStage)}
            className={inputCls}
          >
            {stageOrder.map((s) => (
              <option key={s} value={s} className="bg-slate-900">
                {stageLabels[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Source">
          <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
            {["cold-call", "referral", "inbound", "email", "social"].map((s) => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <Footer onCancel={onClose} onSave={save} disabled={!company.trim()} />
    </Modal>
  );
}

function ClientComposer({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (c: Client) => void;
}) {
  const [name, setName] = useState("");
  const [mrr, setMrr] = useState(1500);
  const [status, setStatus] = useState<"active" | "onboarding">("onboarding");
  const [health, setHealth] = useState(80);
  const [owner, setOwner] = useState("Sayed");

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: `c-${Date.now()}`,
      name: name.trim(),
      logo: name.trim().charAt(0).toUpperCase(),
      mrr,
      status,
      health,
      owner,
      since: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <Modal title="New client" onClose={onClose}>
      <Field label="Name"><Input value={name} onChange={setName} placeholder="Acme Inc" autoFocus /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="MRR ($)"><NumberInput value={mrr} onChange={setMrr} /></Field>
        <Field label="Health (0-100)">
          <NumberInput value={health} onChange={(n) => setHealth(Math.max(0, Math.min(100, n)))} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "onboarding")} className={inputCls}>
            <option value="active" className="bg-slate-900">Active</option>
            <option value="onboarding" className="bg-slate-900">Onboarding</option>
          </select>
        </Field>
        <Field label="Owner"><Input value={owner} onChange={setOwner} /></Field>
      </div>
      <Footer onCancel={onClose} onSave={save} disabled={!name.trim()} />
    </Modal>
  );
}

function CampaignComposer({
  clients,
  onClose,
  onSave,
}: {
  clients: Client[];
  onClose: () => void;
  onSave: (c: Campaign) => void;
}) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState(clients[0]?.name ?? "");
  const [budget, setBudget] = useState(2000);
  const [spent, setSpent] = useState(0);
  const [channel, setChannel] = useState("Meta Ads");
  const [status, setStatus] = useState<CampaignStatus>("planning");

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: `cp-${Date.now()}`,
      name: name.trim(),
      client: clientName || "—",
      budget,
      spent,
      channel,
      status,
      performance: 0,
      endsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000)
        .toISOString()
        .slice(0, 10),
    });
  };

  return (
    <Modal title="New campaign" onClose={onClose}>
      <Field label="Name"><Input value={name} onChange={setName} placeholder="Spring promo · Meta" autoFocus /></Field>
      <Field label="Client">
        {clients.length === 0 ? (
          <Input value={clientName} onChange={setClientName} placeholder="Type client name" />
        ) : (
          <select value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputCls}>
            {clients.map((c) => (
              <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>
            ))}
          </select>
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Budget ($)"><NumberInput value={budget} onChange={setBudget} /></Field>
        <Field label="Spent ($)"><NumberInput value={spent} onChange={setSpent} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Channel">
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputCls}>
            {["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn", "Email", "Cold call"].map((c) => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as CampaignStatus)} className={inputCls}>
            {(["planning", "running", "review", "complete"] as const).map((s) => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <Footer onCancel={onClose} onSave={save} disabled={!name.trim()} />
    </Modal>
  );
}

// ─── Tiny shared modal pieces ────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="glass-strong fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-3 overflow-hidden rounded-3xl p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={inputCls}
    />
  );
}

function Footer({
  onCancel,
  onSave,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        onClick={onCancel}
        className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-medium text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)] disabled:opacity-40"
      >
        Save
      </button>
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
    violet: "from-blue-600 to-blue-600",
    cyan: "from-sky-500 to-blue-500",
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
        {typeof delta === "number" && delta !== 0 && (
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
    info: { border: "border-sky-500/20", bg: "bg-sky-500/[0.04]", icon: "💡" },
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



/** Find which pipeline column the viewport point is over (drag drop). */
function stageFromPoint(x: number, y: number): PipelineStage | null {
  if (typeof document === "undefined") return null;
  const el = document.elementFromPoint(x, y);
  const col = el?.closest("[data-stage]") as HTMLElement | null;
  const s = col?.dataset.stage;
  return s ? (s as PipelineStage) : null;
}

/**
 * A draggable pipeline deal card. Press & hold the grip handle to drag it
 * into another stage column. Works with mouse and touch (the handle has
 * touch-action:none so dragging it never fights page scroll, while the rest
 * of the card stays tappable + scrollable).
 */
function DealCard({
  d,
  stage,
  index,
  onMove,
  onRemove,
  onCall,
  onText,
  onDragOver,
}: {
  d: Deal;
  stage: PipelineStage;
  index: number;
  onMove: (id: string, to: PipelineStage) => void;
  onRemove: (id: string) => void;
  onCall: (d: Deal) => void;
  onText: (d: Deal) => void;
  onDragOver: (s: PipelineStage | null) => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    controls.start(e);
  };

  // The lifted card sits under the pointer (zIndex 50), so a naive
  // elementFromPoint() hits the card itself and resolves to its OWN
  // column — the move never fires. Briefly disable the card's pointer
  // events so we read the stage column underneath the finger.
  const stageUnder = (x: number, y: number): PipelineStage | null => {
    const node = cardRef.current;
    const prev = node?.style.pointerEvents;
    if (node) node.style.pointerEvents = "none";
    const s = stageFromPoint(x, y);
    if (node) node.style.pointerEvents = prev ?? "";
    return s;
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      drag
      dragControls={controls}
      dragListener={false}
      dragSnapToOrigin
      dragElastic={0.12}
      onDragStart={() => setDragging(true)}
      onDrag={(e) => {
        const pe = e as PointerEvent;
        onDragOver(stageUnder(pe.clientX, pe.clientY));
      }}
      onDragEnd={(e) => {
        const pe = e as PointerEvent;
        const to = stageUnder(pe.clientX, pe.clientY);
        if (to && to !== stage) onMove(d.id, to);
        onDragOver(null);
        setDragging(false);
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ delay: index * 0.04 }}
      whileDrag={{
        scale: 1.05,
        zIndex: 50,
        boxShadow: "0 18px 50px rgba(0,0,0,0.6)",
      }}
      className={`group relative rounded-xl border bg-black/40 p-3 backdrop-blur-sm ${
        dragging ? "border-emerald-400/50" : "border-white/[0.06]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-1.5">
          <div
            onPointerDown={startDrag}
            title="Drag to move stage"
            style={{ touchAction: "none" }}
            className="-m-1 cursor-grab p-1 text-slate-600 hover:text-slate-300 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="truncate text-sm font-semibold text-white">
            {d.company}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {/* Move to ANY stage — tap-friendly native picker (works on
              touch, no hover needed). Drag via the grip still works too. */}
          <select
            value={stage}
            onChange={(e) => onMove(d.id, e.target.value as PipelineStage)}
            onPointerDown={(e) => e.stopPropagation()}
            title="Move to stage"
            className="max-w-[8rem] rounded-md border border-white/[0.1] bg-black/50 px-1.5 py-1 text-[10px] font-medium text-slate-200 focus:border-emerald-400/40 focus:outline-none"
          >
            {stageOrder.map((s) => (
              <option key={s} value={s} className="bg-[#0b1120] text-white">
                {stageLabels[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(d.id)}
            className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-rose-500/15 hover:text-rose-300"
            title="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="mt-0.5 pl-5 text-[10px] text-slate-500">{d.contact}</div>
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
          className="h-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-400"
          style={{ width: `${d.probability}%` }}
        />
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <button
          onClick={() => onCall(d)}
          disabled={!d.phone}
          title={d.phone ? `Call ${d.phone}` : "No phone number"}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 py-1.5 text-[11px] font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:opacity-30"
        >
          <Phone className="h-3 w-3" /> Call
        </button>
        <button
          onClick={() => onText(d)}
          title="Send a text"
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-sky-500/25 bg-sky-500/10 py-1.5 text-[11px] font-semibold text-sky-200 transition-colors hover:bg-sky-500/20"
        >
          <MessageSquare className="h-3 w-3" /> Text
        </button>
      </div>
    </motion.div>
  );
}
