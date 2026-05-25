"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  ListChecks,
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
  Camera,
  Brain,
  Droplet,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  group: "Navigate" | "Quick action";
  icon: typeof LayoutDashboard;
  label: string;
  hint?: string;
  /** Internal navigation target. */
  href?: string;
  /** Action to dispatch as a window event for pages to handle. */
  event?: string;
};

const items: Item[] = [
  { group: "Navigate", icon: LayoutDashboard, label: "Open Today", href: "/" },
  { group: "Navigate", icon: CalendarDays, label: "Open 60-Day Plan", href: "/plan" },
  { group: "Navigate", icon: ListChecks, label: "Open Work list", href: "/work" },
  { group: "Navigate", icon: CalendarDays, label: "Open Calendar", href: "/calendar" },
  { group: "Navigate", icon: ListTodo, label: "Open Tasks", href: "/tasks" },
  { group: "Navigate", icon: Flame, label: "Open Discipline Engine", href: "/discipline" },
  { group: "Navigate", icon: Heart, label: "Open Health", href: "/health" },
  { group: "Navigate", icon: Briefcase, label: "Open Apex Growth", href: "/agency" },
  { group: "Navigate", icon: GraduationCap, label: "Open Learn", href: "/learn" },
  { group: "Navigate", icon: Sparkles, label: "Open AI Coach", href: "/assistant" },
  { group: "Navigate", icon: LineChart, label: "Open Insights", href: "/insights" },
  { group: "Navigate", icon: Trophy, label: "Open Achievements", href: "/achievements" },
  {
    group: "Quick action",
    icon: Plus,
    label: "Add task",
    href: "/tasks?add=1",
    hint: "Opens the task composer",
  },
  {
    group: "Quick action",
    icon: Timer,
    label: "Start deep work block",
    href: "/?deep=1",
    hint: "Adds a 90-min deep work block to today",
  },
  {
    group: "Quick action",
    icon: Camera,
    label: "Log a meal (photo)",
    href: "/health?photo=1",
    hint: "Opens Health and triggers the photo scanner",
  },
  {
    group: "Quick action",
    icon: Plus,
    label: "Log a meal (manual)",
    href: "/health?log=1",
    hint: "Opens the manual meal composer",
  },
  {
    group: "Quick action",
    icon: Droplet,
    label: "Add a cup of water",
    event: "apex:water-cup",
    hint: "+250 mL — saves to today",
  },
  {
    group: "Quick action",
    icon: Plus,
    label: "Add a new pipeline deal",
    href: "/agency?add=deal",
    hint: "Opens Apex Growth and starts a new deal",
  },
  {
    group: "Quick action",
    icon: Upload,
    label: "Import leads from CSV",
    href: "/agency?import=1",
    hint: "HubSpot / Apollo / Sheets — drop the file",
  },
  {
    group: "Quick action",
    icon: Plus,
    label: "Add a new client",
    href: "/agency?add=client",
    hint: "Opens Apex Growth and starts a new client",
  },
  {
    group: "Quick action",
    icon: Plus,
    label: "Add a new campaign",
    href: "/agency?add=campaign",
    hint: "Opens Apex Growth and starts a new campaign",
  },
  {
    group: "Quick action",
    icon: Brain,
    label: "Ask the AI helper",
    event: "apex:open-ai",
    hint: "Opens the floating AI panel",
  },
  {
    group: "Quick action",
    icon: Flame,
    label: "Log a breach",
    href: "/discipline?breach=1",
    hint: "Opens Discipline and starts a breach log",
  },
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

  const handle = (item: Item) => {
    if (item.event) {
      window.dispatchEvent(new CustomEvent(item.event));
    }
    if (item.href) {
      router.push(item.href);
    }
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-[92vw] max-w-2xl -translate-x-1/2 animate-[scale-in_0.2s_ease-out]">
        <Command className="glass-strong overflow-hidden rounded-2xl" loop>
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
                        value={`${item.label} ${item.hint ?? ""}`}
                        onSelect={() => handle(item)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300",
                          "data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-600/15 data-[selected=true]:to-transparent data-[selected=true]:text-white"
                        )}
                      >
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="flex-1">{item.label}</span>
                        {item.hint && (
                          <span className="hidden text-[10px] text-slate-500 sm:inline">
                            {item.hint}
                          </span>
                        )}
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
