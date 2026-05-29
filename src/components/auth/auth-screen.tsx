"use client";

import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Lock,
  Loader2,
  Mail,
  Flame,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signUp, AuthError } from "@/lib/auth/client";
import { writeSession } from "@/lib/auth/session";

type Tab = "login" | "register";
type Mode = "supabase" | "password" | "open" | "loading";

const HOOK_LINES = [
  { icon: Flame, text: "Daily streaks that hurt to break — show up or lose them" },
  { icon: TrendingUp, text: "Live XP, combos, and level-ups on every action" },
  { icon: Trophy, text: "Your 60-day operating system, personalized to you" },
];

export function AuthScreen({ initialTab = "login" }: { initialTab?: Tab }) {
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
        className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-8 text-center sm:p-10"
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

          <Suspense fallback={null}>
            <AuthForms initialTab={initialTab} />
          </Suspense>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-[10px] uppercase tracking-[0.2em] text-slate-600">
        Built for operators · © Apex Growth Corp
      </div>
    </div>
  );
}

function AuthForms({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/";

  const [mode, setMode] = useState<Mode>("loading");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/mode")
      .then((r) => r.json())
      .then((b: { mode?: Mode }) => {
        if (!cancelled) setMode(b.mode === "password" ? "password" : b.mode === "supabase" ? "supabase" : "open");
      })
      .catch(() => !cancelled && setMode("open"));
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Legacy single-password gate ──
  const onPasswordSubmit = async (e: React.FormEvent) => {
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

  // ── Email/password (Supabase or local) ──
  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session =
        tab === "register"
          ? await signUp(email, password)
          : await signIn(email, password);
      writeSession(session);
      // Hard navigate so per-user keys + cookie are read fresh everywhere.
      window.location.assign(tab === "register" ? "/onboarding" : next);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong."
      );
      setLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="mt-8 flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
      </div>
    );
  }

  if (mode === "password") {
    return (
      <div className="mt-8">
        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          Enter your access password to continue.
        </p>
        <form onSubmit={onPasswordSubmit} className="space-y-3">
          <Field
            icon={Lock}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your APEX password"
          />
          {error && <ErrorBox>{error}</ErrorBox>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || !password}>
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
      </div>
    );
  }

  // supabase / open → email + password with Login/Register tabs.
  return (
    <div className="mt-7">
      <div className="mb-5 flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className={`relative flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab === t && (
              <motion.div
                layoutId="auth-tab"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/40 to-sky-500/30 ring-1 ring-inset ring-blue-400/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{t === "login" ? "Sign in" : "Create account"}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mb-4 text-sm leading-relaxed text-slate-400"
        >
          {tab === "register"
            ? "Make your account. We'll personalize everything to you next."
            : "Welcome back. Your streak is waiting."}
        </motion.p>
      </AnimatePresence>

      <form onSubmit={onEmailSubmit} className="space-y-3 text-left">
        <Field
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
        />
        <Field
          icon={Lock}
          type="password"
          autoComplete={tab === "register" ? "new-password" : "current-password"}
          value={password}
          onChange={setPassword}
          placeholder={tab === "register" ? "Create a password (6+ chars)" : "Your password"}
        />
        {error && <ErrorBox>{error}</ErrorBox>}
        <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {tab === "register" ? "Creating…" : "Signing in…"}
            </>
          ) : (
            <>
              {tab === "register" ? "Create my account" : "Sign in"}{" "}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <ul className="mt-6 space-y-2 text-left">
        {HOOK_LINES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2 text-xs text-slate-400">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
            {text}
          </li>
        ))}
      </ul>

      {mode === "open" && (
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
          <Sparkles className="h-3 w-3 text-amber-400" />
          Demo mode · accounts saved on this device
        </div>
      )}
    </div>
  );
}

function Field({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  icon: typeof Mail;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-blue-400/40 focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-blue-400/20"
      />
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-200">
      {children}
    </div>
  );
}
