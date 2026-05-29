"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Calendar,
  Sparkles,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePending } from "@/components/notifications/pending-provider";

const items = [
  { href: "/", icon: LayoutDashboard, label: "Today", section: "today" as const },
  { href: "/work", icon: ListChecks, label: "Work", section: "work" as const },
  { href: "/calendar", icon: Calendar, label: "Cal", section: null },
  { href: "/health", icon: Heart, label: "Health", section: "health" as const },
  { href: "/assistant", icon: Sparkles, label: "AI", section: null },
];

export function MobileNav() {
  const pathname = usePathname();
  const { sectionCounts } = usePending();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="glass-strong mx-auto flex max-w-md items-center justify-between rounded-2xl px-2 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const badge = item.section ? sectionCounts[item.section] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] transition-colors",
                active ? "text-white" : "text-slate-500"
              )}
            >
              <span className="relative">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active && "text-blue-300 drop-shadow-[0_0_8px_rgba(30,58,138,0.7)]"
                  )}
                />
                {badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid min-h-[14px] min-w-[14px] place-items-center rounded-full bg-rose-500 px-0.5 text-[8px] font-black text-white ring-2 ring-black">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className={cn(active && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
