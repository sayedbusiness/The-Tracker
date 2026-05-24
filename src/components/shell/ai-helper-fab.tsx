"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Loader2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import type { LoggedMeal } from "@/components/health/meal-composer";
import type { CoachPersonality } from "@/lib/ai/types";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const SEED: Msg[] = [
  {
    id: "seed",
    role: "assistant",
    content:
      "Hey — I'm your AI helper. Ask me anything about your day, your plan, your numbers. I see everything you've logged.",
  },
];

/**
 * Floating AI chat surface available on every page.
 * Backed by /api/chat which streams via Claude. Conversation is held
 * in memory for the session (no persistence yet — switching pages keeps
 * the panel open via a portal-friendly fixed-position layout).
 */
export function AiHelperFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [coachMode] = useSyncedState<CoachPersonality>(
    "coach:mode",
    "strategist"
  );

  // Pull synced state so the AI knows what's actually going on today.
  const [today, setToday] = useState<string>("ssr");
  useEffect(() => {
    setToday(todayKey());
  }, []);
  const [tasksList] = useSyncedState<Array<{ title: string; priority: string; category: string }>>(
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

  // Listen for command-palette "open AI" event.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("apex:open-ai", onOpen);
    return () => window.removeEventListener("apex:open-ai", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [open, messages, busy]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content };
    const assistantId = `a-${Date.now() + 1}`;
    setMessages((m) => [
      ...m,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setBusy(true);

    // Inject a compact live-state snapshot into the conversation so the
    // AI's first reply already knows what the user has logged today.
    const totalCal = meals.reduce((s, m) => s + m.calories, 0);
    const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
    const snapshot = `[Live context from APEX OS — today ${today}]
- Tasks: ${completedIds.size}/${tasksList.length} complete
- Meals logged: ${meals.length} (${totalCal} kcal, ${totalProtein}g protein)
- Water: ${waterCups} cups (${(waterCups * 0.25).toFixed(2)} L)
Coach mode: ${coachMode}`;

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
        setMessages((m) =>
          m.map((mm) =>
            mm.id === assistantId ? { ...mm, content: acc } : mm
          )
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setMessages((m) =>
        m.map((mm) =>
          mm.id === assistantId
            ? { ...mm, content: `*(AI error: ${msg})*` }
            : mm
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI helper"
        className={cn(
          "fixed z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-blue-600 to-sky-400 text-white shadow-[0_8px_30px_rgba(30,58,138,0.55)] transition-all hover:shadow-[0_12px_40px_rgba(59,130,246,0.7)]",
          "right-4 lg:right-6"
        )}
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="s"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong fixed z-40 flex flex-col overflow-hidden rounded-3xl"
              style={{
                bottom: "calc(env(safe-area-inset-bottom) + 5.5rem + 5rem)",
                right: "1rem",
                width: "min(380px, calc(100vw - 2rem))",
                height: "min(560px, calc(100vh - 14rem))",
              }}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      APEX AI helper
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Knows your plan · stats · tasks
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mb-3 flex gap-2",
                        m.role === "user" && "flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                          m.role === "assistant"
                            ? "bg-gradient-to-br from-blue-600 to-sky-400 text-white"
                            : "bg-white/[0.08] text-slate-200"
                        )}
                      >
                        {m.role === "assistant" ? (
                          <Brain className="h-3.5 w-3.5" />
                        ) : (
                          "S"
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[78%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                          m.role === "assistant"
                            ? "border border-white/[0.06] bg-white/[0.03] text-slate-100"
                            : "bg-gradient-to-br from-blue-700 to-blue-700 text-white"
                        )}
                      >
                        {m.content || (busy && m.role === "assistant" ? "…" : "")}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {busy && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking…
                  </div>
                )}
              </div>

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5 border-t border-white/[0.05] px-3 py-2">
                  {[
                    "What's my highest-leverage task right now?",
                    "How is my macros vs. target?",
                    "Audit my cold call ramp this week.",
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-white/[0.05] p-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/40 p-1.5 focus-within:border-blue-400/30 focus-within:ring-2 focus-within:ring-blue-400/20">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask the AI anything…"
                    className="flex-1 bg-transparent px-2 text-[13px] text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || busy}
                    className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_2px_10px_rgba(30,58,138,0.4)] hover:shadow-[0_4px_15px_rgba(30,58,138,0.6)] disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
