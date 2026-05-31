import type { NextRequest } from "next/server";
import { streamCoachReply } from "@/lib/ai/client";
import type { ChatMessage, CoachPersonality } from "@/lib/ai/types";
import { user as mockUser, todayMetrics } from "@/lib/mock-data";

export const runtime = "edge";

const goals = [
  "Build Avori Growth Corp — close first paying clients",
  "Body composition: lean and muscular (starting 172 lb)",
  "Lock in non-negotiables: workout, sleep, Quran, walk",
];

const patterns = [
  "Day 1 — no patterns yet. AI is in observation mode.",
  "First pattern read expected after 7 days of consistent logging.",
];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    messages: ChatMessage[];
    personality?: CoachPersonality;
  };

  const userContext = {
    name: mockUser.name,
    disciplineScore: mockUser.disciplineScore,
    productivityScore: mockUser.productivityScore,
    focusScore: mockUser.focusScore,
    level: mockUser.level,
    xp: mockUser.xp,
    xpToNext: mockUser.xpToNext,
    streak: mockUser.streak,
    longestStreak: mockUser.longestStreak,
    honestyLevel: 9,
    tasksCompleted: todayMetrics.tasksCompleted,
    tasksTotal: todayMetrics.tasksTotal,
    focusMinutes: todayMetrics.focusMinutes,
    focusTarget: todayMetrics.focusTarget,
    sleepHours: todayMetrics.sleep,
    calories: todayMetrics.calories,
    caloriesTarget: todayMetrics.caloriesTarget,
    goals,
    patterns,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamCoachReply({
          messages: body.messages,
          personality: body.personality,
          user: userContext,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown AI error";
        controller.enqueue(
          encoder.encode(`\n\n*(AI error: ${msg})*`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
