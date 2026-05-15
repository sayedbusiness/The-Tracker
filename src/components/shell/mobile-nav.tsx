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

const items = [
  { href: "/", icon: LayoutDashboard, label: "Today" },
  { href: "/work", icon: ListChecks, label: "Work" },
  { href: "/calendar", icon: Calendar, label: "Cal" },
  { href: "/health", icon: Heart, label: "Health" },
  { href: "/assistant", icon: Sparkles, label: "AI" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="glass-strong mx-auto flex max-w-md items-center justify-between rounded-2xl px-2 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] transition-colors",
                active ? "text-white" : "text-slate-500"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active && "text-blue-300 drop-shadow-[0_0_8px_rgba(30,58,138,0.7)]"
                )}
              />
              <span className={cn(active && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
