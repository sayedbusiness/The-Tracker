"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Check, ChevronRight } from "lucide-react";
import { usePending } from "@/components/notifications/pending-provider";
import { useSyncedState } from "@/hooks/use-synced-state";

/**
 * The notification bell + dropdown. Surfaces everything still open today
 * (calls, tasks, quests, habits, health logs) and lets the user turn on
 * browser push reminders so the app nudges them even when it's closed.
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { actions, count } = usePending();
  const [notif, setNotif] = useSyncedState<boolean>("settings:notifications", false);
  // Start "unsupported" so SSR + first client render match, then read the
  // real permission after mount (avoids a hydration mismatch).
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const enable = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setNotif(true);
      new Notification("APEX OS reminders are on 🔔", {
        body: "I'll nudge you about what's left — calls, tasks, habits, health.",
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
        aria-label="Notifications"
      >
        {count > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-black">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="glass-strong absolute right-3 top-14 z-50 max-h-[70vh] w-[88vw] max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] lg:right-8"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="text-sm font-semibold text-white">
                  {count > 0 ? `${count} thing${count === 1 ? "" : "s"} to do` : "All caught up"}
                </div>
                {count > 0 && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    LIVE
                  </span>
                )}
              </div>

              {permission !== "granted" && permission !== "unsupported" && (
                <button
                  onClick={enable}
                  className="flex w-full items-center gap-2 border-b border-white/[0.06] bg-blue-600/10 px-4 py-2.5 text-left text-xs text-blue-200 transition-colors hover:bg-blue-600/20"
                >
                  <BellRing className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <b>Turn on reminders</b> — get nudged about what's left, even when the app is closed.
                  </span>
                </button>
              )}
              {permission === "granted" && (
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" /> Reminders on
                  </span>
                  <button
                    onClick={() => setNotif((v) => !v)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${notif ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.06] text-slate-400"}`}
                  >
                    {notif ? "ON" : "OFF"}
                  </button>
                </div>
              )}

              <div className="max-h-[52vh] overflow-y-auto p-2">
                {count === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <div className="text-3xl">🎯</div>
                    <div className="mt-2 text-sm font-medium text-white">
                      Nothing open. Clean day.
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Come back tomorrow to keep the streak alive.
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {actions.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={a.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-blue-400/30 hover:bg-blue-500/[0.07]"
                        >
                          <span className="text-lg">{a.emoji}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">
                              {a.label}
                            </span>
                            {a.hint && (
                              <span className="block truncate text-[11px] text-slate-500">
                                {a.hint}
                              </span>
                            )}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-blue-300" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
