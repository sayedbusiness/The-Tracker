"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Check } from "lucide-react";

export interface SmsActivity {
  id: string;
  type: "sms";
  number: string;
  body: string;
  at: number;
}

export function SmsComposer({
  open,
  to,
  contact,
  onClose,
  onSent,
}: {
  open: boolean;
  to: string;
  contact?: string;
  onClose: () => void;
  onSent?: (a: SmsActivity) => void;
}) {
  const [number, setNumber] = useState(to);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNumber(to);
      setBody("");
      setStatus("idle");
      setError(null);
    }
  }, [open, to]);

  if (!open) return null;

  const send = async () => {
    if (!number.trim() || !body.trim()) return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/twilio/sms/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: number.trim(), body: body.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 503) {
        setError("Twilio SMS isn't configured yet. Add TWILIO_PHONE_NUMBER + API keys.");
        setStatus("error");
        return;
      }
      if (!res.ok) {
        setError(data.error || `Failed (${res.status})`);
        setStatus("error");
        return;
      }
      onSent?.({
        id: `sms-${Date.now()}`,
        type: "sms",
        number: number.trim(),
        body: body.trim(),
        at: Date.now(),
      });
      setStatus("sent");
      setTimeout(onClose, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setStatus("error");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-strong fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-500">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Text {contact || "lead"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="+1 (555) 123-4567"
          inputMode="tel"
          className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-sky-400/40 focus:outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your message…"
          rows={4}
          maxLength={1000}
          className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-sky-400/40 focus:outline-none"
        />
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>Sends from your Twilio number</span>
          <span>{body.length}/1000</span>
        </div>

        {error && (
          <div className="mt-2 rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-[11px] text-rose-200">
            {error}
          </div>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={send}
            disabled={status === "sending" || status === "sent" || !number.trim() || !body.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-40"
          >
            {status === "sending" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…
              </>
            ) : status === "sent" ? (
              <>
                <Check className="h-3.5 w-3.5" /> Sent
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Send text
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
