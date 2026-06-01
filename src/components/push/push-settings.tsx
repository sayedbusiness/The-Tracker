"use client";

import { useEffect, useState } from "react";
import { BellRing, Check, Loader2, Send, X, Smartphone } from "lucide-react";
import {
  pushSupported,
  iosNeedsInstall,
  currentPermission,
  isSubscribed,
  enablePush,
  disablePush,
  sendTestPush,
  PUSH_PUBLIC_KEY,
  type PushPermission,
} from "@/lib/push/client";

type Status = "idle" | "working";

export function PushSettings() {
  const [mounted, setMounted] = useState(false);
  const [permission, setPermission] = useState<PushPermission>("unsupported");
  const [subscribed, setSubscribed] = useState(false);
  const [needsInstall, setNeedsInstall] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setPermission(currentPermission());
    setNeedsInstall(iosNeedsInstall());
    void isSubscribed().then(setSubscribed);
  }, []);

  if (!mounted) return null;

  const supported = pushSupported();
  const noVapid = !PUSH_PUBLIC_KEY;

  const enable = async () => {
    setStatus("working");
    setMsg(null);
    const res = await enablePush();
    setStatus("idle");
    setPermission(currentPermission());
    setSubscribed(await isSubscribed());
    if (res.ok) setMsg("Notifications on. Try a test below.");
    else if (res.reason === "denied")
      setMsg("Permission denied — enable it in iOS Settings → Notifications → Avori OS.");
    else if (res.reason === "no-vapid")
      setMsg("Server keys missing (VAPID). Add them in Vercel, then redeploy.");
    else if (res.reason === "unsupported")
      setMsg("This browser can't do push. On iPhone, add the app to your Home Screen first.");
    else setMsg("Couldn't enable — try again.");
  };

  const test = async () => {
    setStatus("working");
    setMsg(null);
    const res = await sendTestPush();
    setStatus("idle");
    if (res.ok) setMsg(`Test sent to ${res.sent ?? 0} device(s). Lock your phone — it should buzz.`);
    else setMsg(res.error || "Test failed.");
  };

  const off = async () => {
    setStatus("working");
    await disablePush();
    setStatus("idle");
    setSubscribed(false);
    setMsg("Notifications off on this device.");
  };

  return (
    <div className="surface-card rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400">
          <BellRing className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Phone notifications</h3>
          <p className="text-[11px] text-slate-500">
            Get nudged about your day plan even when Avori is closed.
          </p>
        </div>
      </div>

      {needsInstall && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2.5 text-[11px] text-amber-200">
          <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <b>iPhone:</b> tap the <b>Share</b> icon → <b>Add to Home Screen</b>,
            then open Avori from that icon. iOS only allows push from the
            installed app.
          </span>
        </div>
      )}

      {noVapid && (
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3 py-2.5 text-[11px] text-rose-200">
          Server push keys aren&apos;t set yet. Add{" "}
          <code className="text-rose-100">NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> +{" "}
          <code className="text-rose-100">VAPID_PRIVATE_KEY</code> in Vercel.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!subscribed ? (
          <button
            onClick={enable}
            disabled={status === "working" || !supported || noVapid}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_6px_20px_rgba(30,58,138,0.4)] transition-transform hover:scale-[1.02] disabled:opacity-40"
          >
            {status === "working" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <BellRing className="h-3.5 w-3.5" />
            )}
            Turn on notifications
          </button>
        ) : (
          <>
            <button
              onClick={test}
              disabled={status === "working"}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/20 disabled:opacity-40"
            >
              {status === "working" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send test
            </button>
            <button
              onClick={off}
              disabled={status === "working"}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.05] disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" /> Turn off
            </button>
          </>
        )}
      </div>

      {subscribed && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300">
          <Check className="h-3.5 w-3.5" /> Notifications enabled on this device
        </div>
      )}

      {msg && <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{msg}</p>}
    </div>
  );
}
