"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  MapPin,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";

interface CalEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  location: string | null;
  link: string | null;
  allDay: boolean;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[] | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/events", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setConnected(false);
          setEvents(null);
        } else {
          setError(body.error || `HTTP ${res.status}`);
        }
      } else {
        setConnected(true);
        setEvents(body.events ?? []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    // Refresh every 30 seconds so the agenda stays current.
    const interval = setInterval(fetchEvents, 30_000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="Calendar · next 24 hours"
        title={
          <>
            What's <span className="gradient-electric">already locked in.</span>
          </>
        }
        subtitle="Read-only Google Calendar agenda. Auto-refreshes every 30 seconds. Combine with your timeline on the dashboard for the full picture of where today is going."
        icon={CalendarIcon}
        accent="violet"
        actions={
          <Button variant="secondary" onClick={fetchEvents} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        }
      />

      {connected === false && (
        <div className="surface-elevated rounded-3xl p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-700 to-sky-400 shadow-[0_0_30px_rgba(30,58,138,0.5)]">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">
            Connect Google Calendar
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Read-only access to your primary calendar. Events stay on Google's
            servers — APEX OS just fetches the next 24 hours. Syncs to your
            iPhone Calendar app via Google.
          </p>
          <a
            href="/api/calendar/connect"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-700 to-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_4px_20px_rgba(30,58,138,0.45)] transition-all hover:shadow-[0_8px_30px_rgba(59,130,246,0.55)]"
          >
            <CalendarIcon className="h-4 w-4" />
            Connect with Google
          </a>
          <p className="mx-auto mt-4 max-w-md text-[10px] text-slate-500">
            Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET set in Vercel env.
            See DEPLOY.md for the 3-minute Google Cloud Console setup.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {connected && events && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">
          <div className="text-3xl">🗓️</div>
          <div className="mt-2 text-sm font-medium text-white">
            Nothing on the calendar in the next 24 hours
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Time to fill it with leverage — book a call, lock a meeting, plan
            a closing window.
          </div>
        </div>
      )}

      {connected && events && events.length > 0 && (
        <div className="space-y-2">
          {events.map((e, i) => (
            <motion.a
              key={e.id}
              href={e.link ?? "#"}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="surface-card group flex items-start gap-3 rounded-2xl p-4 transition-all hover:border-white/[0.12]"
            >
              <div className="w-24 shrink-0 text-right">
                <div className="text-sm font-semibold tabular text-white">
                  {e.allDay ? "All day" : formatTime(e.start)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {e.allDay ? "" : duration(e.start, e.end)}
                </div>
              </div>
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-700/40 to-sky-500/30">
                <CalendarIcon className="h-4 w-4 text-blue-200" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white">{e.title}</div>
                {e.location && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" /> {e.location}
                  </div>
                )}
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.a>
          ))}
        </div>
      )}

      {connected === null && (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function duration(start: string | null, end: string | null) {
  if (!start || !end) return "";
  const min = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
