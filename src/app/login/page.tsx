"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="password"
          inputMode="text"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your APEX password"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-blue-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-400/20"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading || password.length === 0}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
          </>
        ) : (
          <>
            Enter the system <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/2 -left-1/4 h-[140%] w-[140%] rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.18),transparent_50%)]" />
        <div className="absolute -bottom-1/2 right-0 h-[100%] w-[100%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-10 text-center"
      >
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.25),transparent_50%)]" />
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-2xl font-black text-white shadow-[0_0_40px_rgba(30,58,138,0.6)]"
          >
            A
          </motion.div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            APEX <span className="gradient-electric">OS</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Personal. Private. Built for one operator.
          </p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          <ul className="mt-6 space-y-1.5 text-left">
            {[
              "Your 30-day operating system, hour by hour",
              "Persistent — close the app, your progress stays",
              "Brutally honest AI coach with persistent memory",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 text-xs text-slate-400"
              >
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            Single-operator · private
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-[10px] uppercase tracking-[0.2em] text-slate-600">
        Made with discipline · © Apex Growth Corp
      </div>
    </div>
  );
}
