/**
 * Mock AI reply generator — used when ANTHROPIC_API_KEY is not set.
 * Keeps the chat experience functional without requiring credentials.
 *
 * Day-1 friendly: doesn't reference fake history. Real Anthropic
 * replies (when the key is present) are personalized via the system
 * prompt in src/lib/ai/system-prompt.ts.
 */

import type { ChatMessage } from "./types";

/** ```apex-action fenced block for a single tool call. */
function block(obj: Record<string, unknown>): string {
  return "```apex-action\n" + JSON.stringify(obj) + "\n```";
}

const ROUTE_WORDS: Record<string, string> = {
  today: "/", dashboard: "/", home: "/",
  task: "/tasks", tasks: "/tasks",
  work: "/work",
  health: "/health", food: "/health", meals: "/health",
  agency: "/agency", crm: "/agency", dialer: "/agency", pipeline: "/agency",
  plan: "/plan",
  discipline: "/discipline",
  learn: "/learn",
  insights: "/insights",
  achievements: "/achievements",
  settings: "/settings",
  calendar: "/calendar",
};

/**
 * Best-effort intent → action for mock mode (no ANTHROPIC_API_KEY). Lets the
 * "AI can do things" feature work out of the box. Real Claude does this far
 * better via the tools doc in the system prompt.
 */
function tryActionReply(raw: string): string | null {
  const text = raw.trim();
  const low = text.toLowerCase();

  // text someone: "text +1555... : message"
  const textMatch = text.match(/\btext\s+(\+?[\d][\d\s().-]{6,})\s*[:,-]?\s*(.+)/i);
  if (textMatch) {
    const to = textMatch[1].replace(/[^\d+]/g, "");
    const body = textMatch[2].trim();
    return `Sending that text now.\n\n${block({ tool: "send_text", to, body })}`;
  }
  // call someone
  const callMatch = low.match(/\bcall\s+(\+?[\d][\d\s().-]{6,})/);
  if (callMatch) {
    const to = callMatch[1].replace(/[^\d+]/g, "");
    return `Opening the dialer for you.\n\n${block({ tool: "start_call", to })}`;
  }
  // add lead
  const leadMatch = text.match(/\badd (?:a )?(?:new )?lead\s*[:-]?\s*(.+)/i);
  if (leadMatch) {
    return `Added to your pipeline.\n\n${block({ tool: "add_lead", company: leadMatch[1].trim() })}`;
  }
  // add to work list
  const workMatch = text.match(/\badd\s+(.+?)\s+to (?:my )?work(?: list)?/i) || text.match(/\bwork list[:-]?\s*(.+)/i);
  if (workMatch) {
    return `Added to your work list.\n\n${block({ tool: "add_work_item", title: workMatch[1].trim() })}`;
  }
  // add task
  const taskMatch = text.match(/\badd (?:a )?task\s*(?:to|:|-)?\s*(.+)/i) || text.match(/\bremind me to\s+(.+)/i);
  if (taskMatch) {
    const title = taskMatch[1].trim().replace(/[.!]+$/, "");
    const priority = /\b(p0|urgent|important|must|critical)\b/i.test(low) ? "p0" : "p1";
    return `Done — that's on today's list.\n\n${block({ tool: "add_task", title, priority })}`;
  }
  // log water
  const waterMatch = low.match(/(\d+)\s*(?:cups?|glass(?:es)?)?\s*(?:of\s+)?water/) || low.match(/\blog\s+(\d+)\s+water/);
  if (waterMatch) {
    return `Logged.\n\n${block({ tool: "log_water", cups: Number(waterMatch[1]) })}`;
  }
  // log steps
  const stepMatch = low.match(/(\d[\d,]{2,})\s*steps/);
  if (stepMatch) {
    return `Updated your steps.\n\n${block({ tool: "log_steps", steps: Number(stepMatch[1].replace(/,/g, "")) })}`;
  }
  // log weight
  const weightMatch = low.match(/(?:weigh|weight)\D*(\d{2,3}(?:\.\d)?)/);
  if (weightMatch) {
    return `Logged your weigh-in.\n\n${block({ tool: "log_weight", lb: Number(weightMatch[1]) })}`;
  }
  // navigate
  const navMatch = low.match(/\b(?:open|go to|take me to|show me)\s+(?:the\s+|my\s+)?(\w+)/);
  if (navMatch && ROUTE_WORDS[navMatch[1]]) {
    return `Opening ${navMatch[1]}.\n\n${block({ tool: "navigate", to: ROUTE_WORDS[navMatch[1]] })}`;
  }
  return null;
}

export function generateMockReply(messages: ChatMessage[]): string {
  const lastRaw = messages[messages.length - 1]?.content ?? "";
  const action = tryActionReply(lastRaw);
  if (action) return action;
  const last = lastRaw.toLowerCase();

  if (last.includes("leverage") || last.includes("today") || last.includes("important")) {
    return "Day 1 leverage is simple: pick the **one** thing you'd be embarrassed to skip tomorrow morning. That's your P0.\n\nFor most people building a service business with a body composition goal, the answer is:\n\n1. Morning workout before email\n2. One deep work block on your highest-priority business task\n3. Sleep 8h tonight\n\nWhich of those three do you want to lock first?";
  }
  if (last.includes("90 days") || last.includes("plan") || last.includes("quarter")) {
    return "**Three north-stars for your next 90 days** (based on what you've told me):\n\n1. **Avori Growth Corp** — close your first 3 paying clients. Define the offer, set the price, run outreach 5 days a week.\n2. **Body composition** — maintain 172 lb while dropping body fat. Resistance train 4×/week, hit 180g protein daily, sleep 8h.\n3. **Identity habits** — pick 3 non-negotiables you do every single day. Workout, 30 min Speechify, lights out by 10:30 PM is a strong default.\n\nWant me to break any of these into weekly checkpoints?";
  }
  if (last.includes("drop") || last.includes("output") || last.includes("why")) {
    return "I don't have your data yet — Day 1. Once you log 7 days of tasks, workouts, and sleep, I can run actual diagnostics.\n\nWhat I'd watch for in advance, based on patterns common to operators with your goals:\n\n- Sleep < 7h crushes next-day decision-making\n- Skipping the morning workout makes deep work harder all day\n- Phone-first mornings (vs. task-first) kill focus for 3+ hours\n\nLog those honestly. The picture will sharpen fast.";
  }
  if (last.includes("sleep")) {
    return "For your body composition goal (lean and muscular at 172 lb), sleep is non-negotiable:\n\n- **8 hours minimum.** Growth hormone and muscle recovery happen here.\n- **Lights out by 10:30 PM** if you want to wake at 6 AM with energy.\n- **No screens after 9:45 PM.** Blue light delays melatonin by ~90 min.\n- **Room temp 65°F.** Improves deep sleep ~20%.\n\nWhat's your current bedtime? I'll help you back it up an hour at a time.";
  }
  if (last.includes("push") || last.includes("level") || last.includes("harder") || last.includes("challenge")) {
    return "Day 1 is not the day to go max difficulty. The trap is committing to so much you break by day 7.\n\n**This week's minimum effective dose:**\n\n- 3 workouts (any duration, just show up)\n- 1 deep work block per day, 60 min minimum\n- Sleep at least 7h\n- One meal logged daily so I can calibrate macros\n\nIf you crush this for 7 days, I'll raise the bar. If you don't, we adjust until something sticks. Deal?";
  }
  if (last.includes("audit") || last.includes("consistency") || last.includes("review")) {
    return "I can't audit Day 1 — nothing to review yet.\n\nBut here's what your **week 1 audit** will look like, so you know the target:\n\n- Workouts: target 4/7 days\n- Sleep ≥ 7h: target 6/7 days\n- Deep work blocks: target 5/7 days\n- Meals logged: target 14+ across the week (so I can calibrate)\n- Reading: target any cadence you'll keep\n\nHit those numbers and you've earned the right to be pushed harder in week 2.";
  }
  if (last.includes("goal") || last.includes("body") || last.includes("muscular") || last.includes("lean")) {
    return "Lean and muscular at 172 lb. Got it.\n\n**Your starting protocol:**\n\n- **Protein:** 180g/day (1.1g per lb body weight)\n- **Calories:** 2,600/day target, slight surplus for muscle gain\n- **Training:** 4× resistance per week, compound lifts (squat, deadlift, press, pull)\n- **Cardio:** 2× zone-2 sessions, 30 min each\n- **Sleep:** 8h non-negotiable\n\nWe'll adjust calories every 2 weeks based on the scale + the mirror. Log meals via photo scan on the Health tab — I'll tighten the numbers as I learn what you actually eat.";
  }
  return "I'm in observation mode until you log a few days of data. Tell me:\n\n1. Your **top goal** for the next 90 days\n2. Your **three non-negotiables** (the habits you refuse to break)\n3. Your **sleep target** (lights out + wake time)\n\nThe more concrete you are now, the sharper I'll be by week 2.\n\n*(Note: ANTHROPIC_API_KEY isn't set yet. Add it to .env.local and I'll respond with real Claude reasoning instead of this scripted reply.)*";
}
