"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSyncedState } from "@/hooks/use-synced-state";
import type { Profile } from "@/lib/auth/types";

export default function OnboardingPage() {
  const [profile, setProfile] = useSyncedState<Profile>("profile", {});
  const [draft, setDraft] = useState<Profile>({});
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Seed the draft from any existing profile once.
  useEffect(() => {
    setDraft((d) => (Object.keys(d).length === 0 ? profile : d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const toggleMotivation = (m: string) =>
    setDraft((d) => {
      const cur = d.motivations ?? [];
      return {
        ...d,
        motivations: cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m],
      };
    });

  const steps = useMemo(
    () => [
      {
        title: "What should we call you?",
        subtitle: "This is your command center. Make it yours.",
        body: (
          <TextField
            value={draft.name ?? ""}
            onChange={(v) => set("name", v)}
            placeholder="Your name"
            autoFocus
          />
        ),
        valid: () => (draft.name ?? "").trim().length > 0,
      },
      {
        title: "The basics",
        subtitle: "So the plan fits your real day.",
        body: (
          <div className="space-y-3">
            <NumberField label="Age" value={draft.age} onChange={(v) => set("age", v)} placeholder="e.g. 19" />
            <ChipSelect
              label="Faith / spiritual practice (optional)"
              value={draft.faith}
              onChange={(v) => set("faith", v)}
              options={["Muslim", "Christian", "Other", "Prefer not to say"]}
            />
            <TextField
              label="What time do you wake up?"
              value={draft.wakeTime ?? ""}
              onChange={(v) => set("wakeTime", v)}
              placeholder="e.g. 4:00 AM"
            />
          </div>
        ),
        valid: () => true,
      },
      {
        title: "Your business",
        subtitle: "What are you building?",
        body: (
          <div className="space-y-3">
            <ChipSelect
              label="Type of business"
              value={draft.businessType}
              onChange={(v) => set("businessType", v)}
              options={["Agency / SMMA", "Freelance", "E-commerce", "Coaching", "Local services", "Other"]}
            />
            <ChipSelect
              label="Where are you at?"
              value={draft.businessStage}
              onChange={(v) => set("businessStage", v)}
              options={["Just starting", "First clients", "Scaling", "Established"]}
            />
          </div>
        ),
        valid: () => true,
      },
      {
        title: "The mission",
        subtitle: "Name the number. We'll build toward it.",
        body: (
          <div className="space-y-3">
            <TextField
              label="Your #1 goal right now"
              value={draft.primaryGoal ?? ""}
              onChange={(v) => set("primaryGoal", v)}
              placeholder="e.g. Land my first 3 agency clients"
            />
            <ChipSelect
              label="Monthly income goal"
              value={draft.incomeGoal}
              onChange={(v) => set("incomeGoal", v)}
              options={["$5k/mo", "$10k/mo", "$20k/mo", "$50k+/mo"]}
            />
          </div>
        ),
        valid: () => true,
      },
      {
        title: "How you work",
        subtitle: "No school — so where do you lock in?",
        body: (
          <div className="space-y-3">
            <ChipSelect
              label="Primary work spot"
              value={draft.workStyle}
              onChange={(v) => set("workStyle", v)}
              options={["Home", "Starbucks", "Both", "Office"]}
            />
            <NumberField
              label="Hours of deep work per day"
              value={draft.hoursPerDay}
              onChange={(v) => set("hoursPerDay", v)}
              placeholder="e.g. 8"
            />
            <TextArea
              label="Describe your day-to-day"
              value={draft.dayStructure ?? ""}
              onChange={(v) => set("dayStructure", v)}
              placeholder="e.g. Wake 4am, Fajr, cold calls AM, gym PM, content at night…"
            />
          </div>
        ),
        valid: () => true,
      },
      {
        title: "Your body",
        subtitle: "We track health against your work — they're linked.",
        body: (
          <div className="space-y-3">
            <NumberField label="Current weight (lb)" value={draft.weightLb} onChange={(v) => set("weightLb", v)} placeholder="e.g. 172" />
            <NumberField label="Goal weight (lb)" value={draft.goalWeightLb} onChange={(v) => set("goalWeightLb", v)} placeholder="e.g. 158" />
            <NumberField label="Height (inches)" value={draft.heightIn} onChange={(v) => set("heightIn", v)} placeholder="e.g. 70" />
          </div>
        ),
        valid: () => true,
      },
      {
        title: "What drives you",
        subtitle: "The system uses this when you want to quit.",
        body: (
          <div className="space-y-3">
            <ChipSelect
              label="Experience level"
              value={draft.experienceLevel}
              onChange={(v) => set("experienceLevel", v)}
              options={["Beginner", "Intermediate", "Advanced"]}
            />
            <TextField
              label="Biggest struggle right now"
              value={draft.biggestStruggle ?? ""}
              onChange={(v) => set("biggestStruggle", v)}
              placeholder="e.g. Consistency, fear of the phone, focus…"
            />
            <MultiChip
              label="What motivates you? (pick all)"
              values={draft.motivations ?? []}
              onToggle={toggleMotivation}
              options={["Money", "Freedom", "Family", "Faith", "Prove doubters wrong", "Discipline", "Health"]}
            />
          </div>
        ),
        valid: () => true,
      },
    ],
    [draft]
  );

  const total = steps.length;
  const current = steps[step];
  const isLast = step === total - 1;
  const progress = ((step + 1) / total) * 100;

  const next = () => {
    if (!current.valid()) return;
    if (isLast) finish();
    else setStep((s) => Math.min(total - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    setSaving(true);
    setProfile({ ...profile, ...draft, onboardingComplete: true, updatedAt: Date.now() });
    setTimeout(() => {
      if (typeof window !== "undefined") window.location.assign("/");
    }, 500);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/2 -left-1/4 h-[140%] w-[140%] rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.18),transparent_50%)]" />
        <div className="absolute -bottom-1/2 right-0 h-full w-full rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative w-full max-w-lg overflow-hidden rounded-3xl p-7 sm:p-9"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <span className="flex items-center gap-1.5 text-blue-300">
              <Sparkles className="h-3 w-3" /> Personalize Avori
            </span>
            <span>
              {step + 1} / {total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-blue-600 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {current.title}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{current.subtitle}</p>
            <div className="mt-5">{current.body}</div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <Button size="lg" onClick={next} disabled={!current.valid() || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Building your system…
              </>
            ) : isLast ? (
              <>
                <Check className="h-4 w-4" /> Lock it in
              </>
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Field primitives ──────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all focus:border-blue-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-400/20";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-xs font-medium text-slate-400">{children}</div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`${inputCls} resize-none`}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function ChipSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "border-blue-400/40 bg-blue-600/25 text-white shadow-[0_0_14px_rgba(59,130,246,0.35)]"
                  : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiChip({
  label,
  values,
  onToggle,
  options,
}: {
  label: string;
  values: string[];
  onToggle: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "border-emerald-400/40 bg-emerald-600/25 text-white shadow-[0_0_14px_rgba(16,185,129,0.3)]"
                  : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white"
              }`}
            >
              {active && <Check className="mr-1 inline h-3 w-3" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
