"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  BellRing,
  Shield,
  Sparkles,
  Database,
  Smartphone,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import { user } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth/use-auth";
import { useSyncedState } from "@/hooks/use-synced-state";
import type { Profile } from "@/lib/auth/types";

const sections = [
  {
    title: "Profile",
    icon: User,
    items: [
      { label: "Display name", value: user.name },
      { label: "Email", value: user.email },
      { label: "Time zone", value: "America/Los_Angeles" },
      { label: "Member since", value: "May 25, 2026" },
    ],
  },
  {
    title: "AI behavior",
    icon: Sparkles,
    items: [
      { label: "Coach personality", value: "Strategist", badge: "active" },
      { label: "Honesty level", value: "Brutal · 9/10" },
      { label: "Daily check-in time", value: "7:00 AM" },
      { label: "Auto-difficulty scaling", value: "Enabled", badge: "on" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Morning brief", value: "7:00 AM · daily" },
      { label: "Discipline alerts", value: "Real-time" },
      { label: "Wind-down reminder", value: "9:45 PM" },
      { label: "Weekly review", value: "Sunday · 8 PM" },
    ],
  },
  {
    title: "Integrations",
    icon: Database,
    items: [
      { label: "Google Calendar", value: "Connect from Calendar tab" },
      { label: "Apple HealthKit", value: "Not connected" },
      { label: "Whoop / Oura", value: "Not connected" },
      { label: "Notion (knowledge)", value: "Not connected" },
    ],
  },
  {
    title: "Devices",
    icon: Smartphone,
    items: [
      { label: "Cross-device sync", value: "Via Supabase", badge: "on" },
      { label: "Local cache", value: "localStorage", badge: "on" },
    ],
  },
  {
    title: "Privacy & data",
    icon: Shield,
    items: [
      { label: "Local-first storage", value: "Enabled", badge: "on" },
      { label: "End-to-end encryption", value: "256-bit AES", badge: "on" },
      { label: "AI training opt-out", value: "Opted out", badge: "on" },
      { label: "Export full archive", value: "Download .zip" },
    ],
  },
];

export default function SettingsPage() {
  const { user: authUser, signedIn, signOut } = useAuth();
  const [profile] = useSyncedState<Profile>("profile", {});

  const displayName = profile.name?.trim() || user.name;
  const displayEmail = authUser?.email || user.email;
  const avatar = displayName.charAt(0).toUpperCase() || "A";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="System settings"
        title="Configure your operating system"
        subtitle="Every dial on the machine. Tune it once, then forget it."
        icon={SettingsIcon}
        accent="cyan"
      />

      {/* Profile hero */}
      <section className="surface-elevated relative overflow-hidden rounded-3xl p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-sky-400 text-2xl font-black text-white shadow-[0_0_30px_rgba(30,58,138,0.5)]">
              {avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-black text-black">
              {user.level}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-semibold text-white">{displayName}</div>
            <div className="truncate text-sm text-slate-400">{displayEmail}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
              <Badge variant="violet">
                {profile.businessType ? profile.businessType.toUpperCase() : "OPERATOR"}
              </Badge>
              {profile.incomeGoal && <Badge variant="emerald">{profile.incomeGoal} GOAL</Badge>}
            </div>
          </div>
          {signedIn && (
            <button
              onClick={signOut}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          )}
        </div>
      </section>

      <AccountPanel onboarded={Boolean(profile.onboardingComplete)} />

      {sections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="surface-card overflow-hidden rounded-2xl"
          >
            <div className="border-b border-white/[0.04] px-5 py-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">{section.title}</h2>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{item.value}</span>
                    {item.badge === "on" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    )}
                    {item.badge === "active" && <Badge variant="violet">ACTIVE</Badge>}
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        );
      })}

      <div className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">
        Avori OS v0.1 · alpha · made with discipline
      </div>
    </div>
  );
}

/** Live, interactive account + reminders controls. */
function AccountPanel({ onboarded }: { onboarded: boolean }) {
  const [notif, setNotif] = useSyncedState<boolean>("settings:notifications", false);
  // Start "unsupported" so SSR + first client render match, then read the
  // real permission after mount.
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const enable = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const res = await Notification.requestPermission();
    setPermission(res);
    if (res === "granted") setNotif(true);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card overflow-hidden rounded-2xl"
    >
      <div className="border-b border-white/[0.04] px-5 py-4">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Reminders & personalization</h2>
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <div className="text-sm text-slate-200">Push reminders</div>
            <div className="text-[11px] text-slate-500">
              Get nudged about calls, tasks, habits & health while the app is open.
            </div>
          </div>
          {permission === "granted" ? (
            <button
              onClick={() => setNotif((v) => !v)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                notif ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.06] text-slate-400"
              }`}
            >
              {notif ? "ON" : "OFF"}
            </button>
          ) : permission === "unsupported" ? (
            <span className="text-[11px] text-slate-500">Not supported</span>
          ) : (
            <button
              onClick={enable}
              className="rounded-lg bg-blue-600/90 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-600"
            >
              Enable
            </button>
          )}
        </div>
        <Link
          href="/onboarding"
          className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-white/[0.02]"
        >
          <div>
            <div className="text-sm text-slate-200">
              {onboarded ? "Edit your personalization" : "Finish personalization"}
            </div>
            <div className="text-[11px] text-slate-500">
              Age, business, goals, work style, body — retune anytime.
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        </Link>
      </div>
    </motion.section>
  );
}
