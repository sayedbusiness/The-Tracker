"use client";

import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Sparkles,
  Database,
  Smartphone,
  Moon,
  Zap,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Badge } from "@/components/ui/badge";
import { user } from "@/lib/mock-data";

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
              {user.avatar}
            </div>
            <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-black bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-black text-black">
              {user.level}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-semibold text-white">{user.name}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
            <div className="mt-1 flex items-center gap-2 text-[10px]">
              <Badge variant="violet">OPERATOR · TIER IV</Badge>
              <Badge variant="emerald">APEX PLUS</Badge>
            </div>
          </div>
        </div>
      </section>

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
        APEX OS v0.1 · alpha · made with discipline
      </div>
    </div>
  );
}
