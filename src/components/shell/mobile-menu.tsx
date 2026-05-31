"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Calendar,
  ListTodo,
  Flame,
  Heart,
  Briefcase,
  GraduationCap,
  Sparkles,
  LineChart,
  Trophy,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { user } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth/use-auth";
import { useSyncedState } from "@/hooks/use-synced-state";
import { usePending } from "@/components/notifications/pending-provider";
import type { Profile } from "@/lib/auth/types";

const NAV: { href: string; label: string; icon: LucideIcon; section?: "today" | "tasks" | "work" | "health" | "plan" }[] = [
  { href: "/", label: "Today", icon: LayoutDashboard, section: "today" },
  { href: "/plan", label: "60-Day Plan", icon: CalendarDays, section: "plan" },
  { href: "/work", label: "Work list", icon: ListChecks, section: "work" },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: ListTodo, section: "tasks" },
  { href: "/discipline", label: "Discipline", icon: Flame },
  { href: "/health", label: "Health", icon: Heart, section: "health" },
  { href: "/agency", label: "Avori Growth · CRM", icon: Briefcase },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/assistant", label: "AI Coach", icon: Sparkles },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * Mobile-only menu. The desktop sidebar is hidden on phones, which left
 * Settings (and other secondary pages) unreachable. This avatar button +
 * slide-down sheet gives phones the full nav, including Settings + sign out.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user: authUser, signedIn, signOut } = useAuth();
  const [profile] = useSyncedState<Profile>("profile", {});
  const { sectionCounts } = usePending();

  const name = profile.name?.trim() || user.name;

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-[61] flex w-[82vw] max-w-xs flex-col border-r border-white/10 bg-[#0b1120] shadow-[0_0_80px_rgba(0,0,0,0.9)]"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-sm font-black text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="truncate text-sm font-semibold text-white">{name}</div>
                    <div className="truncate text-[10px] text-slate-500">
                      {signedIn ? authUser?.email : "Avori OS"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
                {NAV.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  const count = item.section ? sectionCounts[item.section] : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-gradient-to-r from-blue-600/20 to-transparent text-white ring-1 ring-inset ring-blue-400/20"
                          : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-blue-300" : "text-slate-500")} />
                      <span className="flex-1">{item.label}</span>
                      {count > 0 && (
                        <span className="grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-rose-500/90 px-1 text-[9px] font-black text-white">
                          {count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {signedIn && (
                <button
                  onClick={signOut}
                  className="m-3 flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                  style={{ marginBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
