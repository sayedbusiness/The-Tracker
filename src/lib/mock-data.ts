/**
 * Day 1 starting state.
 *
 * Cycle restart on Monday May 25, 2026. Zero streaks, zero clients, zero
 * deals, no breaches, no XP. Body weight: 172 lb. Goal: lean and muscular.
 *
 * Charts render flat because the data points are zero — they fill in
 * as the user logs real activity.
 */

export const user = {
  name: "Sayed",
  handle: "@apex",
  email: "sayed@apexgrowth.co",
  avatar: "S",
  level: 1,
  xp: 0,
  xpToNext: 1000,
  streak: 0,
  longestStreak: 0,
  disciplineScore: 0,
  productivityScore: 0,
  focusScore: 0,
  agencyScore: 0,
  joinedAt: "2026-05-25T00:00:00.000Z",
};

export const disciplineQuotes = [
  { text: "Motivation fades. Discipline remains.", attr: "APEX" },
  { text: "You said you wanted greatness. This is the cost.", attr: "APEX" },
  { text: "Future you is built by today's actions.", attr: "APEX" },
  { text: "Consistency compounds. Excuses don't.", attr: "APEX" },
  { text: "You cannot build an empire through excuses.", attr: "APEX" },
  { text: "Hard chosen, easy life. Easy chosen, hard life.", attr: "Jerzy Gregorek" },
  { text: "Discipline equals freedom.", attr: "Jocko Willink" },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    attr: "Aristotle",
  },
  {
    text: "The man who moves a mountain begins by carrying away small stones.",
    attr: "Confucius",
  },
  { text: "Comfort is the enemy of progress.", attr: "P.T. Barnum" },
];

// Stable index so SSR and CSR render the same quote (hydration-safe).
// Real rotation will be driven client-side via a useEffect later.
export const todayQuote = disciplineQuotes[0];

export type Task = {
  id: string;
  title: string;
  category: "agency" | "health" | "learning" | "personal" | "deep-work";
  priority: "p0" | "p1" | "p2" | "p3";
  estimated: number;
  completed: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  energy: "low" | "med" | "high";
  deadline?: string;
  recurring?: "daily" | "weekly";
  streak?: number;
};

export const tasks: Task[] = [];

export const habits = [
  { id: "h1", name: "Workout", icon: "💪", streak: 0, target: 6, done: 0, color: "emerald" },
  { id: "h3", name: "Meditate", icon: "🧘", streak: 0, target: 7, done: 0, color: "violet" },
  { id: "h6", name: "Sleep 7+ hrs", icon: "😴", streak: 0, target: 7, done: 0, color: "amber" },
  { id: "h7", name: "Speechify (30m)", icon: "🎧", streak: 0, target: 7, done: 0, color: "indigo" },
  { id: "h8", name: "Quran", icon: "📖", streak: 0, target: 7, done: 0, color: "emerald" },
  { id: "h9", name: "Walk (20m)", icon: "🚶", streak: 0, target: 7, done: 0, color: "cyan" },
];

export const todayMetrics = {
  tasksCompleted: 0,
  tasksTotal: 0,
  focusMinutes: 0,
  focusTarget: 240,
  calories: 0,
  caloriesTarget: 1950, // cutting target at 172 lb
  protein: 0,
  proteinTarget: 200, // ~1.2g/lb body weight, preserves muscle in deficit
  water: 0, // tracked in 250mL increments
  waterTarget: 3, // L per day
  steps: 0,
  stepsTarget: 10000,
  sleep: 0,
  sleepTarget: 8,
  weight: 172,
};

// Empty week — fills in as days are logged
export const weeklyProductivity = [
  { day: "Mon", productivity: 0, discipline: 0, focus: 0 },
  { day: "Tue", productivity: 0, discipline: 0, focus: 0 },
  { day: "Wed", productivity: 0, discipline: 0, focus: 0 },
  { day: "Thu", productivity: 0, discipline: 0, focus: 0 },
  { day: "Fri", productivity: 0, discipline: 0, focus: 0 },
  { day: "Sat", productivity: 0, discipline: 0, focus: 0 },
  { day: "Sun", productivity: 0, discipline: 0, focus: 0 },
];

export const monthlyTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: 0,
}));

export const aiInsights = [
  {
    id: "i1",
    type: "challenge",
    title: "Day 1. Everything starts now.",
    body: "I'm in observation mode. Give me 7 days of honest data — meals, sleep, tasks, workouts — and I'll have your first real pattern read for you.",
    confidence: 1.0,
    icon: "🚀",
  },
  {
    id: "i2",
    type: "pattern",
    title: "Set your three non-negotiables",
    body: "The fastest way to build identity-level discipline is to lock in three daily habits you do no matter what. Pick them now. We'll track them ruthlessly.",
    confidence: 0.95,
    icon: "🎯",
  },
  {
    id: "i3",
    type: "win",
    title: "Body composition target — lean and muscular",
    body: "Starting weight: 172 lb. Plan: cut body fat, hold muscle. Macro target seeded at 200g protein, 1950 kcal. Adjust on the Health page as you calibrate.",
    confidence: 0.9,
    icon: "💪",
  },
];

// ─── Apex Growth Corp — clean slate ──────────────────────────
export const clients: Array<{
  id: string;
  name: string;
  logo: string;
  mrr: number;
  status: "active" | "onboarding";
  health: number;
  owner: string;
  since: string;
}> = [];

export type PipelineStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export const pipeline: Array<{
  id: string;
  company: string;
  contact: string;
  value: number;
  stage: PipelineStage;
  probability: number;
  closeDate: string;
  source: string;
}> = [];

// Last 7 months at zero — first non-zero point will be the month
// the user closes their first deal.
export const agencyRevenue = [
  { month: "Nov", mrr: 0, deals: 0 },
  { month: "Dec", mrr: 0, deals: 0 },
  { month: "Jan", mrr: 0, deals: 0 },
  { month: "Feb", mrr: 0, deals: 0 },
  { month: "Mar", mrr: 0, deals: 0 },
  { month: "Apr", mrr: 0, deals: 0 },
  { month: "May", mrr: 0, deals: 0 },
];

export type CampaignStatus = "planning" | "running" | "review" | "complete";

export const campaigns: Array<{
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  status: CampaignStatus;
  channel: string;
  performance: number;
  endsAt: string;
}> = [];

export const sales = {
  closedThisMonth: 0,
  closedLastMonth: 0,
  pipelineValue: 0,
  weightedPipeline: 0,
  appointments: 0,
  appointmentsLastMonth: 0,
  showRate: 0,
  closeRate: 0,
};

// ─── Learning library — content catalog stays, progress at 0 ─
export const learningTracks = [
  {
    id: "l1",
    title: "Systems Thinking for Founders",
    instructor: "Naval Ravikant + curators",
    duration: "8h 24m",
    progress: 0,
    category: "Mindset",
    cover: "violet",
    lessons: 24,
    completed: 0,
  },
  {
    id: "l2",
    title: "High-Performance Sleep & Recovery",
    instructor: "Dr. Matthew Walker",
    duration: "4h 12m",
    progress: 0,
    category: "Health",
    cover: "cyan",
    lessons: 12,
    completed: 0,
  },
  {
    id: "l3",
    title: "Agency Scaling Playbook 2026",
    instructor: "Apex Internal",
    duration: "12h 30m",
    progress: 0,
    category: "Business",
    cover: "emerald",
    lessons: 36,
    completed: 0,
  },
  {
    id: "l4",
    title: "Cold Outreach Mastery",
    instructor: "Alex Hormozi-school",
    duration: "6h 18m",
    progress: 0,
    category: "Sales",
    cover: "amber",
    lessons: 18,
    completed: 0,
  },
  {
    id: "l5",
    title: "Stoic Operating System",
    instructor: "Ryan Holiday",
    duration: "5h 45m",
    progress: 0,
    category: "Mindset",
    cover: "rose",
    lessons: 20,
    completed: 0,
  },
  {
    id: "l6",
    title: "Strength Training for Longevity",
    instructor: "Dr. Peter Attia school",
    duration: "9h 02m",
    progress: 0,
    category: "Health",
    cover: "indigo",
    lessons: 28,
    completed: 0,
  },
];

// ─── Food log — empty, fills in as you log meals ─────────────
export const foodLog: Array<{
  id: string;
  meal: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}> = [];

// ─── AI conversation — clean day-1 welcome ───────────────────
export type ChatMessageSeed = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

export const chatHistory: ChatMessageSeed[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Day 1, Sayed. Clean slate.\n\nHere's how this works: I learn what you do, when you do it, and what it costs you when you skip. After 7 days I'll have your first real pattern. After 30 I'll be sharper than any coach you could hire.\n\nThree things to tell me right now to give me a head start:\n\n1. Your top goal for the next 90 days\n2. The three habits you refuse to break\n3. Your sleep target (lights out + wake time)\n\nWhat's first?",
    // Fixed string for hydration parity. Real time stamps populate on send.
    time: "00:00",
  },
];
