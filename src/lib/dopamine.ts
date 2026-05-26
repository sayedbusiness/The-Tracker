/**
 * Dopamine engine — the addictive loop.
 *
 * Every action in the app feeds one of three reward channels:
 *   1. XP   → numerical reward, climbs forever, drives the level curve
 *   2. Combo → short-term streak counter (resets after 90s of inactivity)
 *   3. Quest → daily 3-mission card you can tick off
 *
 * Crossing a level threshold fires a full-screen cinematic. Combo ≥ 3 starts
 * stacking XP multipliers. Quests give big chunks of XP when completed.
 *
 * Numbers chosen so a fully-bought-in day hits Level 5 in week 1 and the
 * Discipline Engine never feels static.
 */

export type RewardKind =
  | "habit"
  | "task"
  | "block"
  | "water"
  | "meal"
  | "workout"
  | "sleep"
  | "weight"
  | "steps"
  | "call"
  | "close"
  | "content"
  | "quest"
  | "review";

export interface XPGrant {
  amount: number;
  kind: RewardKind;
  label?: string;
}

/**
 * Base XP awarded per reward kind. Tuned so the dopamine cadence stays:
 *   - micro (tap a habit, log a cup of water)    → 2-5 XP
 *   - moderate (task done, block checked)        → 10-15 XP
 *   - macro (workout logged, content posted)     → 25-35 XP
 *   - rare (close booked, weekly review done)    → 50-100 XP
 */
export const XP_BASE: Record<RewardKind, number> = {
  water: 2,
  habit: 5,
  steps: 5,
  weight: 8,
  meal: 10,
  task: 12,
  block: 15,
  sleep: 15,
  call: 20,
  content: 25,
  workout: 30,
  close: 100,
  quest: 50,
  review: 75,
};

/** Level curve — XP needed to reach level N is N^2 * 100. */
export function xpForLevel(level: number): number {
  return level * level * 100;
}

/** Compute current level given total XP. */
export function levelFromXP(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/** XP progress within the current level, as a fraction [0..1]. */
export function levelProgress(xp: number): number {
  const lvl = levelFromXP(xp);
  const floor = xpForLevel(lvl - 1);
  const ceil = xpForLevel(lvl);
  return Math.max(0, Math.min(1, (xp - floor) / (ceil - floor)));
}

/** Combo multiplier — kicks in at 3+, capped at 5x. */
export function comboMultiplier(combo: number): number {
  if (combo < 3) return 1;
  if (combo < 5) return 1.5;
  if (combo < 8) return 2;
  if (combo < 12) return 3;
  return 5;
}

/** Combo decays if no action within this window. */
export const COMBO_WINDOW_MS = 90 * 1000;

/** Tier metadata used by the level-up cinematic + the Discipline Engine. */
export interface LevelTier {
  level: number;
  name: string;
  /** Solid gradient used on cinematic + level badge. */
  gradient: string;
  /** Color for the ring glow on the dashboard hero. */
  glow: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, name: "Rookie", gradient: "from-slate-400 to-slate-600", glow: "rgba(148,163,184,0.6)" },
  { level: 3, name: "Grinder", gradient: "from-blue-400 to-cyan-500", glow: "rgba(59,130,246,0.7)" },
  { level: 5, name: "Operator", gradient: "from-violet-400 to-purple-600", glow: "rgba(139,92,246,0.75)" },
  { level: 8, name: "Closer", gradient: "from-amber-400 to-orange-500", glow: "rgba(251,146,60,0.8)" },
  { level: 12, name: "Killer", gradient: "from-rose-400 to-red-600", glow: "rgba(244,63,94,0.85)" },
  { level: 18, name: "Apex", gradient: "from-emerald-300 to-teal-500", glow: "rgba(16,185,129,0.9)" },
  { level: 25, name: "Legend", gradient: "from-yellow-300 to-amber-500", glow: "rgba(250,204,21,1)" },
];

export function tierForLevel(level: number): LevelTier {
  let current = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.level) current = tier;
  }
  return current;
}

/** Lines shown in the level-up cinematic. Indexed by level milestone. */
export const LEVEL_UP_LINES: Record<number, string> = {
  2: "Showing up is the move.",
  3: "GRINDER. The reps are stacking.",
  5: "OPERATOR. You run your day now.",
  7: "Discipline is your edge.",
  8: "CLOSER. You make money happen.",
  10: "Standards beat motivation. Always.",
  12: "KILLER. They feel you coming.",
  15: "You and your past self aren't the same person.",
  18: "APEX. Nobody outworks you.",
  20: "The version of you they doubted is gone.",
  25: "LEGEND. You wrote your own rules.",
};

export function levelUpLine(level: number): string {
  if (LEVEL_UP_LINES[level]) return LEVEL_UP_LINES[level];
  if (level >= 25) return "LEGEND. Untouchable.";
  if (level >= 18) return "APEX. Nobody outworks you.";
  if (level >= 12) return "KILLER. They feel you coming.";
  if (level >= 8) return "CLOSER. You make money happen.";
  if (level >= 5) return "OPERATOR. You run your day now.";
  if (level >= 3) return "GRINDER. The reps are stacking.";
  return "Showing up is the move.";
}

/** Quest catalog — randomized 3-per-day on the dashboard. */
export interface QuestTemplate {
  id: string;
  title: string;
  /** "+N XP" reward shown on the card. */
  xp: number;
  /** What page/action completes it. */
  hint: string;
}

export const QUEST_POOL: QuestTemplate[] = [
  { id: "q-prayed-fajr", title: "Pray Fajr on time", xp: 30, hint: "Tick the Fajr habit on the dashboard" },
  { id: "q-cold-100", title: "100+ cold calls today", xp: 80, hint: "Log dials in the Agency call sprint" },
  { id: "q-workout", title: "Hit the gym", xp: 40, hint: "Log a workout on the Health page" },
  { id: "q-content", title: "Post 1 agency + 1 main video", xp: 40, hint: "Film, edit, post — same day" },
  { id: "q-water", title: "3L water", xp: 25, hint: "Tick the water meter 12 times" },
  { id: "q-protein", title: "200g protein", xp: 35, hint: "Log meals to the macro ring" },
  { id: "q-script", title: "Script reps × 10 (pen + paper)", xp: 25, hint: "Morning script block" },
  { id: "q-quran", title: "Quran — 2 pages AM + 2 PM", xp: 35, hint: "Two reading blocks" },
  { id: "q-noscroll", title: "Zero social scroll all day", xp: 45, hint: "Phone face-down. No feed. No reels." },
  { id: "q-deepwork", title: "90-min deep work block", xp: 30, hint: "One uninterrupted block on a hard task" },
  { id: "q-close", title: "Book 1 closing call", xp: 60, hint: "Get a yes to schedule" },
  { id: "q-followup", title: "5 warm prospect follow-ups", xp: 25, hint: "Outreach block, AM" },
  { id: "q-build", title: "Ship 1 automation step", xp: 40, hint: "Make.com / GHL / Claude API — push it forward" },
  { id: "q-weigh", title: "Weigh-in logged", xp: 15, hint: "Same time daily after Fajr" },
  { id: "q-sleep7", title: "In bed by 10:00 PM", xp: 30, hint: "Lights out, phone in another room" },
];

/** Deterministic 3-quest selection per ISO date. Same day → same 3 quests. */
export function questsForDate(isoDate: string): QuestTemplate[] {
  let seed = 0;
  for (let i = 0; i < isoDate.length; i++) {
    seed = (seed * 31 + isoDate.charCodeAt(i)) >>> 0;
  }
  const pool = [...QUEST_POOL];
  const picks: QuestTemplate[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const idx = seed % pool.length;
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
}
