/**
 * Mock AI reply generator — used when ANTHROPIC_API_KEY is not set.
 * Keeps the chat experience functional without requiring credentials.
 *
 * Day-1 friendly: doesn't reference fake history. Real Anthropic
 * replies (when the key is present) are personalized via the system
 * prompt in src/lib/ai/system-prompt.ts.
 */

import type { ChatMessage } from "./types";

export function generateMockReply(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  if (last.includes("leverage") || last.includes("today") || last.includes("important")) {
    return "Day 1 leverage is simple: pick the **one** thing you'd be embarrassed to skip tomorrow morning. That's your P0.\n\nFor most people building a service business with a body composition goal, the answer is:\n\n1. Morning workout before email\n2. One deep work block on your highest-priority business task\n3. Sleep 8h tonight\n\nWhich of those three do you want to lock first?";
  }
  if (last.includes("90 days") || last.includes("plan") || last.includes("quarter")) {
    return "**Three north-stars for your next 90 days** (based on what you've told me):\n\n1. **Apex Growth Corp** — close your first 3 paying clients. Define the offer, set the price, run outreach 5 days a week.\n2. **Body composition** — maintain 167 lb while dropping body fat. Resistance train 4×/week, hit 180g protein daily, sleep 8h.\n3. **Identity habits** — pick 3 non-negotiables you do every single day. Workout, read 30 min, lights out by 10:30 PM is a strong default.\n\nWant me to break any of these into weekly checkpoints?";
  }
  if (last.includes("drop") || last.includes("output") || last.includes("why")) {
    return "I don't have your data yet — Day 1. Once you log 7 days of tasks, workouts, and sleep, I can run actual diagnostics.\n\nWhat I'd watch for in advance, based on patterns common to operators with your goals:\n\n- Sleep < 7h crushes next-day decision-making\n- Skipping the morning workout makes deep work harder all day\n- Phone-first mornings (vs. task-first) kill focus for 3+ hours\n\nLog those honestly. The picture will sharpen fast.";
  }
  if (last.includes("sleep")) {
    return "For your body composition goal (lean and muscular at 167 lb), sleep is non-negotiable:\n\n- **8 hours minimum.** Growth hormone and muscle recovery happen here.\n- **Lights out by 10:30 PM** if you want to wake at 6 AM with energy.\n- **No screens after 9:45 PM.** Blue light delays melatonin by ~90 min.\n- **Room temp 65°F.** Improves deep sleep ~20%.\n\nWhat's your current bedtime? I'll help you back it up an hour at a time.";
  }
  if (last.includes("push") || last.includes("level") || last.includes("harder") || last.includes("challenge")) {
    return "Day 1 is not the day to go max difficulty. The trap is committing to so much you break by day 7.\n\n**This week's minimum effective dose:**\n\n- 3 workouts (any duration, just show up)\n- 1 deep work block per day, 60 min minimum\n- Sleep at least 7h\n- One meal logged daily so I can calibrate macros\n\nIf you crush this for 7 days, I'll raise the bar. If you don't, we adjust until something sticks. Deal?";
  }
  if (last.includes("audit") || last.includes("consistency") || last.includes("review")) {
    return "I can't audit Day 1 — nothing to review yet.\n\nBut here's what your **week 1 audit** will look like, so you know the target:\n\n- Workouts: target 4/7 days\n- Sleep ≥ 7h: target 6/7 days\n- Deep work blocks: target 5/7 days\n- Meals logged: target 14+ across the week (so I can calibrate)\n- Reading: target any cadence you'll keep\n\nHit those numbers and you've earned the right to be pushed harder in week 2.";
  }
  if (last.includes("goal") || last.includes("body") || last.includes("muscular") || last.includes("lean")) {
    return "Lean and muscular at 167 lb. Got it.\n\n**Your starting protocol:**\n\n- **Protein:** 180g/day (1.1g per lb body weight)\n- **Calories:** 2,600/day target, slight surplus for muscle gain\n- **Training:** 4× resistance per week, compound lifts (squat, deadlift, press, pull)\n- **Cardio:** 2× zone-2 sessions, 30 min each\n- **Sleep:** 8h non-negotiable\n\nWe'll adjust calories every 2 weeks based on the scale + the mirror. Log meals via photo scan on the Health tab — I'll tighten the numbers as I learn what you actually eat.";
  }
  return "I'm in observation mode until you log a few days of data. Tell me:\n\n1. Your **top goal** for the next 90 days\n2. Your **three non-negotiables** (the habits you refuse to break)\n3. Your **sleep target** (lights out + wake time)\n\nThe more concrete you are now, the sharper I'll be by week 2.\n\n*(Note: ANTHROPIC_API_KEY isn't set yet. Add it to .env.local and I'll respond with real Claude reasoning instead of this scripted reply.)*";
}
