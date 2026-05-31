"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Check,
  Plus,
  Trash2,
  Phone,
  PlayCircle,
  Users,
  Megaphone,
  Settings as Gear,
  GraduationCap,
  Zap,
  Rocket,
  Camera,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { useSyncedState } from "@/hooks/use-synced-state";
import { cn } from "@/lib/utils";

type Category =
  | "setup"
  | "cold-calls"
  | "ghl"
  | "automation"
  | "training"
  | "content"
  | "affiliate"
  | "onboarding"
  | "calls"
  | "hiring"
  | "other";

type WorkItem = {
  id: string;
  title: string;
  category: Category;
  done: boolean;
  notes?: string;
  createdAt: number;
};

const CATEGORY_META: Record<
  Category,
  { label: string; icon: LucideIcon; tone: string }
> = {
  setup: { label: "Setup / foundation", icon: Rocket, tone: "from-violet-600/30 border-violet-500/30 text-violet-200" },
  "cold-calls": { label: "Cold calls", icon: Phone, tone: "from-rose-500/30 border-rose-500/30 text-rose-200" },
  ghl: { label: "GoHighLevel (GHL)", icon: Megaphone, tone: "from-amber-500/30 border-amber-500/30 text-amber-200" },
  automation: { label: "Automations / AI", icon: Zap, tone: "from-cyan-500/30 border-cyan-400/30 text-cyan-200" },
  training: { label: "Learn sales", icon: GraduationCap, tone: "from-blue-700/30 border-blue-600/30 text-blue-200" },
  content: { label: "Content", icon: Camera, tone: "from-sky-500/30 border-sky-400/30 text-sky-200" },
  affiliate: { label: "Affiliate", icon: PlayCircle, tone: "from-blue-600/30 border-blue-500/30 text-blue-200" },
  onboarding: { label: "Client onboarding", icon: Users, tone: "from-emerald-600/30 border-emerald-500/30 text-emerald-200" },
  calls: { label: "Calls / mock calls", icon: Phone, tone: "from-sky-500/30 border-sky-400/30 text-sky-200" },
  hiring: { label: "Hiring", icon: Users, tone: "from-blue-500/30 border-blue-400/30 text-blue-200" },
  other: { label: "Other", icon: Gear, tone: "from-slate-600/30 border-slate-500/30 text-slate-300" },
};

// Everything that has to happen to get Avori Growth off the ground. You
// haven't taken a single cold call yet — so this is the real starting line.
const SEED: Omit<WorkItem, "createdAt">[] = [
  // ── Setup / foundation ──
  { id: "seed-niche", title: "Lock your niche + offer (who you help + the result)", category: "setup", done: false },
  { id: "seed-script", title: "Finalize your cold-call script (Impact Formula / NEPQ)", category: "setup", done: false },
  { id: "seed-list", title: "Build your first lead list — 200+ local business owners + numbers", category: "setup", done: false },
  { id: "seed-dialer", title: "Set up a dialer + a business phone number", category: "setup", done: false },
  { id: "seed-calendar", title: "Set up your booking calendar (Calendly / GHL calendar)", category: "setup", done: false },
  // ── Cold calls ──
  { id: "seed-firstcall", title: "🔥 Make your FIRST 10 cold calls (just start — break the seal)", category: "cold-calls", done: false },
  { id: "seed-cc-daily", title: "Cold call sprint — daily reps (build toward 100+/day)", category: "cold-calls", done: false },
  { id: "seed-cc-record", title: "Record your calls + review 1 every day for mistakes", category: "cold-calls", done: false },
  { id: "seed-cc-book", title: "Book your first discovery / closing call", category: "cold-calls", done: false },
  // ── GoHighLevel ──
  { id: "seed-ghl-buy", title: "Buy GoHighLevel (start the trial / pick a plan)", category: "ghl", done: false },
  { id: "seed-ghl-learn", title: "Learn GHL — watch the onboarding + 3 tutorials", category: "ghl", done: false },
  { id: "seed-ghl-pipeline", title: "Build your GHL pipeline + lead stages", category: "ghl", done: false },
  { id: "seed-ghl-snapshot", title: "Set up a client snapshot you can deploy fast", category: "ghl", done: false },
  // ── Automations ──
  { id: "seed-auto-mct", title: "Build missed-call text-back automation in GHL", category: "automation", done: false },
  { id: "seed-auto-followup", title: "Build a follow-up / nurture sequence (SMS + email)", category: "automation", done: false },
  { id: "seed-auto-make", title: "Connect Make.com / Zapier to auto-add leads to the CRM", category: "automation", done: false },
  { id: "seed-auto-ai", title: "Build an AI booking/qualifying agent (Claude API)", category: "automation", done: false },
  // ── Learn sales ──
  { id: "seed-learn-nepq", title: "Study NEPQ / Jeremy Miner — 1 video + notes", category: "training", done: false },
  { id: "seed-learn-objections", title: "Drill objection handling — write a reframe for your top 5", category: "training", done: false },
  { id: "seed-learn-roleplay", title: "Roleplay a mock call (record + review)", category: "training", done: false },
  // ── Content + affiliate ──
  { id: "seed-content-daily", title: "Post 1 agency + main-account video (film, edit, post same day)", category: "content", done: false },
  { id: "seed-affiliate", title: "Finish + post the affiliate marketing video", category: "affiliate", done: false },
  // ── Clients ──
  { id: "seed-onboarding", title: "Build your client onboarding flow (form + welcome + access)", category: "onboarding", done: false },
];

export default function WorkListPage() {
  const [items, setItems] = useSyncedState<WorkItem[]>(
    "work:list",
    SEED.map((s) => ({ ...s, createdAt: Date.now() }))
  );
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("other");
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const filtered = items.filter((i) =>
    filter === "all" ? true : filter === "open" ? !i.done : i.done
  );

  const counts = {
    all: items.length,
    open: items.filter((i) => !i.done).length,
    done: items.filter((i) => i.done).length,
  };

  const add = () => {
    const title = newTitle.trim();
    if (!title) return;
    setItems((prev) => [
      {
        id: `w-${Date.now()}`,
        title,
        category: newCategory,
        done: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setNewTitle("");
    setNewCategory("other");
  };

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Work list · execution queue"
        title={
          <>
            Everything that <span className="gradient-electric">has to ship.</span>
          </>
        }
        subtitle="The full execution list for Avori Growth Corp — pinned items, ad-hoc tasks, follow-ups. Check off as you complete; add new ones as they come up."
        icon={Briefcase}
        accent="violet"
      />

      {/* Quick add */}
      <section className="surface-elevated rounded-2xl p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="What needs to happen? e.g. Follow up with Meridian"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white focus:border-blue-400/40 focus:outline-none"
          >
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k} className="bg-slate-900">
                {v.label}
              </option>
            ))}
          </select>
          <Button onClick={add} disabled={!newTitle.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["open", "all", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
              filter === f
                ? "border-blue-400/40 bg-blue-500/15 text-white"
                : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
            )}
          >
            {f}
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold tabular text-slate-300">
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {hydrated &&
            filtered.map((item) => {
              const meta = CATEGORY_META[item.category];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border bg-gradient-to-r p-3 transition-all",
                    meta.tone,
                    "to-transparent",
                    item.done && "opacity-50"
                  )}
                >
                  <button
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-lg border transition-all",
                      item.done
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-white/[0.1] bg-black/30 text-slate-200 hover:border-blue-400/40 hover:bg-blue-500/10"
                    )}
                  >
                    {item.done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        item.done ? "line-through text-slate-500" : "text-white"
                      )}
                    >
                      {item.title}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">
                      {meta.label}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    aria-label="Remove"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 opacity-0 transition-all hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {hydrated && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
            <div className="text-3xl">✅</div>
            <div className="mt-2 text-sm font-medium text-white">
              {filter === "open" ? "Nothing open — close out the day clean." : "Nothing here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
