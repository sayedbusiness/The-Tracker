"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Flame,
  ExternalLink,
  Phone,
  Briefcase,
  Target,
  Brain,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSyncedState } from "@/hooks/use-synced-state";
import { cn } from "@/lib/utils";

type Section = "all" | "sales" | "cold-calling" | "agency" | "mindset";

interface LearnResource {
  id: string;
  title: string;
  creator: string;
  section: Exclude<Section, "all">;
  url: string;
  /** Short blurb */
  why: string;
  /** Pillar of focus */
  pillar: "cold-call" | "closing" | "objections" | "ops" | "scaling" | "offers" | "mindset" | "ads";
}

// Real curated catalog. URLs point to creators' channels or YouTube search
// results — stable destinations that don't rot when a specific video gets
// deleted. Add specific video IDs over time as you binge them.
const CATALOG: LearnResource[] = [
  // ─── SALES — HIGH-TICKET CLOSING ────────────────────────
  {
    id: "alex-hormozi",
    title: "Alex Hormozi — Offers, sales, scaling",
    creator: "@AlexHormozi",
    section: "sales",
    url: "https://www.youtube.com/@AlexHormozi/videos",
    why: "The bible for offer creation, value-stacking, and the mechanics of why people buy. Start with $100M Offers + $100M Leads.",
    pillar: "offers",
  },
  {
    id: "jeremy-miner",
    title: "Jeremy Miner — NEPQ (Neuro-Emotional Persuasion Questioning)",
    creator: "@JeremyMiner",
    section: "sales",
    url: "https://www.youtube.com/@JeremyMiner/videos",
    why: "The skip-the-pitch approach. Ask questions that make the prospect convince themselves. Best for high-ticket B2C.",
    pillar: "closing",
  },
  {
    id: "matt-ryder",
    title: "Matt Ryder — Agency sales + cold call scripts",
    creator: "@MattRyderAgency",
    section: "sales",
    url: "https://www.youtube.com/results?search_query=matt+ryder+agency+sales",
    why: "Specific to SMMA closing. Real call recordings, real script breakdowns. Mimic his tonality.",
    pillar: "closing",
  },
  {
    id: "andres-conteras",
    title: "Andres Conteras — Logical certainty + frame stacking",
    creator: "Andres Conteras Sales",
    section: "sales",
    url: "https://www.youtube.com/results?search_query=andres+conteras+sales",
    why: "Best operator on dropping uncertainty. The 9-to-5 vs entrepreneur frame, beach/weather analogy, identity selling.",
    pillar: "closing",
  },
  {
    id: "cole-gordon",
    title: "Cole Gordon — High-ticket closing",
    creator: "@colegordon",
    section: "sales",
    url: "https://www.youtube.com/@colegordon/videos",
    why: "Disciplined script + identity + objection frameworks. Strong on the $5K–$20K offers.",
    pillar: "closing",
  },
  {
    id: "andy-elliott",
    title: "Andy Elliott — Tonality + intensity",
    creator: "@andyelliottofficial",
    section: "sales",
    url: "https://www.youtube.com/@andyelliottofficial/videos",
    why: "Loud, energetic, masculine sales energy. Use for fire-up sessions before sprints. Not for nuance.",
    pillar: "closing",
  },
  {
    id: "patrick-dang",
    title: "Patrick Dang — B2B SaaS-style sales fundamentals",
    creator: "@patrickdang",
    section: "sales",
    url: "https://www.youtube.com/@patrickdang/videos",
    why: "Clean, structured. Good for discovery questions + early-career fundamentals.",
    pillar: "closing",
  },
  {
    id: "grant-cardone",
    title: "Grant Cardone — Closing the deal",
    creator: "@GrantCardone",
    section: "sales",
    url: "https://www.youtube.com/@GrantCardone/videos",
    why: "Classic closing reps. Survive his intensity, take what works.",
    pillar: "closing",
  },

  // ─── COLD CALLING / OUTBOUND ───────────────────────────
  {
    id: "matt-ryder-cold",
    title: "Cold call openers that don't get hung up on",
    creator: "Matt Ryder + Agency operators",
    section: "cold-calling",
    url: "https://www.youtube.com/results?search_query=cold+call+opener+agency",
    why: "Pattern-interrupt openers. 'How are you?' is dead — what works in 2026.",
    pillar: "cold-call",
  },
  {
    id: "trent-dressel",
    title: "Trent Dressel — SDR cold call walkthroughs",
    creator: "@TrentDressel",
    section: "cold-calling",
    url: "https://www.youtube.com/@TrentDressel/videos",
    why: "Real recordings from real reps. Hear the pacing. Steal the cadence.",
    pillar: "cold-call",
  },
  {
    id: "objection-handling-pack",
    title: "Objection handling — every common 'no'",
    creator: "Jeremy Miner / Andres",
    section: "cold-calling",
    url: "https://www.youtube.com/results?search_query=objection+handling+sales",
    why: "Build a reframe library. One per top objection. Roleplay daily.",
    pillar: "objections",
  },
  {
    id: "kenan-rubin",
    title: "Kenan Rubin — Cold call mastery",
    creator: "Search: kenan rubin cold call",
    section: "cold-calling",
    url: "https://www.youtube.com/results?search_query=kenan+rubin+cold+call",
    why: "Hard-edge cold call breakdowns. Fast tempo, owner-direct.",
    pillar: "cold-call",
  },
  {
    id: "nepq-deep",
    title: "NEPQ in practice — 30-min deep dive",
    creator: "Jeremy Miner / 7th Level",
    section: "cold-calling",
    url: "https://www.youtube.com/results?search_query=jeremy+miner+NEPQ+deep+dive",
    why: "Long-form so the structure sinks in. Take notes by hand.",
    pillar: "closing",
  },

  // ─── AGENCY OPS + SCALING ──────────────────────────────
  {
    id: "iman-gadzhi",
    title: "Iman Gadzhi — SMMA from $0 to scale",
    creator: "@ImanGadzhi",
    section: "agency",
    url: "https://www.youtube.com/@ImanGadzhi/videos",
    why: "The OG agency content. Niche selection, outreach, fulfillment systems.",
    pillar: "ops",
  },
  {
    id: "charlie-morgan",
    title: "Charlie Morgan — Easy Grow / agency scaling",
    creator: "@CharlieMorganOfficial",
    section: "agency",
    url: "https://www.youtube.com/@CharlieMorganOfficial/videos",
    why: "Outbound systems + lead gen at scale. SDR layer, appointment setting, retention.",
    pillar: "scaling",
  },
  {
    id: "jordan-platten",
    title: "Jordan Platten — Affluent Academy operator content",
    creator: "@JordanPlatten",
    section: "agency",
    url: "https://www.youtube.com/@JordanPlatten/videos",
    why: "Practical SOPs for client management + delivering Meta/Google ads results.",
    pillar: "ops",
  },
  {
    id: "liam-james-kay",
    title: "Liam James Kay — Paid traffic + agency arbitrage",
    creator: "@LiamJamesKay",
    section: "agency",
    url: "https://www.youtube.com/@LiamJamesKay/videos",
    why: "Ad-buying frameworks. Hooks, creatives, scaling decisions.",
    pillar: "ads",
  },
  {
    id: "jeremy-haynes",
    title: "Jeremy Haynes — Agency to high-ticket coaching pivot",
    creator: "@JeremyHaynes",
    section: "agency",
    url: "https://www.youtube.com/@JeremyHaynes/videos",
    why: "Backend monetization, scaling beyond the agency model.",
    pillar: "scaling",
  },
  {
    id: "thomas-gonnet",
    title: "Thomas Gonnet — agency systems + operations",
    creator: "@ThomasGonnet",
    section: "agency",
    url: "https://www.youtube.com/results?search_query=agency+operations+systems",
    why: "Process docs, hiring an ops team, removing yourself from delivery.",
    pillar: "ops",
  },
  {
    id: "ghl-mastery",
    title: "GoHighLevel — setup walkthroughs",
    creator: "GHL community",
    section: "agency",
    url: "https://www.youtube.com/results?search_query=gohighlevel+setup+walkthrough",
    why: "Snapshot setup, white-label, automation pipelines. Pick one tutorial and execute end-to-end.",
    pillar: "ops",
  },

  // ─── MINDSET / IDENTITY ────────────────────────────────
  {
    id: "naval",
    title: "Naval Ravikant — Almanac",
    creator: "@NavalReadingClub",
    section: "mindset",
    url: "https://www.youtube.com/results?search_query=naval+ravikant+how+to+get+rich",
    why: "Long-term wealth thinking. Specific knowledge, leverage, judgment.",
    pillar: "mindset",
  },
  {
    id: "jocko",
    title: "Jocko Willink — Discipline equals freedom",
    creator: "@jocko",
    section: "mindset",
    url: "https://www.youtube.com/@jockopodcast/videos",
    why: "The standard you need to hold when motivation is gone.",
    pillar: "mindset",
  },
  {
    id: "stoic",
    title: "Ryan Holiday — Daily Stoic",
    creator: "@DailyStoic",
    section: "mindset",
    url: "https://www.youtube.com/@DailyStoic/videos",
    why: "Operating system for keeping ego, fear, and bad days in check.",
    pillar: "mindset",
  },
];

const sectionMeta: Record<
  Exclude<Section, "all">,
  { label: string; icon: typeof Phone; tone: string }
> = {
  sales: { label: "Sales", icon: Target, tone: "from-blue-600 to-blue-700" },
  "cold-calling": {
    label: "Cold calling",
    icon: Phone,
    tone: "from-sky-500 to-blue-600",
  },
  agency: {
    label: "Agency ops & scaling",
    icon: Briefcase,
    tone: "from-emerald-500 to-teal-600",
  },
  mindset: {
    label: "Mindset",
    icon: Brain,
    tone: "from-amber-500 to-orange-500",
  },
};

export default function LearnPage() {
  const [section, setSection] = useState<Section>("all");

  const [completedIds, setCompletedIds] = useSyncedState<Set<string>>(
    "learn:completed",
    new Set<string>(),
    { serializer: "set" }
  );
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);
  const [touched, setTouched] = useSyncedState<Set<string>>(
    `learn:touched:${today}`,
    new Set<string>(),
    { serializer: "set" }
  );

  const filtered = useMemo(
    () =>
      section === "all"
        ? CATALOG
        : CATALOG.filter((r) => r.section === section),
    [section]
  );

  const stats = useMemo(() => {
    const completed = CATALOG.filter((r) => completedIds.has(r.id)).length;
    return {
      completed,
      total: CATALOG.length,
      sales: CATALOG.filter((r) => r.section === "sales").length,
      coldCalling: CATALOG.filter((r) => r.section === "cold-calling").length,
      agency: CATALOG.filter((r) => r.section === "agency").length,
    };
  }, [completedIds]);

  const openLink = (r: LearnResource) => {
    setTouched((prev) => new Set(prev).add(r.id));
    window.open(r.url, "_blank", "noreferrer");
  };

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sectionTabs: { id: Section; label: string }[] = [
    { id: "all", label: `All (${CATALOG.length})` },
    { id: "sales", label: `Sales (${stats.sales})` },
    { id: "cold-calling", label: `Cold calling (${stats.coldCalling})` },
    { id: "agency", label: `Agency (${stats.agency})` },
    { id: "mindset", label: `Mindset` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Learning · Second brain"
        title={
          <>
            Watch. Steal. <span className="gradient-electric">Compound.</span>
          </>
        }
        subtitle="Curated sales + agency content from the operators worth listening to. Open the link, watch the video, mark it complete. Streaks roll daily."
        icon={GraduationCap}
        accent="indigo"
        actions={
          <Button>
            <Sparkles className="h-4 w-4" /> AI study plan
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-4">
        <LearnStat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={`${stats.completed} / ${stats.total}`}
          sub={stats.completed === 0 ? "Start one today" : "marked complete"}
        />
        <LearnStat
          icon={<BookOpen className="h-4 w-4" />}
          label="Touched today"
          value={`${touched.size}`}
          sub="Any open click counts"
        />
        <LearnStat
          icon={<Clock className="h-4 w-4" />}
          label="Catalog size"
          value={`${CATALOG.length}`}
          sub={`${stats.sales} sales · ${stats.agency} agency`}
        />
        <LearnStat
          icon={<Flame className="h-4 w-4" />}
          label="Active goal"
          value="200 dials/wk"
          sub="Cold-calling channel first"
        />
      </section>

      <div className="flex flex-wrap gap-2">
        {sectionTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-all",
              section === t.id
                ? "border-blue-400/30 bg-blue-600/15 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12] hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r, i) => {
          const meta = sectionMeta[r.section];
          const Icon = meta.icon;
          const completed = completedIds.has(r.id);
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              className={cn(
                "surface-card group overflow-hidden rounded-2xl transition-all",
                completed && "ring-1 ring-emerald-500/30"
              )}
            >
              <div
                className={`relative h-24 overflow-hidden bg-gradient-to-br ${meta.tone}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  <Icon className="h-3 w-3" /> {meta.label}
                </div>
                {completed && (
                  <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                )}
                <button
                  onClick={() => openLink(r)}
                  aria-label={`Open ${r.title}`}
                  className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur-xl">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </button>
              </div>
              <div className="space-y-2 p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                  {r.title}
                </h3>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">
                  {r.creator}
                </div>
                <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-400">
                  {r.why}
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openLink(r)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-br from-blue-700 to-sky-500 px-2 py-1.5 text-[11px] font-medium text-white shadow-[0_2px_10px_rgba(30,58,138,0.3)] hover:shadow-[0_4px_15px_rgba(30,58,138,0.45)]"
                  >
                    <ExternalLink className="h-3 w-3" /> Open
                  </button>
                  <button
                    onClick={() => toggleComplete(r.id)}
                    aria-label={completed ? "Mark incomplete" : "Mark complete"}
                    className={cn(
                      "grid h-8 w-8 place-items-center rounded-lg border transition-all",
                      completed
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-emerald-400/30 hover:text-emerald-300"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="surface-card rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Suggested order for the next 7 days
            </h3>
            <p className="text-[10px] text-slate-500">
              Drink it in order. One per day. Take notes by hand.
            </p>
          </div>
        </div>
        <ol className="space-y-2 text-sm">
          {[
            "Jeremy Miner — NEPQ intro (20 min). Steal the question stack.",
            "Andres Conteras — Logical certainty drill. Write 3 frames you can use.",
            "Matt Ryder — Agency cold call breakdown. Mimic the tonality.",
            "Alex Hormozi — One offer talk. Audit your own offer against it.",
            "Charlie Morgan — Outbound systems. Pick one process to implement.",
            "Iman Gadzhi — Niche selection. Confirm your ICP is still right.",
            "Light review day — re-watch your favorite from this week.",
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600/20 text-[11px] font-bold text-blue-200">
                {i + 1}
              </span>
              <span className="text-slate-300">{line}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function LearnStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600/15 text-blue-300">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tabular text-white">{value}</div>
      <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
