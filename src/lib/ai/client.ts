/**
 * Anthropic client — lazy-initialized so the app boots cleanly without
 * an API key. Falls back to a scripted mock reply when missing.
 */

import { buildSystemPrompt } from "./system-prompt";
import { generateMockReply } from "./mock-reply";
import type { ChatMessage, CoachPersonality, UserContext } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";

/**
 * Streams a reply token-by-token. If ANTHROPIC_API_KEY is set, calls the
 * real Anthropic API. Otherwise yields a scripted mock so the UI keeps
 * working in dev.
 */
export async function* streamCoachReply({
  messages,
  personality = "strategist",
  user,
}: {
  messages: ChatMessage[];
  personality?: CoachPersonality;
  user: UserContext;
}): AsyncIterable<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Mock mode — yield the full reply in small chunks to mimic streaming.
    const reply = generateMockReply(messages);
    for (const chunk of chunkify(reply, 12)) {
      await sleep(28);
      yield chunk;
    }
    return;
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      stream: true,
      system: buildSystemPrompt({ personality, user }),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok || !res.body) {
    yield `\n\n*(AI error: HTTP ${res.status}. Falling back to mock.)*\n\n`;
    yield generateMockReply(messages);
    return;
  }

  // Parse Anthropic SSE stream
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const evt = JSON.parse(payload);
        if (
          evt.type === "content_block_delta" &&
          evt.delta?.type === "text_delta" &&
          typeof evt.delta.text === "string"
        ) {
          yield evt.delta.text;
        }
      } catch {
        // ignore malformed lines
      }
    }
  }
}

function chunkify(s: string, n: number) {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
