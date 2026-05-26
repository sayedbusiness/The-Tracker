"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  COMBO_WINDOW_MS,
  LEVEL_TIERS,
  RewardKind,
  XP_BASE,
  comboMultiplier,
  levelFromXP,
  levelProgress,
  levelUpLine,
  tierForLevel,
  xpForLevel,
} from "@/lib/dopamine";
import { useSyncedState } from "@/hooks/use-synced-state";
import { Confetti } from "./confetti";

interface XPPopup {
  id: number;
  amount: number;
  combo: number;
  x: number;
  y: number;
  label?: string;
  kind: RewardKind;
}

interface ComboInfo {
  count: number;
  lastAt: number;
}

interface DopamineContext {
  xp: number;
  level: number;
  progress: number;
  tierName: string;
  tierGradient: string;
  tierGlow: string;
  combo: number;
  /** Award XP for an action. Optionally pass a screen position for the popup. */
  hit: (
    kind: RewardKind,
    opts?: { label?: string; x?: number; y?: number; amount?: number }
  ) => void;
  /** Manual confetti burst (no XP). For pure celebration moments. */
  burst: (x?: number, y?: number) => void;
}

const Ctx = createContext<DopamineContext | null>(null);

export function useDopamine() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDopamine must be used inside <DopamineProvider>");
  return ctx;
}

/**
 * Wrap the app shell in this provider. It owns the XP store and overlays the
 * confetti/popup/level-up canvases on top of every page.
 */
export function DopamineProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useSyncedState<number>("dopamine:xp", 0);
  const [popups, setPopups] = useState<XPPopup[]>([]);
  const [confettiBursts, setConfettiBursts] = useState<
    Array<{ id: number; x: number; y: number; intensity: number }>
  >([]);
  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(
    null
  );
  const [combo, setCombo] = useState<ComboInfo>({ count: 0, lastAt: 0 });
  const popupId = useRef(0);
  const burstId = useRef(0);

  const level = levelFromXP(xp);
  const tier = tierForLevel(level);
  const progress = levelProgress(xp);

  // Auto-expire combo if no new action within the window.
  useEffect(() => {
    if (combo.count === 0) return;
    const t = setTimeout(() => {
      setCombo((c) => (Date.now() - c.lastAt >= COMBO_WINDOW_MS ? { count: 0, lastAt: 0 } : c));
    }, COMBO_WINDOW_MS + 100);
    return () => clearTimeout(t);
  }, [combo]);

  const hit = useCallback<DopamineContext["hit"]>(
    (kind, opts) => {
      const base = opts?.amount ?? XP_BASE[kind] ?? 5;
      const now = Date.now();
      const stillCombo = now - combo.lastAt < COMBO_WINDOW_MS;
      const nextCombo = stillCombo ? combo.count + 1 : 1;
      const multiplier = comboMultiplier(nextCombo);
      const finalXP = Math.round(base * multiplier);

      const before = xp;
      const after = before + finalXP;
      const beforeLevel = levelFromXP(before);
      const afterLevel = levelFromXP(after);

      setXP(after);
      setCombo({ count: nextCombo, lastAt: now });

      const x = opts?.x ?? window.innerWidth / 2;
      const y = opts?.y ?? window.innerHeight / 2;

      const pid = ++popupId.current;
      setPopups((p) => [
        ...p,
        { id: pid, amount: finalXP, combo: nextCombo, x, y, label: opts?.label, kind },
      ]);
      setTimeout(() => {
        setPopups((p) => p.filter((q) => q.id !== pid));
      }, 1400);

      // Confetti intensity scales with XP gained.
      const intensity = Math.min(3, 0.5 + finalXP / 30);
      const bid = ++burstId.current;
      setConfettiBursts((b) => [...b, { id: bid, x, y, intensity }]);
      setTimeout(() => {
        setConfettiBursts((b) => b.filter((q) => q.id !== bid));
      }, 1800);

      if (afterLevel > beforeLevel) {
        setLevelUp({ from: beforeLevel, to: afterLevel });
      }
    },
    [xp, combo, setXP]
  );

  const burst = useCallback(
    (x?: number, y?: number) => {
      const px = x ?? window.innerWidth / 2;
      const py = y ?? window.innerHeight / 2;
      const bid = ++burstId.current;
      setConfettiBursts((b) => [...b, { id: bid, x: px, y: py, intensity: 2 }]);
      setTimeout(() => setConfettiBursts((b) => b.filter((q) => q.id !== bid)), 1800);
    },
    []
  );

  const value = useMemo<DopamineContext>(
    () => ({
      xp,
      level,
      progress,
      tierName: tier.name,
      tierGradient: tier.gradient,
      tierGlow: tier.glow,
      combo: combo.count,
      hit,
      burst,
    }),
    [xp, level, progress, tier, combo, hit, burst]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[60]">
        {/* Confetti bursts */}
        {confettiBursts.map((b) => (
          <Confetti key={b.id} x={b.x} y={b.y} intensity={b.intensity} />
        ))}
        {/* XP popups */}
        <AnimatePresence>
          {popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: 1, y: -70, scale: 1 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ left: p.x, top: p.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full bg-gradient-to-br ${tier.gradient} px-3 py-1 text-sm font-bold text-white shadow-[0_0_24px_var(--g)]`}
                  style={{ ["--g" as string]: tier.glow }}
                >
                  +{p.amount} XP
                </div>
                {p.combo >= 3 && (
                  <div className="mt-1 text-xs font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                    {p.combo}× combo!
                  </div>
                )}
                {p.label && (
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-white/70">
                    {p.label}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Level-up cinematic */}
        <AnimatePresence>
          {levelUp && (
            <motion.div
              key="lvlup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-auto absolute inset-0 grid place-items-center bg-black/85 backdrop-blur-md"
              onClick={() => setLevelUp(null)}
            >
              <LevelUpBurst level={levelUp.to} onDone={() => setLevelUp(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

function LevelUpBurst({ level, onDone }: { level: number; onDone: () => void }) {
  const tier = tierForLevel(level);
  const line = levelUpLine(level);

  useEffect(() => {
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative grid place-items-center">
      {/* Radial flash */}
      <motion.div
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className={`absolute h-32 w-32 rounded-full bg-gradient-radial ${tier.gradient} blur-3xl`}
      />
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
        className="relative flex flex-col items-center gap-3"
      >
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/60">
          Level up
        </div>
        <div
          className={`bg-gradient-to-br ${tier.gradient} bg-clip-text text-[110px] font-black leading-none text-transparent drop-shadow-[0_8px_40px_var(--g)]`}
          style={{ ["--g" as string]: tier.glow }}
        >
          {level}
        </div>
        <div className="text-2xl font-bold text-white">{tier.name}</div>
        <div className="mt-2 max-w-md text-center text-sm text-white/80">
          {line}
        </div>
        <div className="mt-4 text-[10px] uppercase tracking-wider text-white/40">
          Tap anywhere to dismiss
        </div>
      </motion.div>
    </div>
  );
}
