/**
 * Mock data layer — simulates a fully-populated user account so the UI
 * can be developed and demoed without a live backend. Swap to real
 * Prisma queries in `src/server/` once the database is provisioned.
 */

export const user = {
  name: "Sayed",
  handle: "@apex",
  email: "sayed@apexgrowth.co",
  avatar: "S",
  level: 27,
  xp: 8420,
  xpToNext: 10000,
  streak: 47,
  longestStreak: 89,
  disciplineScore: 92,
  productivityScore: 87,
  focusScore: 78,
  agencyScore: 94,
  joinedAt: new Date("2024-01-15"),
};

export const disciplineQuotes = [
  { text: "Motivation fades. Discipline remains.", attr: "APEX" },
  { text: "You said you wanted greatness. This is the cost.", attr: "APEX" },
  { text: "Future you is built by today's actions.", attr: "APEX" },
  { text: "Consistency compounds. Excuses don't.", attr: "APEX" },
  { text: "You cannot build an empire through excuses.", attr: "APEX" },
  { text: "Hard chosen, easy life. Easy chosen, hard life.", attr: "Jerzy Gregorek" },
  { text: "Discipline equals freedom.", attr: "Jocko Willink" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", attr: "Aristotle" },
  { text: "The man who moves a mountain begins by carrying away small stones.", attr: "Confucius" },
  { text: "Comfort is the enemy of progress.", attr: "P.T. Barnum" },
];

export const todayQuote =
  disciplineQuotes[new Date().getDate() % disciplineQuotes.length];

export type Task = {
  id: string;
  title: string;
  category: "agency" | "health" | "learning" | "personal" | "deep-work";
  priority: "p0" | "p1" | "p2" | "p3";
  estimated: number; // minutes
  completed: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  energy: "low" | "med" | "high";
  deadline?: string;
  recurring?: "daily" | "weekly";
  streak?: number;
};

export const tasks: Task[] = [
  { id: "t1", title: "Morning workout — push day", category: "health", priority: "p0", estimated: 60, completed: true, difficulty: 4, energy: "high", recurring: "daily", streak: 47 },
  { id: "t2", title: "Deep work block — Q2 agency strategy", category: "deep-work", priority: "p0", estimated: 120, completed: true, difficulty: 5, energy: "high" },
  { id: "t3", title: "Review 3 client campaigns + send updates", category: "agency", priority: "p1", estimated: 45, completed: true, difficulty: 3, energy: "med" },
  { id: "t4", title: "Sales call — Meridian Capital ($85k deal)", category: "agency", priority: "p0", estimated: 30, completed: false, difficulty: 4, energy: "high", deadline: "14:00" },
  { id: "t5", title: "Study: System Design — Designing Data-Intensive Applications, ch.7", category: "learning", priority: "p2", estimated: 50, completed: false, difficulty: 4, energy: "high" },
  { id: "t6", title: "Write LinkedIn thought-leadership post", category: "agency", priority: "p2", estimated: 25, completed: false, difficulty: 2, energy: "med" },
  { id: "t7", title: "Team standup + 1:1 with Alex", category: "agency", priority: "p1", estimated: 45, completed: false, difficulty: 2, energy: "med", deadline: "15:30" },
  { id: "t8", title: "Cold plunge + meditation", category: "health", priority: "p3", estimated: 20, completed: false, difficulty: 3, energy: "low", recurring: "daily", streak: 12 },
  { id: "t9", title: "Read 30 pages — The Almanack of Naval Ravikant", category: "learning", priority: "p3", estimated: 30, completed: false, difficulty: 1, energy: "low", recurring: "daily", streak: 31 },
];

export const habits = [
  { id: "h1", name: "Workout", icon: "💪", streak: 47, target: 6, done: 5, color: "emerald" },
  { id: "h2", name: "Read", icon: "📚", streak: 31, target: 7, done: 6, color: "indigo" },
  { id: "h3", name: "Meditate", icon: "🧘", streak: 12, target: 7, done: 4, color: "violet" },
  { id: "h4", name: "Cold plunge", icon: "❄️", streak: 8, target: 5, done: 3, color: "cyan" },
  { id: "h5", name: "No alcohol", icon: "🚫", streak: 89, target: 7, done: 7, color: "rose" },
  { id: "h6", name: "Sleep 7+ hrs", icon: "😴", streak: 22, target: 7, done: 6, color: "amber" },
];

export const todayMetrics = {
  tasksCompleted: 6,
  tasksTotal: 9,
  focusMinutes: 247,
  focusTarget: 300,
  calories: 1840,
  caloriesTarget: 2400,
  protein: 178,
  proteinTarget: 220,
  water: 2.4,
  waterTarget: 3.5,
  steps: 8420,
  stepsTarget: 12000,
  sleep: 7.4,
  sleepTarget: 8,
  weight: 178.4,
  mood: 8,
  energy: 9,
};

export const weeklyProductivity = [
  { day: "Mon", productivity: 78, discipline: 85, focus: 70 },
  { day: "Tue", productivity: 82, discipline: 88, focus: 75 },
  { day: "Wed", productivity: 91, discipline: 95, focus: 88 },
  { day: "Thu", productivity: 73, discipline: 80, focus: 65 },
  { day: "Fri", productivity: 88, discipline: 92, focus: 82 },
  { day: "Sat", productivity: 85, discipline: 90, focus: 78 },
  { day: "Sun", productivity: 87, discipline: 92, focus: 80 },
];

export const monthlyTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: 60 + Math.floor(Math.random() * 30) + Math.floor(i * 0.8),
}));

export const aiInsights = [
  {
    id: "i1",
    type: "pattern",
    title: "Your peak window is 7–11 AM",
    body: "92% of your highest-output deep work happens before noon. Defend it ruthlessly — no calls, no Slack.",
    confidence: 0.94,
    icon: "🧠",
  },
  {
    id: "i2",
    type: "warning",
    title: "Consistency drops after <6h sleep",
    body: "Your task completion falls 34% the day after short sleep. Lights out tonight by 10:45 PM.",
    confidence: 0.88,
    icon: "⚠️",
  },
  {
    id: "i3",
    type: "win",
    title: "Workouts → 2.3x output days",
    body: "Days that start with a workout produce 2.3× more completed deep work blocks. Keep the morning sacred.",
    confidence: 0.91,
    icon: "🚀",
  },
  {
    id: "i4",
    type: "challenge",
    title: "Time to level up",
    body: "You've completed 92% of P1 tasks for 14 days straight. Tomorrow we add one extra deep work block.",
    confidence: 0.97,
    icon: "🎯",
  },
];

// ─── Apex Growth Corp ───────────────────────────────────────────
export const clients = [
  { id: "c1", name: "Meridian Capital", logo: "M", mrr: 18500, status: "active", health: 96, owner: "You", since: "2024-03" },
  { id: "c2", name: "Volta Energy", logo: "V", mrr: 12000, status: "active", health: 88, owner: "Alex", since: "2024-06" },
  { id: "c3", name: "Northwind Labs", logo: "N", mrr: 9500, status: "active", health: 72, owner: "You", since: "2024-09" },
  { id: "c4", name: "Helios Robotics", logo: "H", mrr: 22000, status: "active", health: 94, owner: "Sarah", since: "2024-01" },
  { id: "c5", name: "Citadel Brands", logo: "C", mrr: 7500, status: "onboarding", health: 80, owner: "You", since: "2025-04" },
  { id: "c6", name: "Aurora Health", logo: "A", mrr: 14000, status: "active", health: 91, owner: "Alex", since: "2024-07" },
];

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
}> = [
  { id: "d1", company: "Stellar Logistics", contact: "James Chen", value: 24000, stage: "lead", probability: 20, closeDate: "2026-06-15", source: "Inbound" },
  { id: "d2", company: "Quantum Bio", contact: "Dr. Lena Park", value: 18000, stage: "lead", probability: 25, closeDate: "2026-06-20", source: "Referral" },
  { id: "d3", company: "Apex Realty", contact: "Mike Torres", value: 9500, stage: "qualified", probability: 40, closeDate: "2026-05-30", source: "Cold outreach" },
  { id: "d4", company: "Nimbus Cloud", contact: "Priya Sharma", value: 32000, stage: "qualified", probability: 50, closeDate: "2026-06-05", source: "Event" },
  { id: "d5", company: "Beacon Health", contact: "Tom Reilly", value: 28000, stage: "proposal", probability: 65, closeDate: "2026-05-28", source: "Referral" },
  { id: "d6", company: "Orion Defense", contact: "Sarah Kim", value: 45000, stage: "proposal", probability: 70, closeDate: "2026-06-12", source: "Inbound" },
  { id: "d7", company: "Vertex Capital", contact: "Daniel Cohen", value: 85000, stage: "negotiation", probability: 85, closeDate: "2026-05-22", source: "Referral" },
  { id: "d8", company: "Phoenix Retail", contact: "Maya Patel", value: 16000, stage: "negotiation", probability: 80, closeDate: "2026-05-25", source: "Inbound" },
  { id: "d9", company: "Atlas Mining", contact: "Greg Foster", value: 38000, stage: "won", probability: 100, closeDate: "2026-05-08", source: "Cold outreach" },
];

export const agencyRevenue = [
  { month: "Nov", mrr: 58000, deals: 4 },
  { month: "Dec", mrr: 64000, deals: 5 },
  { month: "Jan", mrr: 71000, deals: 6 },
  { month: "Feb", mrr: 76000, deals: 5 },
  { month: "Mar", mrr: 83500, deals: 7 },
  { month: "Apr", mrr: 89000, deals: 6 },
  { month: "May", mrr: 95500, deals: 8 },
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
}> = [
  { id: "cam1", name: "Q2 LinkedIn ABM Push", client: "Meridian Capital", budget: 18000, spent: 11200, status: "running", channel: "LinkedIn", performance: 142, endsAt: "2026-06-30" },
  { id: "cam2", name: "Brand Awareness — Pacific NW", client: "Volta Energy", budget: 24000, spent: 22100, status: "review", channel: "Meta + Google", performance: 118, endsAt: "2026-05-15" },
  { id: "cam3", name: "Founder-led content engine", client: "Northwind Labs", budget: 8500, spent: 3200, status: "planning", channel: "LinkedIn + X", performance: 0, endsAt: "2026-07-31" },
  { id: "cam4", name: "Demo Day campaign", client: "Helios Robotics", budget: 32000, spent: 29800, status: "complete", channel: "Multi", performance: 187, endsAt: "2026-04-30" },
];

export const sales = {
  closedThisMonth: 142500,
  closedLastMonth: 118000,
  pipelineValue: 295500,
  weightedPipeline: 178650,
  appointments: 28,
  appointmentsLastMonth: 22,
  showRate: 0.86,
  closeRate: 0.34,
};

// ─── Learning library ─────────────────────────────────────────
export const learningTracks = [
  {
    id: "l1",
    title: "Systems Thinking for Founders",
    instructor: "Naval Ravikant + curators",
    duration: "8h 24m",
    progress: 0.62,
    category: "Mindset",
    cover: "violet",
    lessons: 24,
    completed: 15,
  },
  {
    id: "l2",
    title: "High-Performance Sleep & Recovery",
    instructor: "Dr. Matthew Walker",
    duration: "4h 12m",
    progress: 0.85,
    category: "Health",
    cover: "cyan",
    lessons: 12,
    completed: 10,
  },
  {
    id: "l3",
    title: "Agency Scaling Playbook 2026",
    instructor: "Apex Internal",
    duration: "12h 30m",
    progress: 0.34,
    category: "Business",
    cover: "emerald",
    lessons: 36,
    completed: 12,
  },
  {
    id: "l4",
    title: "Cold Outreach Mastery",
    instructor: "Alex Hormozi-school",
    duration: "6h 18m",
    progress: 1.0,
    category: "Sales",
    cover: "amber",
    lessons: 18,
    completed: 18,
  },
  {
    id: "l5",
    title: "Stoic Operating System",
    instructor: "Ryan Holiday",
    duration: "5h 45m",
    progress: 0.21,
    category: "Mindset",
    cover: "rose",
    lessons: 20,
    completed: 4,
  },
  {
    id: "l6",
    title: "Strength Training for Longevity",
    instructor: "Dr. Peter Attia school",
    duration: "9h 02m",
    progress: 0.48,
    category: "Health",
    cover: "indigo",
    lessons: 28,
    completed: 13,
  },
];

// ─── Food log ─────────────────────────────────────────────────
export const foodLog = [
  { id: "f1", meal: "Breakfast", name: "3 eggs, oats, blueberries, almond butter", calories: 620, protein: 32, carbs: 58, fat: 24, time: "07:15" },
  { id: "f2", meal: "Snack", name: "Whey protein shake + banana", calories: 280, protein: 35, carbs: 30, fat: 3, time: "10:30" },
  { id: "f3", meal: "Lunch", name: "Grilled chicken bowl, rice, avocado, greens", calories: 720, protein: 58, carbs: 72, fat: 22, time: "13:00" },
  { id: "f4", meal: "Snack", name: "Greek yogurt + honey + walnuts", calories: 220, protein: 18, carbs: 22, fat: 8, time: "16:00" },
];

// ─── AI conversation seed ────────────────────────────────────
export const chatHistory = [
  {
    id: "m1",
    role: "assistant" as const,
    content:
      "Morning, Sayed. You're 47 days deep into your discipline streak and your output last week was your second highest of the year. One observation: your Thursday productivity dipped to 73 — that's the same day you skipped the morning workout. Want me to lock tomorrow's 6 AM block?",
    time: "07:02",
  },
  {
    id: "m2",
    role: "user" as const,
    content: "Yes. Also, what's the most leveraged thing I can do today?",
    time: "07:04",
  },
  {
    id: "m3",
    role: "assistant" as const,
    content:
      "The Meridian call at 2 PM. $85k ACV, 85% probability, and your last touch was 11 days ago — risk of cooling. I've drafted a pre-call brief in your inbox with their recent activity, last objection, and three closing angles. Everything else today is downstream of that conversation going well.",
    time: "07:04",
  },
];
