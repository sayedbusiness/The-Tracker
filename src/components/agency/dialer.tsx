"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Delete,
  Loader2,
  PlugZap,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import type { Call, Device } from "@twilio/voice-sdk";

const VOICE_VARS: { key: string; label: string; hint: string }[] = [
  { key: "TWILIO_ACCOUNT_SID", label: "Account SID", hint: "AC… from the Twilio console home" },
  { key: "TWILIO_API_KEY_SID", label: "API Key SID", hint: "SK… (Account → API keys)" },
  { key: "TWILIO_API_KEY_SECRET", label: "API Key secret", hint: "shown once when you make the key" },
  { key: "TWILIO_TWIML_APP_SID", label: "TwiML App SID", hint: "AP… (Voice → TwiML Apps → create)" },
  { key: "TWILIO_PHONE_NUMBER", label: "Phone number", hint: "your Twilio number, +1… (caller ID)" },
];

export interface CallActivity {
  id: string;
  type: "call";
  number: string;
  durationSec: number;
  at: number;
}

type Phase = "loading" | "ready" | "unconfigured" | "error";
type CallStatus = "idle" | "connecting" | "in-call";

/** Normalize a dialed string to E.164-ish (default US +1 for 10 digits). */
function normalizeNumber(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/[^\d]/g, "");
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : "";
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export function Dialer({ onActivity }: { onActivity?: (a: CallActivity) => void }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<CallStatus>("idle");
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const startedAtRef = useRef(0);
  const dialedRef = useRef("");

  const fetchToken = useCallback(async (): Promise<string | null> => {
    const res = await fetch("/api/twilio/token");
    const data = (await res.json().catch(() => ({}))) as {
      token?: string;
      error?: string;
      missing?: string[];
    };
    if (Array.isArray(data.missing)) setMissing(data.missing);
    if (res.status === 503) {
      setPhase("unconfigured");
      return null;
    }
    if (!res.ok || !data.token) {
      setErrMsg(data.error || `Token error (${res.status})`);
      setPhase("error");
      return null;
    }
    return data.token;
  }, []);

  // Initialize the Voice SDK device once (dynamic import → never runs on SSR).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await fetchToken();
      if (!token || cancelled) return;
      try {
        const { Device } = await import("@twilio/voice-sdk");
        const device = new Device(token, {
          codecPreferences: ["opus", "pcmu"] as never,
          logLevel: "error" as never,
        });
        device.on("error", (e: { message?: string }) =>
          setErrMsg(e?.message ?? "Device error")
        );
        device.on("tokenWillExpire", async () => {
          const t = await fetchToken();
          if (t) device.updateToken(t);
        });
        if (cancelled) {
          device.destroy();
          return;
        }
        deviceRef.current = device;
        setPhase("ready");
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Failed to load dialer");
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, [fetchToken]);

  // Call timer.
  useEffect(() => {
    if (status !== "in-call") return;
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [status]);

  const cleanupCall = useCallback(() => {
    const dur = startedAtRef.current ? Math.floor((Date.now() - startedAtRef.current) / 1000) : 0;
    if (dialedRef.current) {
      onActivity?.({
        id: `call-${Date.now()}`,
        type: "call",
        number: dialedRef.current,
        durationSec: dur,
        at: Date.now(),
      });
    }
    callRef.current = null;
    startedAtRef.current = 0;
    dialedRef.current = "";
    setStatus("idle");
    setMuted(false);
    setSeconds(0);
  }, [onActivity]);

  const startCall = useCallback(
    async (overrideNumber?: string) => {
      const device = deviceRef.current;
      const target = normalizeNumber(overrideNumber ?? number);
      if (!device || !target) return;
      setErrMsg(null);
      setStatus("connecting");
      dialedRef.current = target;
      try {
        const call = await device.connect({ params: { To: target } });
        callRef.current = call;
        startedAtRef.current = Date.now();
        call.on("accept", () => {
          startedAtRef.current = Date.now();
          setStatus("in-call");
        });
        call.on("disconnect", cleanupCall);
        call.on("cancel", cleanupCall);
        call.on("reject", cleanupCall);
        call.on("error", (e: { message?: string }) => {
          setErrMsg(e?.message ?? "Call error");
          cleanupCall();
        });
      } catch (e) {
        setErrMsg(e instanceof Error ? e.message : "Could not place call");
        setStatus("idle");
      }
    },
    [number, cleanupCall]
  );

  const hangup = () => callRef.current?.disconnect();
  const toggleMute = () => {
    const next = !muted;
    callRef.current?.mute(next);
    setMuted(next);
  };

  const press = (k: string) => {
    if (status === "in-call") {
      callRef.current?.sendDigits(k);
    }
    setNumber((n) => n + k);
  };

  // Prefill (and optionally auto-call) from elsewhere (lead "Call" buttons).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ number?: string }>).detail;
      if (detail?.number) {
        setCollapsed(false);
        setNumber(detail.number);
      }
    };
    window.addEventListener("apex:dial", handler);
    return () => window.removeEventListener("apex:dial", handler);
  }, []);

  // ── Unconfigured / error states ──
  if (phase === "unconfigured") {
    const setCount = VOICE_VARS.length - missing.length;
    return (
      <div className="surface-card rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <PlugZap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Connect Twilio to dial</h3>
            <p className="text-[10px] text-slate-500">
              {setCount}/{VOICE_VARS.length} keys detected · set the rest in Vercel
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          {VOICE_VARS.map((v) => {
            const present = !missing.includes(v.key);
            return (
              <div
                key={v.key}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${
                  present
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <div
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    present ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.06] text-slate-500"
                  }`}
                >
                  {present ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{v.label}</span>
                    <code className="truncate text-[9px] text-slate-500">{v.key}</code>
                  </div>
                  {!present && (
                    <div className="text-[10px] text-slate-500">{v.hint}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
          Add the missing ones in <b className="text-slate-300">Vercel → Settings → Environment Variables</b>, then redeploy.
          Full walkthrough (incl. the TwiML App URLs to paste) is in DEPLOY.md → “Twilio dialer &amp; texting”.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-elevated relative overflow-hidden rounded-2xl">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <Phone className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">Dialer</div>
            <div className="text-[10px] text-slate-500">
              {phase === "loading"
                ? "Connecting…"
                : status === "in-call"
                  ? `On call · ${fmtDuration(seconds)}`
                  : status === "connecting"
                    ? "Calling…"
                    : "Ready to call"}
            </div>
          </div>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-5">
          {missing.includes("TWILIO_PHONE_NUMBER") && (
            <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-[11px] text-amber-200">
              Add <b>TWILIO_PHONE_NUMBER</b> in Vercel — calls need a caller ID
              or Twilio rejects them.
            </div>
          )}
          <div className="relative">
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && status === "idle" && startCall()}
              placeholder="+1 (555) 123-4567"
              inputMode="tel"
              className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-center text-lg tabular text-white placeholder:text-slate-600 focus:border-emerald-400/40 focus:outline-none"
            />
            {number && (
              <button
                onClick={() => setNumber((n) => n.slice(0, -1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                aria-label="Delete"
              >
                <Delete className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k}
                onClick={() => press(k)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 text-lg font-semibold text-white transition-colors hover:bg-white/[0.06] active:bg-white/[0.1]"
              >
                {k}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            {status === "idle" ? (
              <button
                onClick={() => startCall()}
                disabled={phase !== "ready" || !number.trim()}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_6px_24px_rgba(16,185,129,0.45)] transition-transform hover:scale-105 disabled:opacity-40"
                aria-label="Call"
              >
                {phase === "loading" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={toggleMute}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    muted
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                      : "border-white/[0.1] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                  }`}
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <button
                  onClick={hangup}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_6px_24px_rgba(244,63,94,0.45)] transition-transform hover:scale-105"
                  aria-label="Hang up"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
                {status === "in-call" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-semibold tabular text-emerald-300"
                  >
                    {fmtDuration(seconds)}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {errMsg && (
            <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-[11px] text-rose-200">
              {errMsg}
            </div>
          )}
          <p className="mt-3 text-center text-[10px] text-slate-500">
            Calls go through your Twilio number. Grant mic access when asked.
          </p>
        </div>
      )}
    </div>
  );
}
