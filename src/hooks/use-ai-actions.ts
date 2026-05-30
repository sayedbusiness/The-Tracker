"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSyncedState } from "@/hooks/use-synced-state";
import { todayKey } from "@/lib/dates";
import type { ParsedAction } from "@/lib/ai/actions";
import type { LoggedMeal } from "@/components/health/meal-composer";

interface RunResult {
  ok: boolean;
  message: string;
}

// Loose shapes matching what each page stores.
interface Task {
  id: string;
  title: string;
  category: string;
  priority: string;
  estimated: number;
  difficulty: number;
  energy: string;
}
interface WorkItem {
  id: string;
  title: string;
  category: string;
  done: boolean;
  createdAt: number;
}
interface Deal {
  id: string;
  company: string;
  contact: string;
  phone?: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  source: string;
}
interface WeightEntry {
  date: string;
  weight: number;
}
interface Challenge {
  id: string;
  name: string;
  target: string;
  total: number;
  reward: string;
  progress: number;
  active: boolean;
}

const ROUTES = new Set([
  "/", "/tasks", "/work", "/health", "/agency", "/plan",
  "/discipline", "/learn", "/insights", "/achievements", "/settings", "/calendar",
]);
const TASK_CATS = new Set(["deep-work", "agency", "health", "learning", "personal"]);
const WORK_CATS = new Set(["setup", "cold-calls", "ghl", "automation", "training", "content", "affiliate", "onboarding", "calls", "hiring", "other"]);
const STAGES = new Set(["lead", "qualified", "proposal", "negotiation", "won", "lost"]);
const MEALS = new Set(["Breakfast", "Lunch", "Dinner", "Snack", "Drink"]);

const str = (v: unknown, d = "") => (typeof v === "string" ? v : v == null ? d : String(v));
const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const oneOf = (v: unknown, set: Set<string>, d: string) => {
  const s = str(v);
  return set.has(s) ? s : d;
};

/**
 * Returns `run(action)` — executes a single parsed AI action against the
 * app's synced state and returns a human confirmation. All capabilities
 * are in-app only.
 */
export function useAiActions() {
  const router = useRouter();
  const [today, setToday] = useState("ssr");
  useEffect(() => setToday(todayKey()), []);

  const [, setTasks] = useSyncedState<Task[]>(`tasks:list:${today}`, []);
  const [, setWork] = useSyncedState<WorkItem[]>("work:list", []);
  const [, setPipeline] = useSyncedState<Deal[]>("agency:pipeline", []);
  const [, setWater] = useSyncedState<number>(`water:${today}`, 0);
  const [, setSteps] = useSyncedState<number>(`health:steps:${today}`, 0);
  const [, setWeight] = useSyncedState<WeightEntry[]>("health:weight:history", []);
  const [, setMealsLog] = useSyncedState<LoggedMeal[]>(`health:meals:${today}`, []);
  const [, setChallenges] = useSyncedState<Challenge[]>("discipline:challenges", []);

  return useCallback(
    async ({ tool, args }: ParsedAction): Promise<RunResult> => {
      const id = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      switch (tool) {
        case "add_task": {
          const title = str(args.title).trim();
          if (!title) return { ok: false, message: "No task title" };
          setTasks((prev) => [
            {
              id: id("t"),
              title,
              category: oneOf(args.category, TASK_CATS, "deep-work"),
              priority: oneOf(args.priority, new Set(["p0", "p1", "p2", "p3"]), "p1"),
              estimated: Math.max(5, num(args.estimated, 30)),
              difficulty: Math.min(5, Math.max(1, num(args.difficulty, 3))),
              energy: oneOf(args.energy, new Set(["low", "med", "high"]), "med"),
            },
            ...prev,
          ]);
          return { ok: true, message: `Added task: ${title}` };
        }
        case "add_work_item": {
          const title = str(args.title).trim();
          if (!title) return { ok: false, message: "No work item title" };
          setWork((prev) => [
            { id: id("w"), title, category: oneOf(args.category, WORK_CATS, "other"), done: false, createdAt: Date.now() },
            ...prev,
          ]);
          return { ok: true, message: `Added to work list: ${title}` };
        }
        case "add_lead": {
          const company = str(args.company).trim() || str(args.contact).trim();
          if (!company) return { ok: false, message: "No company/contact" };
          setPipeline((prev) => [
            {
              id: id("d"),
              company,
              contact: str(args.contact).trim() || "—",
              phone: str(args.phone).trim(),
              value: num(args.value, 0),
              stage: oneOf(args.stage, STAGES, "lead"),
              probability: Math.min(100, Math.max(0, num(args.probability, 20))),
              closeDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
              source: "ai-coach",
            },
            ...prev,
          ]);
          return { ok: true, message: `Added lead: ${company}` };
        }
        case "log_water": {
          const cups = Math.max(0, Math.round(num(args.cups, 1)));
          setWater((prev) => prev + cups);
          return { ok: true, message: `Logged ${cups} cup${cups === 1 ? "" : "s"} of water` };
        }
        case "log_steps": {
          const steps = Math.max(0, Math.round(num(args.steps, 0)));
          setSteps(steps);
          return { ok: true, message: `Set steps to ${steps.toLocaleString()}` };
        }
        case "log_weight": {
          const lb = Math.round(num(args.lb, 0) * 10) / 10;
          if (lb <= 0) return { ok: false, message: "Invalid weight" };
          setWeight((prev) => {
            const filtered = prev.filter((e) => e.date !== today);
            return [...filtered, { date: today, weight: lb }].sort((a, b) => a.date.localeCompare(b.date));
          });
          return { ok: true, message: `Logged weight: ${lb} lb` };
        }
        case "add_meal": {
          const name = str(args.name).trim();
          const calories = num(args.calories, 0);
          if (!name || calories <= 0) return { ok: false, message: "Meal needs a name + calories" };
          setMealsLog((prev) => [
            {
              id: id("m"),
              meal: oneOf(args.meal, MEALS, "Snack") as LoggedMeal["meal"],
              name,
              calories,
              protein: num(args.protein, 0),
              carbs: num(args.carbs, 0),
              fat: num(args.fat, 0),
              time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
              loggedAt: Date.now(),
            },
            ...prev,
          ]);
          return { ok: true, message: `Logged meal: ${name} (${calories} kcal)` };
        }
        case "create_challenge": {
          const name = str(args.name).trim();
          if (!name) return { ok: false, message: "No challenge name" };
          setChallenges((prev) => [
            ...prev,
            {
              id: id("c"),
              name,
              target: str(args.target).trim() || "Custom challenge",
              total: Math.max(1, num(args.total, 30)),
              reward: str(args.reward).trim() || "+1000 XP",
              progress: 0,
              active: true,
            },
          ]);
          return { ok: true, message: `Started challenge: ${name}` };
        }
        case "send_text": {
          const to = str(args.to).trim();
          const body = str(args.body).trim();
          if (!to || !body) return { ok: false, message: "Text needs a number + message" };
          try {
            const res = await fetch("/api/twilio/sms/send", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ to, body }),
            });
            if (res.status === 503) return { ok: false, message: "Twilio SMS isn't connected yet" };
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) return { ok: false, message: data.error || "Text failed" };
            return { ok: true, message: `Texted ${to}` };
          } catch {
            return { ok: false, message: "Network error sending text" };
          }
        }
        case "start_call": {
          const to = str(args.to).trim();
          if (!to) return { ok: false, message: "No number to call" };
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("apex:dial", { detail: { number: to } }));
          }
          router.push("/agency?dialer=1");
          return { ok: true, message: `Opened dialer for ${to}` };
        }
        case "navigate": {
          const to = str(args.to).trim();
          if (!ROUTES.has(to)) return { ok: false, message: `Can't open ${to}` };
          router.push(to);
          return { ok: true, message: `Opened ${to}` };
        }
        default:
          return { ok: false, message: `Unknown action: ${tool}` };
      }
    },
    [router, today, setTasks, setWork, setPipeline, setWater, setSteps, setWeight, setMealsLog, setChallenges]
  );
}
