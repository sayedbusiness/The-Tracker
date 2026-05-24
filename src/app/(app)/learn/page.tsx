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
  Brain,
  Target,
  Megaphone,
  Bot,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Category =
  | "sales"
  | "psychology"
  | "manipulation"
  | "ads"
  | "ai-agency"
  | "marketing-agency"
  | "mindset";

type Section = Category | "all";

interface LearnResource {
  id: string;
  title: string;
  creator: string;
  initials: string;
  category: Category;
  /** Full URL — opens in a new tab. Prefer specific videos when you
   *  know them, otherwise the creator's channel or a YouTube search. */
  url: string;
  /** Short blurb on why this is worth watching. */
  why: string;
  /** Two-color gradient seed — varies the card backgrounds. */
  hue: "blue" | "indigo" | "amber" | "rose" | "emerald" | "violet";
}

// ─── Real curated library — categories, real channels, real searches ──
// All URLs point to either creator channel pages (`youtube.com/@handle`)
// or YouTube search results pages. Both are stable and always render
// real videos. Pick a card, mark complete when you've watched.
const CATALOG: LearnResource[] = [
  // ─── SALES (Hormozi, Andres, Yash, Miner, etc.) ────────────────
  {
    id: "hormozi-channel",
    title: "Alex Hormozi — Offers, leads, and the math of money",
    creator: "Alex Hormozi",
    initials: "AH",
    category: "sales",
    url: "https://www.youtube.com/@AlexHormozi/videos",
    why: "Start with $100M Offers and $100M Leads. The clearest articulation of how to build offers people can't say no to.",
    hue: "blue",
  },
  {
    id: "miner-channel",
    title: "Jeremy Miner — NEPQ (Neuro-Emotional Persuasion Questioning)",
    creator: "Jeremy Miner",
    initials: "JM",
    category: "sales",
    url: "https://www.youtube.com/@JeremyMiner/videos",
    why: "Skip the pitch — ask questions that make the prospect convince themselves. Best operator on advanced questioning.",
    hue: "indigo",
  },
  {
    id: "andres-search",
    title: "Andres Conteras — Logical certainty + frame stacking",
    creator: "Andres Conteras",
    initials: "AC",
    category: "sales",
    url: "https://www.youtube.com/results?search_query=andres+conteras+sales+training",
    why: "The 9-to-5 vs entrepreneur frame, beach/weather analogy, identity selling. Drop uncertainty.",
    hue: "amber",
  },
  {
    id: "yash-search",
    title: "Yash Gajar — One frame, six human needs, identity selling",
    creator: "Yash Gajar",
    initials: "YG",
    category: "sales",
    url: "https://www.youtube.com/results?search_query=yash+gajar+sales",
    why: "Frame mastery. The single most overlooked variable on a closing call.",
    hue: "rose",
  },
  {
    id: "matt-ryder-search",
    title: "Matt Ryder — Agency closing scripts + cold call breakdowns",
    creator: "Matt Ryder",
    initials: "MR",
    category: "sales",
    url: "https://www.youtube.com/results?search_query=matt+ryder+agency+cold+call",
    why: "Real recordings, real scripts. Mimic his tonality. Specific to SMMA closes.",
    hue: "blue",
  },
  {
    id: "cole-gordon",
    title: "Cole Gordon — High-ticket closing fundamentals",
    creator: "Cole Gordon",
    initials: "CG",
    category: "sales",
    url: "https://www.youtube.com/@colegordon/videos",
    why: "$5K–$20K offers. Identity-based closing, objection frameworks, role-play discipline.",
    hue: "emerald",
  },
  {
    id: "andy-elliott",
    title: "Andy Elliott — Tonality + intensity drills",
    creator: "Andy Elliott",
    initials: "AE",
    category: "sales",
    url: "https://www.youtube.com/@andyelliottofficial/videos",
    why: "Pre-sprint fire-up sessions. Match his pace, ignore the theatrics.",
    hue: "rose",
  },
  {
    id: "patrick-dang",
    title: "Patrick Dang — B2B/SaaS sales fundamentals",
    creator: "Patrick Dang",
    initials: "PD",
    category: "sales",
    url: "https://www.youtube.com/@patrickdang/videos",
    why: "Clean discovery questions, early-career fundamentals, structured.",
    hue: "indigo",
  },

  // ─── PSYCHOLOGY & HUMAN REACTIONS ──────────────────────────
  {
    id: "robert-cialdini",
    title: "Influence — the 6 principles of persuasion",
    creator: "Robert Cialdini (search)",
    initials: "RC",
    category: "psychology",
    url: "https://www.youtube.com/results?search_query=robert+cialdini+influence+6+principles",
    why: "Reciprocity, scarcity, authority, commitment, liking, social proof. Cornerstone of why people say yes.",
    hue: "violet",
  },
  {
    id: "tony-robbins-6needs",
    title: "Tony Robbins — The 6 human needs",
    creator: "Tony Robbins (search)",
    initials: "TR",
    category: "psychology",
    url: "https://www.youtube.com/results?search_query=tony+robbins+six+human+needs",
    why: "Certainty, variety, significance, connection, growth, contribution. Map a prospect's primary need → unlock the close.",
    hue: "amber",
  },
  {
    id: "chris-voss",
    title: "Chris Voss — Tactical empathy (Never Split the Difference)",
    creator: "Chris Voss",
    initials: "CV",
    category: "psychology",
    url: "https://www.youtube.com/results?search_query=chris+voss+never+split+the+difference",
    why: "Former FBI hostage negotiator. Mirror, label, calibrated questions. Buy his book.",
    hue: "blue",
  },
  {
    id: "kahneman",
    title: "Daniel Kahneman — Thinking Fast and Slow (System 1 vs 2)",
    creator: "Daniel Kahneman (search)",
    initials: "DK",
    category: "psychology",
    url: "https://www.youtube.com/results?search_query=daniel+kahneman+thinking+fast+and+slow",
    why: "How buying decisions are actually made. Your prospects aren't rational — frame for System 1.",
    hue: "indigo",
  },
  {
    id: "robert-greene",
    title: "Robert Greene — Laws of Human Nature",
    creator: "Robert Greene (search)",
    initials: "RG",
    category: "psychology",
    url: "https://www.youtube.com/results?search_query=robert+greene+laws+of+human+nature",
    why: "Read motives behind people's behavior. Mandatory reading for anyone who deals with humans.",
    hue: "rose",
  },
  {
    id: "jung-shadow",
    title: "Carl Jung — Shadow work + projection (intro)",
    creator: "Academy of Ideas / Eternalised",
    initials: "CJ",
    category: "psychology",
    url: "https://www.youtube.com/results?search_query=carl+jung+shadow+work+explained",
    why: "Understand why people resist what they want. Applies to your own discipline too.",
    hue: "violet",
  },

  // ─── INFLUENCE / MANIPULATION (frames + dark psych) ────────
  {
    id: "dark-psych-search",
    title: "Manipulation tactics — recognize them, defend against them",
    creator: "Curated search",
    initials: "DP",
    category: "manipulation",
    url: "https://www.youtube.com/results?search_query=manipulation+tactics+psychology",
    why: "Anchoring, scarcity weaponization, social proof spoofing. Know the playbook so you can spot it on you.",
    hue: "rose",
  },
  {
    id: "jordan-belfort-straight-line",
    title: "Jordan Belfort — The Straight Line Persuasion System",
    creator: "Jordan Belfort (search)",
    initials: "JB",
    category: "manipulation",
    url: "https://www.youtube.com/results?search_query=jordan+belfort+straight+line+persuasion",
    why: "Polarizing teacher, useful tactics. Learn the structure, leave the ethics-light parts behind.",
    hue: "amber",
  },
  {
    id: "frame-control-search",
    title: "Frame control — keeping the frame on sales calls",
    creator: "Curated search",
    initials: "FC",
    category: "manipulation",
    url: "https://www.youtube.com/results?search_query=frame+control+sales+call",
    why: "Whoever holds the frame controls the conversation. Identical principle, different teachers.",
    hue: "indigo",
  },
  {
    id: "pitch-anything",
    title: "Oren Klaff — Pitch Anything (STRONG method)",
    creator: "Oren Klaff (search)",
    initials: "OK",
    category: "manipulation",
    url: "https://www.youtube.com/results?search_query=oren+klaff+pitch+anything",
    why: "Setting frame, telling status, prizing yourself. Mandatory if you pitch to investors or owners.",
    hue: "blue",
  },
  {
    id: "cold-reading",
    title: "Cold reading + pattern recognition",
    creator: "Curated search",
    initials: "CR",
    category: "manipulation",
    url: "https://www.youtube.com/results?search_query=cold+reading+techniques",
    why: "Mentalists rely on this. Salespeople can use the same micro-pattern recognition (ethically).",
    hue: "violet",
  },

  // ─── PAID ADS — META + GOOGLE (run them well) ──────────────
  {
    id: "meta-ads-2025",
    title: "Meta Ads 2026 — full setup walkthrough",
    creator: "Curated search",
    initials: "M",
    category: "ads",
    url: "https://www.youtube.com/results?search_query=meta+ads+2026+full+tutorial",
    why: "Pixel, conversions API, Advantage+, naming conventions. Pick the most recent walkthrough.",
    hue: "blue",
  },
  {
    id: "google-ads-2025",
    title: "Google Ads 2026 — performance max + search campaigns",
    creator: "Curated search",
    initials: "G",
    category: "ads",
    url: "https://www.youtube.com/results?search_query=google+ads+2026+performance+max+tutorial",
    why: "What's actually working in 2026 — PMax for ecom, traditional search for lead gen.",
    hue: "amber",
  },
  {
    id: "liam-james-kay",
    title: "Liam James Kay — Paid traffic + agency arbitrage",
    creator: "Liam James Kay",
    initials: "LK",
    category: "ads",
    url: "https://www.youtube.com/@LiamJamesKay/videos",
    why: "Hooks, creatives, scaling decisions. Specific to running ads for clients.",
    hue: "emerald",
  },
  {
    id: "ben-heath",
    title: "Ben Heath — Lead Guru (Facebook Ads agency tactics)",
    creator: "Ben Heath",
    initials: "BH",
    category: "ads",
    url: "https://www.youtube.com/@BenHeath/videos",
    why: "Technical walkthroughs of Meta Ads for agency owners. Disciplined, no fluff.",
    hue: "indigo",
  },
  {
    id: "frey-chu",
    title: "Frey Chu — Google Ads + landing page optimization",
    creator: "Frey Chu",
    initials: "FC",
    category: "ads",
    url: "https://www.youtube.com/@FreyChu/videos",
    why: "Google Ads + conversion rate optimization. Strong on the analytics side.",
    hue: "rose",
  },

  // ─── AI AGENCY (start + run an AI agency) ──────────────────
  {
    id: "liam-ottley",
    title: "Liam Ottley — Build & sell AI agents",
    creator: "Liam Ottley",
    initials: "LO",
    category: "ai-agency",
    url: "https://www.youtube.com/@LiamOttley/videos",
    why: "Practical: pick a niche, build a chatbot/voice agent, sell it for $3–10K. End-to-end.",
    hue: "blue",
  },
  {
    id: "morningside-ai",
    title: "Morningside AI (Joey Wieser) — agency case studies",
    creator: "Morningside AI",
    initials: "MA",
    category: "ai-agency",
    url: "https://www.youtube.com/@MorningsideAI/videos",
    why: "Real client builds: voice agents, automations, content systems. Steal the patterns.",
    hue: "indigo",
  },
  {
    id: "saasy-ai",
    title: "AI automation agency niche selection",
    creator: "Curated search",
    initials: "AI",
    category: "ai-agency",
    url: "https://www.youtube.com/results?search_query=ai+automation+agency+niche+2026",
    why: "Niche-first. Without a niche, your sales calls have nothing specific to anchor on.",
    hue: "amber",
  },
  {
    id: "n8n-make",
    title: "n8n + Make — automation tooling tutorials",
    creator: "Curated search",
    initials: "n8",
    category: "ai-agency",
    url: "https://www.youtube.com/results?search_query=n8n+ai+agent+tutorial",
    why: "The tools you'll actually build with. Cheaper than Zapier, more powerful than Make for AI workflows.",
    hue: "emerald",
  },
  {
    id: "voiceflow",
    title: "Voiceflow + Vapi — voice AI agents for service businesses",
    creator: "Curated search",
    initials: "VF",
    category: "ai-agency",
    url: "https://www.youtube.com/results?search_query=voiceflow+vapi+ai+phone+agent",
    why: "Inbound + outbound voice. Real businesses pay for these — start with appointment setters.",
    hue: "rose",
  },

  // ─── MARKETING AGENCY (operate, scale, retain) ─────────────
  {
    id: "iman-gadzhi",
    title: "Iman Gadzhi — SMMA from $0 to scale",
    creator: "Iman Gadzhi",
    initials: "IG",
    category: "marketing-agency",
    url: "https://www.youtube.com/@ImanGadzhi/videos",
    why: "The OG agency content. Niche selection, outreach, fulfillment systems.",
    hue: "blue",
  },
  {
    id: "charlie-morgan",
    title: "Charlie Morgan — Outbound systems + agency scaling",
    creator: "Charlie Morgan",
    initials: "CM",
    category: "marketing-agency",
    url: "https://www.youtube.com/@CharlieMorganOfficial/videos",
    why: "SDR layer, appointment setting, retention. How to remove yourself from sales.",
    hue: "indigo",
  },
  {
    id: "jordan-platten",
    title: "Jordan Platten — Affluent Academy ops content",
    creator: "Jordan Platten",
    initials: "JP",
    category: "marketing-agency",
    url: "https://www.youtube.com/@JordanPlatten/videos",
    why: "Practical SOPs for client management + delivering Meta/Google ads results.",
    hue: "amber",
  },
  {
    id: "jeremy-haynes",
    title: "Jeremy Haynes — Agency → high-ticket coaching",
    creator: "Jeremy Haynes",
    initials: "JH",
    category: "marketing-agency",
    url: "https://www.youtube.com/@JeremyHaynes/videos",
    why: "Backend monetization, scaling past the agency model.",
    hue: "rose",
  },
  {
    id: "ghl",
    title: "GoHighLevel — setup + automation walkthroughs",
    creator: "Curated search",
    initials: "GHL",
    category: "marketing-agency",
    url: "https://www.youtube.com/results?search_query=gohighlevel+setup+walkthrough+2026",
    why: "Snapshot setup, white-label, automation pipelines. Pick one tutorial, execute end-to-end.",
    hue: "emerald",
  },

  // ─── MINDSET (keep your head right) ────────────────────────
  {
    id: "naval",
    title: "Naval Ravikant — How to Get Rich (Almanac)",
    creator: "Naval Ravikant",
    initials: "N",
    category: "mindset",
    url: "https://www.youtube.com/results?search_query=naval+ravikant+how+to+get+rich",
    why: "Specific knowledge, leverage, judgment. Long-term wealth thinking.",
    hue: "blue",
  },
  {
    id: "jocko",
    title: "Jocko Willink — Discipline equals freedom",
    creator: "Jocko Willink",
    initials: "JW",
    category: "mindset",
    url: "https://www.youtube.com/@jockopodcast/videos",
    why: "The standard you need to hold when motivation is gone.",
    hue: "amber",
  },
  {
    id: "stoic",
    title: "Ryan Holiday — Daily Stoic",
    creator: "Daily Stoic",
    initials: "DS",
    category: "mindset",
    url: "https://www.youtube.com/@DailyStoic/videos",
    why: "Operating system for keeping ego, fear, and bad days in check.",
    hue: "violet",
  },
];

const CATEGORY_META: Record<
  Category,
  { label: string; icon: typeof Phone; sub: string }
> = {
  sales: {
    label: "Sales",
    icon: Target,
    sub: "Close more, faster — Hormozi, Miner, Andres, Yash, Cole Gordon",
  },
  psychology: {
    label: "Psychology & Human Reactions",
    icon: Brain,
    sub: "Why people actually do what they do — Cialdini, Voss, Kahneman, Robbins",
  },
  manipulation: {
    label: "Influence & Manipulation",
    icon: ShieldAlert,
    sub: "Frame control, dark patterns, persuasion — know them, recognize them",
  },
  ads: {
    label: "Meta & Google Ads",
    icon: Megaphone,
    sub: "Run paid traffic correctly — Liam JK, Ben Heath, Frey Chu",
  },
  "ai-agency": {
    label: "AI Agency",
    icon: Bot,
    sub: "Start and run an AI agency — Liam Ottley, Morningside, automation tools",
  },
  "marketing-agency": {
    label: "Marketing Agency Ops",
    icon: Briefcase,
    sub: "Iman, Charlie Morgan, Jordan Platten, Jeremy Haynes, GHL",
  },
  mindset: {
    label: "Mindset",
    icon: Sparkles,
    sub: "Naval, Jocko, Stoic — keep your head right",
  },
};

const HUE_TONE: Record<LearnResource["hue"], string> = {
  blue: "from-blue-700 via-blue-600 to-sky-500",
  indigo: "from-indigo-700 via-blue-700 to-blue-600",
  amber: "from-amber-600 via-orange-500 to-rose-500",
  rose: "from-rose-600 via-pink-500 to-amber-500",
  emerald: "from-emerald-600 via-teal-500 to-sky-500",
  violet: "from-purple-700 via-blue-700 to-sky-500",
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
    setToday(todayKey());
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
        : CATALOG.filter((r) => r.category === section),
    [section]
  );

  const counts = useMemo(() => {
    const out: Record<Category, number> = {
      sales: 0,
      psychology: 0,
      manipulation: 0,
      ads: 0,
      "ai-agency": 0,
      "marketing-agency": 0,
      mindset: 0,
    };
    for (const r of CATALOG) out[r.category]++;
    return out;
  }, []);

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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Learning · curated library"
        title={
          <>
            Watch. Steal. <span className="gradient-electric">Compound.</span>
          </>
        }
        subtitle="Each card opens YouTube to a real channel or specific search. Mark complete when you've watched. Touch counter shows what you've opened today."
        icon={GraduationCap}
        accent="indigo"
      />

      <section className="grid gap-3 sm:grid-cols-4">
        <Stat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={`${completedIds.size} / ${CATALOG.length}`}
          sub={completedIds.size === 0 ? "Start one today" : "marked complete"}
        />
        <Stat
          icon={<BookOpen className="h-4 w-4" />}
          label="Opened today"
          value={`${touched.size}`}
          sub="Any link click counts"
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label="Library size"
          value={`${CATALOG.length}`}
          sub={`across ${Object.keys(CATEGORY_META).length} categories`}
        />
        <Stat
          icon={<Flame className="h-4 w-4" />}
          label="Active focus"
          value="Sales · Agency"
          sub="Where the leverage is"
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <TabButton
          active={section === "all"}
          onClick={() => setSection("all")}
          label={`All (${CATALOG.length})`}
        />
        {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META.sales][]).map(
          ([id, meta]) => (
            <TabButton
              key={id}
              active={section === id}
              onClick={() => setSection(id)}
              label={`${meta.label} (${counts[id]})`}
            />
          )
        )}
      </div>

      {section === "all" ? (
        // When showing all: group by category with a header per section.
        <div className="space-y-8">
          {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META.sales][]).map(
            ([catId, meta]) => {
              const items = CATALOG.filter((r) => r.category === catId);
              if (items.length === 0) return null;
              return (
                <CategorySection
                  key={catId}
                  catId={catId}
                  meta={meta}
                  items={items}
                  completedIds={completedIds}
                  openLink={openLink}
                  toggleComplete={toggleComplete}
                />
              );
            }
          )}
        </div>
      ) : (
        <CategorySection
          catId={section}
          meta={CATEGORY_META[section]}
          items={filtered}
          completedIds={completedIds}
          openLink={openLink}
          toggleComplete={toggleComplete}
        />
      )}

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
              One per day. Take notes by hand.
            </p>
          </div>
        </div>
        <ol className="space-y-2 text-sm">
          {[
            "Jeremy Miner — pick one NEPQ video, steal the question stack",
            "Andres Conteras — Logical certainty drill, write 3 frames",
            "Matt Ryder — Agency cold call breakdown, mimic the tonality",
            "Alex Hormozi — One offer talk, audit your own offer against it",
            "Cialdini — 6 principles refresher, map each to one of your tactics",
            "Liam Ottley OR Iman Gadzhi — pick one based on your agency type",
            "Light review day — re-watch your favorite from this week",
          ].map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
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

function CategorySection({
  catId,
  meta,
  items,
  completedIds,
  openLink,
  toggleComplete,
}: {
  catId: Category;
  meta: (typeof CATEGORY_META)["sales"];
  items: LearnResource[];
  completedIds: Set<string>;
  openLink: (r: LearnResource) => void;
  toggleComplete: (id: string) => void;
}) {
  const Icon = meta.icon;
  return (
    <section>
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 shadow-[0_0_15px_rgba(30,58,138,0.4)]">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{meta.label}</h2>
          <p className="text-[11px] text-slate-500">{meta.sub}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r, i) => (
          <VideoCard
            key={r.id}
            r={r}
            i={i}
            completed={completedIds.has(r.id)}
            onOpen={() => openLink(r)}
            onToggle={() => toggleComplete(r.id)}
          />
        ))}
      </div>
      {/* Keep TypeScript happy about the unused catId param — informational. */}
      <span className="hidden">{catId}</span>
    </section>
  );
}

function VideoCard({
  r,
  i,
  completed,
  onOpen,
  onToggle,
}: {
  r: LearnResource;
  i: number;
  completed: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      whileHover={{ y: -2 }}
      className={cn(
        "surface-card group overflow-hidden rounded-2xl transition-all",
        completed && "ring-1 ring-emerald-500/30"
      )}
    >
      <button onClick={onOpen} className="block w-full text-left">
        <div
          className={`relative h-40 overflow-hidden bg-gradient-to-br ${HUE_TONE[r.hue]}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(0,0,0,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-black/40 text-[13px] font-black tracking-tight text-white shadow-md backdrop-blur-sm">
            {r.initials}
          </div>
          {completed && (
            <div className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            </div>
          )}
          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white/25 backdrop-blur-xl">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-[11px] font-medium uppercase tracking-wider text-white/80">
            {r.creator}
          </div>
        </div>
      </button>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white">
          {r.title}
        </h3>
        <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-400">
          {r.why}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onOpen}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gradient-to-br from-blue-700 to-sky-500 px-2 py-1.5 text-[11px] font-medium text-white shadow-[0_2px_10px_rgba(30,58,138,0.3)] hover:shadow-[0_4px_15px_rgba(30,58,138,0.45)]"
          >
            <ExternalLink className="h-3 w-3" /> Watch on YouTube
          </button>
          <button
            onClick={onToggle}
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
}

function Stat({
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

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-all",
        active
          ? "border-blue-400/30 bg-blue-600/15 text-white"
          : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12] hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

// Button import not used directly — leave for symmetry with other pages.
void Button;
void Badge;
