import type { NextRequest } from "next/server";
import { streamCoachReply } from "@/lib/ai/client";
import type { ChatMessage, CoachPersonality } from "@/lib/ai/types";
import { user as mockUser, todayMetrics } from "@/lib/mock-data";

export const runtime = "edge";

const goals = [
  "Hit $150k MRR at Apex Growth Corp by end of Q3",
  "Body recomp: 175 lb at sub-12% body fat",
  "Read 24 books this year",
  "75 Hard — Apex Edition completion (currently day 47/75)",
];

const patterns = [
  "Peak deep-work window is 7–11 AM (92% of best output)",
  "Output drops 34% after <6h sleep",
  "Workouts in AM correlate with 2.3× deep work blocks completed",
  "Phone usage > 2h/day = focus score -8 points",
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
    mood: todayMetrics.mood,
    energy: todayMetrics.energy,
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
