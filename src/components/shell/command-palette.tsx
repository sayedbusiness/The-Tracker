"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  Flame,
  Heart,
  Briefcase,
  GraduationCap,
  Sparkles,
  LineChart,
  Trophy,
  Plus,
  Timer,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { group: "Navigate", icon: LayoutDashboard, label: "Open Today", action: "/" },
  { group: "Navigate", icon: CalendarDays, label: "Open 30-Day Plan", action: "/plan" },
  { group: "Navigate", icon: ListTodo, label: "Open Work list", action: "/work" },
  { group: "Navigate", icon: CalendarDays, label: "Open Calendar", action: "/calendar" },
  { group: "Navigate", icon: ListTodo, label: "Open Tasks", action: "/tasks" },
  { group: "Navigate", icon: Flame, label: "Open Discipline Engine", action: "/discipline" },
  { group: "Navigate", icon: Heart, label: "Open Health", action: "/health" },
  { group: "Navigate", icon: Briefcase, label: "Open Apex Growth", action: "/agency" },
  { group: "Navigate", icon: GraduationCap, label: "Open Learn", action: "/learn" },
  { group: "Navigate", icon: Sparkles, label: "Open AI Coach", action: "/assistant" },
  { group: "Navigate", icon: LineChart, label: "Open Insights", action: "/insights" },
  { group: "Navigate", icon: Trophy, label: "Open Achievements", action: "/achievements" },
  { group: "Quick action", icon: Plus, label: "Add task" },
  { group: "Quick action", icon: Timer, label: "Start deep work block" },
  { group: "Quick action", icon: Plus, label: "Log a meal (photo)" },
  { group: "Quick action", icon: Plus, label: "Add a new pipeline deal" },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-[92vw] max-w-2xl -translate-x-1/2 animate-[scale-in_0.2s_ease-out]">
        <Command
          className="glass-strong overflow-hidden rounded-2xl"
          loop
        >
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
            <Search className="h-4 w-4 text-slate-400" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search…"
              className="flex h-12 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <kbd className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-slate-500">
              No results.
            </Command.Empty>
            {Array.from(new Set(items.map((i) => i.group))).map((group) => (
              <Command.Group
                key={group}
                heading={group}
                className="mb-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                {items
                  .filter((i) => i.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.label}
                        onSelect={() => {
                          if (item.action) router.push(item.action);
                          onOpenChange(false);
                        }}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300",
                          "data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-600/15 data-[selected=true]:to-transparent data-[selected=true]:text-white"
                        )}
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="flex-1">{item.label}</span>
                      </Command.Item>
                    );
                  })}
              </Command.Group>
            ))}
          </Command.List>
          <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-2">
              <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono">↑↓</span>
              navigate
            </span>
            <span className="flex items-center gap-2">
              <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono">↵</span>
              select
            </span>
          </div>
        </Command>
      </div>
    </>
  );
}
