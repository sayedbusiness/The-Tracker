"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
} from "react";
import { usePendingActions, type PendingAction } from "@/hooks/use-pending-actions";
import { useSyncedState } from "@/hooks/use-synced-state";
import { hourPT } from "@/lib/dates";

interface PendingContextValue {
  actions: PendingAction[];
  count: number;
  sectionCounts: Record<PendingAction["section"], number>;
}

const Ctx = createContext<PendingContextValue | null>(null);

/** Consume the shared pending-actions snapshot (computed once per app). */
export function usePending(): PendingContextValue {
  return (
    useContext(Ctx) ?? {
      actions: [],
      count: 0,
      sectionCounts: { today: 0, tasks: 0, work: 0, health: 0, plan: 0 },
    }
  );
}

// How often to re-nudge while the app is open + reminders are on.
const REMINDER_INTERVAL_MS = 20 * 60 * 1000; // 20 min
// Don't fire notifications during sleep hours (PT).
const QUIET_START = 22; // 10 PM
const QUIET_END = 6; // 6 AM

/**
 * Owns the single pending-actions computation for the whole app and runs
 * the browser-notification scheduler. Mounted high in the shell so the
 * bell, nav red-dots, and dashboard all read one snapshot (one set of
 * polls) instead of each re-deriving it.
 *
 * Note: the Notification API fires while a tab is open (foreground or
 * background). True "app fully closed" push needs a service worker + Web
 * Push subscription — that's the next layer (see DEPLOY.md).
 */
export function PendingProvider({ children }: { children: React.ReactNode }) {
  const value = usePendingActions();
  const [notifEnabled] = useSyncedState<boolean>("settings:notifications", false);
  const lastNotifiedAt = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const maybeNotify = () => {
      if (!notifEnabled || Notification.permission !== "granted") return;
      const h = hourPT();
      const quiet = h >= QUIET_START || h < QUIET_END;
      if (quiet) return;
      const top = value.actions[0];
      if (!top) return;
      if (Date.now() - lastNotifiedAt.current < REMINDER_INTERVAL_MS) return;
      // Don't fire on top of a focused tab — the bell already shows it.
      if (document.visibilityState === "visible") {
        lastNotifiedAt.current = Date.now();
        return;
      }
      lastNotifiedAt.current = Date.now();
      try {
        const n = new Notification(`${top.emoji} ${top.label}`, {
          body: top.hint ?? "Open Avori OS and knock it out.",
          tag: "apex-reminder",
        });
        n.onclick = () => {
          window.focus();
          window.location.assign(top.href);
        };
      } catch {
        /* notification construction can throw on some platforms */
      }
    };

    const id = setInterval(maybeNotify, 60 * 1000);
    return () => clearInterval(id);
  }, [notifEnabled, value.actions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
