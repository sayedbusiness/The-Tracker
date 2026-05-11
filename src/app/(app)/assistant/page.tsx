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
  { label: "Peak window", value: "Learning…" },
  { label: "Sleep target", value: "Set it" },
  { label: "Streak", value: `${user.streak}d` },
  { label: "Body weight", value: "167 lb" },
  { label: "Goal", value: "Lean & muscular" },
  { label: "Books this year", value: "0" },
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          personality: "strategist",
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
        setMessages((m) =>
          m.map((msg) => (msg.id === assistantId ? { ...msg, content: acc } : msg))
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
        subtitle="Your strategist, coach, mentor, and accountability partner. The AI knows your patterns, goals, and weaknesses — and is brutally honest by design."
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
                      ? "border-blue-400/30 bg-blue-600/10 text-white"
                      : "border-white/[0.05] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"
                  )}
                >
                  <span>{m.label}</span>
                  {m.active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(30,58,138,0.8)]" />
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

