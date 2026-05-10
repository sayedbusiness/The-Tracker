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
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { chatHistory, user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  { icon: Target, label: "What's my highest leverage today?" },
  { icon: Calendar, label: "Plan my next 90 days" },
  { icon: TrendingUp, label: "Why did my output drop last week?" },
  { icon: Heart, label: "Optimize my sleep schedule" },
  { icon: Zap, label: "Push me to level up" },
  { icon: Brain, label: "Audit my consistency" },
];

const memoryFacts = [
  { label: "Peak window", value: "7–11 AM" },
  { label: "Sleep target", value: "10:45 PM" },
  { label: "Streak", value: `${user.streak}d clean` },
  { label: "Top goal Q2", value: "$150k MRR" },
  { label: "Body weight target", value: "175 lb" },
  { label: "Books this year", value: "11 / 24" },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg = {
      id: `m${Date.now()}`,
      role: "user" as const,
      content,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = generateReply(content);
      setMessages((m) => [
        ...m,
        {
          id: `m${Date.now() + 1}`,
          role: "assistant" as const,
          content: reply,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        },
      ]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Personal AI Coach"
        title={
          <>
            Always on. <span className="gradient-violet">Always sharp.</span>
          </>
        }
        subtitle="Your strategist, coach, mentor, and accountability partner. The AI knows your patterns, goals, and weaknesses — and is brutally honest by design."
        icon={Sparkles}
        accent="violet"
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Chat surface */}
        <div className="surface-elevated relative flex h-[72vh] flex-col overflow-hidden rounded-3xl">
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

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
                        ? "bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]"
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
                        : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_4px_20px_rgba(124,58,237,0.35)]"
                    )}
                  >
                    {msg.content}
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
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex gap-1 rounded-full bg-white/[0.04] px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" />
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
                      <Icon className="h-3 w-3 text-violet-400" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/40 p-2 focus-within:border-violet-400/30 focus-within:ring-2 focus-within:ring-violet-400/20">
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
                className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] disabled:opacity-40 disabled:shadow-none"
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
              <Brain className="h-4 w-4 text-violet-400" />
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
            <h3 className="mb-3 text-sm font-semibold text-white">Coach mode</h3>
            <div className="space-y-2">
              {[
                { id: "strategist", label: "Strategist", active: true },
                { id: "drill", label: "Drill sergeant", active: false },
                { id: "mentor", label: "Mentor" },
                { id: "stoic", label: "Stoic" },
              ].map((m) => (
                <button
                  key={m.id}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors",
                    m.active
                      ? "border-violet-400/30 bg-violet-500/10 text-white"
                      : "border-white/[0.05] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"
                  )}
                >
                  <span>{m.label}</span>
                  {m.active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function generateReply(input: string) {
  const i = input.toLowerCase();
  if (i.includes("leverage") || i.includes("today")) {
    return "The Meridian Capital call at 2 PM. Highest-value moment on your calendar this week. I've pulled their last 3 LinkedIn posts, their team's hiring activity, and the objection from your last call. Pre-call brief is in your inbox.";
  }
  if (i.includes("90 days") || i.includes("plan")) {
    return "Three north-stars for the next 90 days:\n\n1. Get Apex to $120k MRR (currently $83.5k — you need 3.5 new deals at $10k or to close Vertex).\n2. Body recomp to 175 lb at <12% — 5.4 lb to go, on pace.\n3. Finish Designing Data-Intensive Applications + 5 more books.\n\nI'll schedule weekly checkpoints. Want me to lock the first one?";
  }
  if (i.includes("drop") || i.includes("output")) {
    return "Two reasons:\n\n• Tuesday & Wednesday you slept 5.8 hrs avg — you're a 7-hour minimum operator. Anything less and your P0 completion drops below 70%.\n• You took 3 unscheduled calls in your peak window (8–11 AM). Each one cost you ~38 minutes of recovery.\n\nFix: lights out by 10:45 PM and lock the morning. I'll auto-decline meetings before noon starting tomorrow.";
  }
  if (i.includes("sleep")) {
    return "Your sleep optimization plan:\n\n• Lights out 10:30 PM, wake 5:45 AM — your data shows this window gives you 92% deep work next-day.\n• No screens after 10:00 PM. Kindle + paperback only.\n• Magnesium glycinate 30 min before bed.\n• Bedroom temp 65°F.\n\nI'll send a 9:45 PM wind-down ping starting tonight.";
  }
  if (i.includes("push") || i.includes("level")) {
    return "Tomorrow we add a 4th deep work block. Difficulty rating moves from 3.6 → 4.0. You'll feel the extra weight. That's the point.\n\nNon-negotiables for tomorrow:\n• 5:30 AM wake — no snooze\n• Workout before email\n• Phone in another room until 11 AM\n• Meridian prep done by 12:30\n\nI'll be watching. So will you.";
  }
  if (i.includes("audit") || i.includes("consistency")) {
    return "Last 30 days:\n\n✓ Workouts: 24/30 (80% — elite)\n✓ Sleep ≥ 7h: 22/30 (73% — needs work)\n✓ Deep work ≥ 3 blocks: 26/30 (87% — elite)\n✓ Reading: 30/30 (100% — keep it)\n✗ Phone < 2h: 18/30 (60% — drag)\n\nYour weakest link is phone discipline. Want me to enable Forest mode lock 9 PM → 7 AM?";
  }
  return "Got it. Give me a moment to think through this against your last 30 days of data, your active goals, and your energy curve. The honest answer is coming.";
}
