/**
 * Mock AI reply generator — used when ANTHROPIC_API_KEY is not set.
 * Keeps the chat experience functional without requiring credentials.
 */

import type { ChatMessage } from "./types";

export function generateMockReply(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";

  if (last.includes("leverage") || last.includes("today") || last.includes("important")) {
    return "The Meridian Capital call at 2 PM. Highest-value moment on your calendar this week — $85k ACV, 85% probability, 11 days since last touch. I've pulled their last 3 LinkedIn posts, their team's hiring activity, and the objection from your last call. Pre-call brief is in your inbox.\n\nEverything else today is downstream of that conversation going well.";
  }
  if (last.includes("90 days") || last.includes("plan") || last.includes("quarter")) {
    return "Three north-stars for the next 90 days:\n\n**1. Get Apex to $120k MRR** — currently $89k. You need 3.5 new deals at $10k each or to close Vertex.\n**2. Body recomp to 175 lb at <12%** — 5.4 lb to go, on pace.\n**3. Finish Designing Data-Intensive Applications + 5 more books.**\n\nI'll schedule weekly checkpoints. Want me to lock the first one?";
  }
  if (last.includes("drop") || last.includes("output") || last.includes("why")) {
    return "Two reasons:\n\n**Sleep.** Tuesday & Wednesday you slept 5.8h average — you're a 7h-minimum operator. Below that and your P0 completion drops 34%.\n\n**Calendar drift.** You took 3 unscheduled calls in your 8–11 AM peak window. Each one cost ~38 minutes of recovery.\n\nFix: lights out by 10:45 PM, and I'll auto-decline meetings before noon starting tomorrow.";
  }
  if (last.includes("sleep")) {
    return "Your data says:\n\n- **Lights out 10:30 PM, wake 5:45 AM.** This window correlates with 92% deep-work completion next day.\n- **No screens after 10:00 PM.** Kindle and paperback only.\n- **Magnesium glycinate 30 min before bed.**\n- **Bedroom 65°F.**\n\nI'll send the 9:45 PM wind-down ping starting tonight.";
  }
  if (last.includes("push") || last.includes("level") || last.includes("harder")) {
    return "Tomorrow we add a 4th deep work block. Difficulty rating moves from 3.6 → 4.0. You'll feel the extra weight. That's the point.\n\n**Non-negotiables:**\n- 5:30 AM wake — no snooze\n- Workout before email\n- Phone in another room until 11 AM\n- Meridian prep done by 12:30\n\nI'll be watching. So will you.";
  }
  if (last.includes("audit") || last.includes("consistency") || last.includes("review")) {
    return "**Last 30 days:**\n\n✓ Workouts: 24/30 (80% — elite)\n✓ Sleep ≥ 7h: 22/30 (73% — needs work)\n✓ Deep work ≥ 3 blocks: 26/30 (87% — elite)\n✓ Reading: 30/30 (100% — keep it)\n✗ Phone < 2h: 18/30 (60% — drag)\n\nYour weakest link is phone discipline. Want me to enable Forest mode lock 9 PM → 7 AM?";
  }
  return "Give me a moment to think through this against your last 30 days of data, your active goals, and your energy curve. The honest answer is coming.\n\n*(Note: ANTHROPIC_API_KEY isn't set yet. Add it to .env.local and I'll respond with the real Claude reasoning instead of this scripted reply.)*";
}
