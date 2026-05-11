"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  Settings,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { user } from "@/lib/mock-data";

const nav = [
  { href: "/", label: "Today", icon: LayoutDashboard, hint: "G D" },
  { href: "/plan", label: "30-Day Plan", icon: CalendarDays, hint: "G P" },
  { href: "/tasks", label: "Tasks", icon: ListTodo, hint: "G T" },
  { href: "/discipline", label: "Discipline", icon: Flame, hint: "G I" },
  { href: "/health", label: "Health", icon: Heart, hint: "G H" },
  { href: "/agency", label: "Apex Growth", icon: Briefcase, hint: "G A" },
  { href: "/learn", label: "Learn", icon: GraduationCap, hint: "G L" },
  { href: "/assistant", label: "AI Coach", icon: Sparkles, hint: "G C" },
  { href: "/insights", label: "Insights", icon: LineChart, hint: "G N" },
  { href: "/achievements", label: "Achievements", icon: Trophy, hint: "G V" },
];

export function Sidebar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-white/[0.05] bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-2xl lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-sky-400 shadow-[0_4px_20px_rgba(30,58,138,0.5)]">
          <div className="absolute inset-0 flex items-center justify-center text-sm font-black tracking-tighter text-white">
            A
          </div>
          <div className="shimmer-bg absolute inset-0 opacity-60" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-white">APEX OS</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            v0.1 · alpha
          </span>
        </div>
      </div>

      {/* Command launcher */}
      <button
        onClick={onOpenCommand}
        className="mx-3 mb-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-slate-200"
      >
        <span className="flex items-center gap-2">
          <Command className="h-3.5 w-3.5" />
          Quick command…
        </span>
        <kbd className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "text-white"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/15 via-blue-600/10 to-transparent ring-1 ring-inset ring-blue-400/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "relative h-4 w-4 transition-colors",
                  active ? "text-blue-300" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="relative flex-1">{item.label}</span>
              <kbd className="relative hidden font-mono text-[9px] text-slate-600 group-hover:text-slate-400 xl:inline">
                {item.hint}
              </kbd>
            </Link>
          );
        })}
      </nav>

      {/* Profile / level card */}
      <div className="m-3 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-xs font-bold text-white">
              {user.avatar}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full border border-black/40 bg-gradient-to-br from-amber-400 to-amber-600 text-[8px] font-black text-black">
              {user.level}
            </div>
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-xs font-semibold text-white">{user.name}</div>
            <div className="text-[10px] text-slate-500">
              {user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP
            </div>
          </div>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(user.xp / user.xpToNext) * 100}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
          />
        </div>
        <Link
          href="/settings"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.05] py-1.5 text-[10px] uppercase tracking-[0.15em] text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200"
        >
          <Settings className="h-3 w-3" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
