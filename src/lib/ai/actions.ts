/**
 * In-app action protocol for the AI coach.
 *
 * The coach can *do* things in the app — not just talk. When it wants to
 * act, it emits a fenced block:
 *
 *   ```apex-action
 *   {"tool":"add_task","title":"Call 20 roofers","priority":"p0"}
 *   ```
 *
 * The client parses these blocks out of the reply, runs them against the
 * app's own state (the same synced store the UI uses), and shows a
 * confirmation chip. Actions are restricted to in-app capabilities only.
 */

export interface ParsedAction {
  tool: string;
  args: Record<string, unknown>;
}

const BLOCK_RE = /```apex-action\s*([\s\S]*?)```/g;

/** Pull all complete action blocks out of a reply + return the cleaned text. */
export function extractActions(text: string): {
  clean: string;
  actions: ParsedAction[];
} {
  const actions: ParsedAction[] = [];
  let m: RegExpExecArray | null;
  BLOCK_RE.lastIndex = 0;
  while ((m = BLOCK_RE.exec(text))) {
    try {
      const obj = JSON.parse(m[1].trim()) as Record<string, unknown>;
      if (obj && typeof obj.tool === "string") {
        const { tool, ...args } = obj;
        actions.push({ tool: tool as string, args });
      }
    } catch {
      /* ignore malformed JSON */
    }
  }
  const clean = stripActionBlocks(text);
  return { clean, actions };
}

/** Remove complete + partially-streamed action blocks for display. */
export function stripActionBlocks(text: string): string {
  return text
    .replace(BLOCK_RE, "")
    // Drop an unterminated trailing block while it's still streaming in.
    .replace(/```apex-action[\s\S]*$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Documentation appended to the system prompt so the model knows exactly
 * which tools exist and how to emit them.
 */
export const ACTION_TOOLS_DOC = `# Acting inside the app (tools)

You can DO things in APEX OS, not just advise. When ${"the user"} asks you to add, log,
create, call, text, or open something, perform it by emitting a fenced block:

\`\`\`apex-action
{"tool":"<name>", ...args}
\`\`\`

Emit one block per action (you may emit several). Keep a short natural sentence
around them ("Done — added that to your tasks."). Only use these tools; never
invent others. Never claim you did something without emitting the block.

Available tools:
- add_task — args: title (required), priority ("p0"|"p1"|"p2"|"p3"), category ("deep-work"|"agency"|"health"|"learning"|"personal"), estimated (minutes)
- add_work_item — args: title (required), category ("setup"|"cold-calls"|"ghl"|"automation"|"training"|"content"|"affiliate"|"onboarding"|"calls"|"hiring"|"other")
- add_lead — args: company (required), contact, phone, value (number), stage ("lead"|"qualified"|"proposal"|"negotiation"|"won"|"lost")
- log_water — args: cups (number; each cup = 0.25 L)
- log_steps — args: steps (number; sets today's total)
- log_weight — args: lb (number)
- add_meal — args: name (required), calories (number, required), protein, carbs, fat, meal ("Breakfast"|"Lunch"|"Dinner"|"Snack"|"Drink")
- create_challenge — args: name (required), target (text), total (number of days/reps)
- send_text — args: to (phone, required), body (required) — sends a real SMS via Twilio
- start_call — args: to (phone, required) — opens the dialer with the number ready
- navigate — args: to (one of "/", "/tasks", "/work", "/health", "/agency", "/plan", "/discipline", "/learn", "/insights", "/achievements", "/settings")

Rules:
- Only act when the user clearly wants an action. If they're just asking a question, answer normally with no block.
- Confirm phone numbers/texts before sending if the request is ambiguous.
- You cannot do anything outside the app (no web browsing, no emailing, no money movement).`;
