"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Mic,
  Paperclip,
  Brain,
  Target,
  Calendar,
  Heart,
  Zap,
  Check,
  X as XIcon,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { chatHistory, user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useSyncedState } from "@/hooks/use-synced-state";
import type { CoachPersonality } from "@/lib/ai/types";
import { todayKey } from "@/lib/dates";
import type { LoggedMeal } from "@/components/health/meal-composer";
import type { Profile } from "@/lib/auth/types";
import { extractActions, stripActionBlocks } from "@/lib/ai/actions";
import { useAiActions } from "@/hooks/use-ai-actions";

type ActionResult = { label: string; ok: boolean };
type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
  actions?: ActionResult[];
};

const COACH_MODES: Array<{
  id: CoachPersonality;
  label: string;
  hint: string;
}> = [
  { id: "strategist", label: "Strategist", hint: "Cold, structured, calculated" },
  { id: "drill", label: "Drill sergeant", hint: "Push hard, no softness" },
  { id: "mentor", label: "Mentor", hint: "Patient, asks questions" },
  { id: "stoic", label: "Stoic", hint: "Calm, principle-driven" },
];

const suggestedPrompts = [
  { icon: Target, label: "What's my highest leverage today?" },
  { icon: Check, label: "Add a task: 50 cold calls today" },
  { icon: Heart, label: "Log 3 cups of water" },
  { icon: Calendar, label: "Plan my next 90 days" },
  { icon: Zap, label: "Push me to level up" },
  { icon: Brain, label: "Open my work list" },
];

const memoryFacts = [
  { label: "Peak window", value: "Learning…" },
  { label: "Sleep target", value: "8h" },
  { label: "Streak", value: `${user.streak}d` },
  { label: "Body weight", value: "172 lb" },
  { label: "Goal", value: "Lean & muscular" },
  { label: "Speechify min", value: "0" },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>(() =>
    chatHistory.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      time: m.time,
    }))
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const runAction = useAiActions();
  const [coachMode, setCoachMode] = useSyncedState<CoachPersonality>(
    "coach:mode",
    "strategist"
  );

  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);
  const [tasksList] = useSyncedState<Array<{ id: string; title: string }>>(
    `tasks:list:${today}`,
    []
  );
  const [completedIds] = useSyncedState<Set<string>>(
    `tasks:completed:${today}`,
    new Set<string>(),
    { serializer: "set" }
  );
  const [meals] = useSyncedState<LoggedMeal[]>(`health:meals:${today}`, []);
  const [waterCups] = useSyncedState<number>(`water:${today}`, 0);
  const [profile] = useSyncedState<Profile>("profile", {});

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const now = () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    const userMsg = {
      id: `m${Date.now()}`,
      role: "user" as const,
      content,
      time: now(),
    };
    const assistantId = `m${Date.now() + 1}`;
    setMessages((m) => [
      ...m,
      userMsg,
      { id: assistantId, role: "assistant" as const, content: "", time: now() },
    ]);
    setInput("");
    setTyping(true);

    const totalCal = meals.reduce((s, m) => s + m.calories, 0);
    const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
    const bizLine = profile.businessName
      ? `\n- Business: ${profile.businessName}${profile.businessType ? ` (${profile.businessType})` : ""}${profile.businessStage ? `, stage: ${profile.businessStage}` : ""}`
      : "";
    const goalLine = profile.primaryGoal ? `\n- #1 goal: ${profile.primaryGoal}` : "";
    const snapshot = `[Live context from Avori OS — today ${today}]
- Name: ${profile.name ?? "operator"}${bizLine}${goalLine}
- Tasks: ${completedIds.size}/${tasksList.length} complete
- Meals logged: ${meals.length} (${totalCal} kcal, ${totalProtein}g protein)
- Water: ${waterCups} cups (${(waterCups * 0.25).toFixed(2)} L)`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: snapshot },
            { role: "assistant", content: "Got it — I'll factor that in." },
            ...messages,
            userMsg,
          ].map((m) => ({ role: m.role, content: m.content })),
          personality: coachMode,
        }),
      });
      if (!res.body) throw new Error("No response stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        // Hide raw action blocks from the bubble while streaming.
        const display = stripActionBlocks(acc);
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, content: display } : msg))
        );
      }

      // Execute any in-app actions the coach emitted.
      const { clean, actions } = extractActions(acc);
      if (actions.length > 0) {
        const results: ActionResult[] = [];
        for (const action of actions) {
          const r = await runAction(action);
          results.push({ label: r.message, ok: r.ok });
        }
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: clean || "Done.", actions: results }
              : msg
          )
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages((m) =>
        m.map((msgIt) =>
          msgIt.id === assistantId
            ? { ...msgIt, content: `*(Chat error: ${msg})*` }
            : msgIt
        )
      );
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Personal AI Coach"
        title={
          <>
            Always on. <span className="gradient-electric">Always sharp.</span>
          </>
        }
        subtitle="Your strategist, coach, and accountability partner — and it can act inside the app: add tasks, log meals or water, add leads, start a call, send a text. Just ask."
        icon={Sparkles}
        accent="violet"
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Chat surface */}
        <div className="surface-elevated relative flex h-[72vh] flex-col overflow-hidden rounded-3xl">
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "mb-4 flex gap-3",
                    msg.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                      msg.role === "assistant"
                        ? "bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_0_15px_rgba(30,58,138,0.4)]"
                        : "bg-white/[0.06] text-slate-200"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      user.avatar
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "assistant"
                        ? "border border-white/[0.06] bg-white/[0.03] text-slate-100"
                        : "bg-gradient-to-br from-blue-700 to-blue-700 text-white shadow-[0_4px_20px_rgba(30,58,138,0.35)]"
                    )}
                  >
                    {msg.content}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {msg.actions.map((a, i) => (
                          <span
                            key={i}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              a.ok
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                            )}
                          >
                            {a.ok ? (
                              <Check className="h-2.5 w-2.5" />
                            ) : (
                              <XIcon className="h-2.5 w-2.5" />
                            )}
                            {a.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      className={cn(
                        "mt-1 text-[10px]",
                        msg.role === "assistant"
                          ? "text-slate-500"
                          : "text-white/60"
                      )}
                    >
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-slate-500"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex gap-1 rounded-full bg-white/[0.04] px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-white/[0.05] p-3">
            {messages.length <= 3 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {suggestedPrompts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.label}
                      onClick={() => send(p.label)}
                      className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <Icon className="h-3 w-3 text-blue-400" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/40 p-2 focus-within:border-blue-400/30 focus-within:ring-2 focus-within:ring-blue-400/20">
              <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything. Be honest with me."
                className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white">
                <Mic className="h-4 w-4" />
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_0_15px_rgba(30,58,138,0.4)] transition-all hover:shadow-[0_0_25px_rgba(30,58,138,0.6)] disabled:opacity-40 disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI memory rail */}
        <aside className="space-y-4">
          <div className="surface-card rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">AI Memory</h3>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-slate-500">
              Facts the AI remembers about you across every conversation,
              stored in a vector database and surfaced when relevant.
            </p>
            <div className="space-y-1.5">
              {memoryFacts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5"
                >
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    {f.label}
                  </span>
                  <span className="text-xs font-semibold tabular text-white">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full text-[10px] uppercase tracking-[0.15em] text-slate-400 hover:text-white">
              + Teach me something new
            </button>
          </div>

          <div className="surface-card rounded-2xl p-4">
            <h3 className="mb-1 text-sm font-semibold text-white">Coach mode</h3>
            <p className="mb-3 text-[10px] text-slate-500">
              Changes how the AI talks to you. Saved across devices.
            </p>
            <div className="space-y-2">
              {COACH_MODES.map((m) => {
                const active = coachMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCoachMode(m.id)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                      active
                        ? "border-blue-400/30 bg-blue-600/15 text-white shadow-[0_0_15px_rgba(30,58,138,0.3)]"
                        : "border-white/[0.05] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.label}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(30,58,138,0.8)]" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{m.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

