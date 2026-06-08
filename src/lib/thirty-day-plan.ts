/**
 * APEX OS — Sayed's 60-Day Operating System (Cycle 1)
 *
 *   Day 1 = Monday May 25, 2026
 *   Day 60 = Thursday July 23, 2026
 *
 * The file name says "thirty" for compat with all the existing imports.
 * It now generates a 60-day cycle. Old import path still works.
 *
 * Cycle structure:
 *   - Each day combines: standard template (prayers, Quran, skincare,
 *     content, gym) + a "day pack" (cold-call count, study, affiliate).
 *   - Weekends (Sat/Sun): lighter call volume; Sunday is the weekly
 *     review block.
 *   - Mon–Thu: ramping call intensity.
 *   - Friday: Jummah replaces Dhuhr; owner hours before 11 AM.
 *
 * Per-day USER OVERRIDES (move a block, change its time, add a custom
 * block, mark removed) are held in synced state and applied on top of
 * the base plan — see applyOverrides() and the editor in the timeline.
 */

import { dateKey } from "./dates";

export type BlockKind =
  | "spiritual"
  | "skincare"
  | "study"
  | "deep-work"
  | "starbucks"
  | "commute"
  | "meal"
  | "agency"
  | "content"
  | "affiliate"
  | "gym"
  | "reflection"
  | "sleep"
  | "personal"
  | "review"
  | "calendar"
  | "custom";

export interface Block {
  id: string;
  time: string; // "06:30"
  endTime?: string; // "07:00"
  durationMin: number;
  label: string;
  detail?: string;
  kind: BlockKind;
  optional?: boolean;
  starbucksOnly?: boolean;
  weekendOnly?: boolean;
  prayer?: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "jummah";
  /** Source for special blocks (calendar import, user-added, etc.). */
  source?: "base" | "calendar" | "user";
  /** A link to the source — e.g. Google Calendar event URL. */
  link?: string;
}

/**
 * Per-block override the user can apply. Stored in synced state keyed
 * by `plan:overrides:day-N` (whole array of overrides per day).
 */
export interface BlockOverride {
  blockId: string;
  time?: string; // override start
  durationMin?: number;
  label?: string;
  detail?: string;
  removed?: boolean;
}

/** Wholly custom block (added by the user) — same shape as Block. */
export type UserBlock = Block & { source: "user" };

export interface DayPlan {
  dayNumber: number; // 1..60
  date: string; // "2026-05-16"
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  fullDate: string; // "Monday, May 25"
  weekNumber: number; // 1..9
  isWeeklyReview: boolean;
  isJummah: boolean;
  isLightDay: boolean;
  oneThing?: string;
  coldCallTarget?: number;
  emailTarget?: number;
  studyFocus?: string;
  affiliateAction?: string;
  customBlocks?: Block[];
}

// ─────────────────────────────────────────────────────────────
// STANDARD DAILY TEMPLATE
// ─────────────────────────────────────────────────────────────

const morningBlocks: Block[] = [
  {
    id: "wake",
    time: "04:00",
    durationMin: 5,
    label: "Wake up",
    detail: "Phone face-down. No scrolling. Hands → bathroom → brush teeth.",
    kind: "spiritual",
  },
  {
    id: "wudu-fajr",
    time: "04:05",
    durationMin: 35,
    label: "Wudu + Pray Fajr",
    detail: "Wudu by 4:18 (Fajr adhan). Sunnah → fard → tasbih 5 min. Iqamah ~4:35am.",
    kind: "spiritual",
    prayer: "fajr",
  },
  {
    id: "quran-am",
    time: "04:40",
    durationMin: 15,
    label: "Quran — 2 pages",
    detail: "Slow, intentional. Reflect on what you read. Best brain state of the day — don't waste it.",
    kind: "spiritual",
  },
  {
    id: "win-journal",
    time: "04:55",
    durationMin: 5,
    label: "Write the ONE thing that makes today a win",
    detail: "One sentence. Pen to paper. Make it specific. Read it before each call sprint.",
    kind: "reflection",
  },
  {
    id: "skincare-am",
    time: "05:00",
    durationMin: 15,
    label: "AM skincare routine",
    detail: "CeraVe SA cleanser → niacinamide/azelaic → BASED moisturizer → SPF.",
    kind: "skincare",
  },
  {
    id: "script-write",
    time: "05:15",
    durationMin: 15,
    label: "Script reps — 10× pen + paper",
    detail: "Impact Formula generic script, written by hand. Daily reps. Read aloud the last 2 reps.",
    kind: "study",
  },
  {
    id: "calls-prep",
    time: "05:30",
    durationMin: 10,
    label: "Cold call prep",
    detail: "Open dialer. Pull list. Headphones in. Niyyah. Light the lamp.",
    kind: "agency",
  },
  {
    id: "calls-sprint-1",
    time: "05:40",
    durationMin: 105,
    label: "☎️ Cold call sprint 1 — East Coast prime",
    detail: "5:40-7:25 PT = 8:40-10:25 ET. Owners answer in this window. Track every dial.",
    kind: "agency",
  },
  {
    id: "breakfast",
    time: "07:25",
    durationMin: 25,
    label: "Breakfast + protein",
    detail: "Protein-heavy. 40g minimum. Lift toward 200g daily target. Hydrate.",
    kind: "meal",
  },
];

const summerWeekdayBlocks: Block[] = [
  // Summer weekday work sequence — outreach + cold-call sprints 2 & 3 + build block.
  {
    id: "outreach-am",
    time: "07:50",
    durationMin: 40,
    label: "Outreach + follow-ups",
    detail:
      "DMs, warm-prospect follow-ups, calendar confirms for today's closes, LinkedIn touches.",
    kind: "agency",
  },
  {
    id: "calls-sprint-2",
    time: "08:30",
    durationMin: 90,
    label: "☎️ Cold call sprint 2 — central time owners",
    detail: "8:30-10:00 PT = 11:30-1:00 ET. Texas + Chicago owners are pre-lunch. Push for sets.",
    kind: "agency",
  },
  {
    id: "mid-am-reset",
    time: "10:00",
    durationMin: 10,
    label: "Reset — coffee + protein",
    detail: "No phone. Don't scroll. Stretch. Re-read your win statement.",
    kind: "personal",
  },
  {
    id: "build-block",
    time: "10:10",
    durationMin: 80,
    label: "Build block — AI agents · automations · GHL",
    detail:
      "Make.com / Zapier flows, Claude API helpers, GHL pipelines, n8n. Build the machine that calls/closes/follows-up for you.",
    kind: "study",
  },
  {
    id: "calls-sprint-3",
    time: "11:30",
    durationMin: 90,
    label: "☎️ Cold call sprint 3 — west coast wake-up",
    detail: "11:30-1:00 PT = SoCal/SF owners back at desks. Sacramento contractors. Local accent advantage.",
    kind: "agency",
  },
];

const starbucksBlocks: Block[] = [
  {
    id: "walk-starbucks",
    time: "07:50",
    durationMin: 25,
    label: "Walk to Starbucks",
    detail: "25-min walk. NEPQ podcast or silence. Niyyah for the day.",
    kind: "commute",
    starbucksOnly: true,
  },
  {
    id: "starbucks-block",
    time: "08:15",
    durationMin: 5 * 60,
    label: "Starbucks lock-in block",
    detail:
      "8:15 AM – 1:15 PM. Cold call sprints + build block executed here. Order drink, hide phone, headphones in. Owner hours and outreach.",
    kind: "starbucks",
    starbucksOnly: true,
  },
  {
    id: "walk-from-starbucks",
    time: "13:15",
    durationMin: 25,
    label: "Walk home from Starbucks",
    detail: "Decompress. Voice notes for content ideas. Hydrate.",
    kind: "commute",
    starbucksOnly: true,
  },
];

const afternoonBlocks: Block[] = [
  {
    id: "lunch",
    time: "13:12",
    durationMin: 25,
    label: "Lunch + Dhuhr prep",
    detail: "Protein + carbs. Photo log via Health tab. Don't eat at the desk — full reset.",
    kind: "meal",
  },
  {
    id: "closing-calls",
    time: "13:37",
    durationMin: 90,
    label: "💼 Closing calls / Zoom",
    detail:
      "Booked appointments + warm follow-ups. Camera on. Logical certainty frame. No discount until close.",
    kind: "agency",
  },
  {
    id: "content-idea",
    time: "15:10",
    durationMin: 15,
    label: "Today's content idea — agency + main account",
    detail:
      "Agency: value/results/teach. Main: motivational/entrepreneur/AI build-in-public. Outline before filming.",
    kind: "content",
  },
  {
    id: "film-content",
    time: "15:25",
    durationMin: 60,
    label: "Film: 1 agency video + 2–5 main account videos",
    detail: "Batch session. Same outfit, multiple takes, different angles, vertical 9:16.",
    kind: "content",
  },
  {
    id: "edit-agency",
    time: "16:25",
    durationMin: 30,
    label: "Edit + post agency video",
    detail:
      "CapCut. Captions, hook in first 0.5 sec, on-beat. Post to TikTok, Instagram, Facebook, LinkedIn.",
    kind: "content",
  },
  {
    id: "asr",
    time: "16:55",
    durationMin: 12,
    label: "Pray Asr",
    detail: "Summer iqama ~5:00 PM. Don't delay — it kills the afternoon sprint.",
    kind: "spiritual",
    prayer: "asr",
  },
  {
    id: "calls-sprint-4",
    time: "17:10",
    durationMin: 90,
    label: "☎️ Cold call sprint 4 — final push",
    detail: "5:10-6:40 PT. Last-call discipline. East Coast is done but West/Central are still at desks. Close the day with reps.",
    kind: "agency",
  },
  {
    id: "calls-notes",
    time: "18:40",
    durationMin: 13,
    label: "Pipeline notes + CRM update",
    detail: "Write down what worked. Update GHL. Tomorrow's hot list — pre-load 30 numbers.",
    kind: "agency",
  },
  {
    id: "gym-prep",
    time: "18:53",
    durationMin: 7,
    label: "Get ready for gym",
    detail: "Shaker + pre-workout. Confirm with gym bro. Phone on Do Not Disturb.",
    kind: "personal",
  },
];

const eveningBlocks: Block[] = [
  {
    id: "gym",
    time: "19:00",
    durationMin: 55,
    label: "Gym session",
    detail: "Bro split: Mon chest · Tue back · Wed legs · Thu shoulders · Fri arms. Track top set + protein post-lift.",
    kind: "gym",
  },
  {
    id: "maghrib-gym",
    time: "19:58",
    durationMin: 10,
    label: "Pray Maghrib (at gym)",
    detail: "Summer Maghrib ~8:00 PM. Narrow window — pray before leaving the gym.",
    kind: "spiritual",
    prayer: "maghrib",
  },
  {
    id: "walk-from-gym",
    time: "20:08",
    durationMin: 12,
    label: "Walk home from gym",
    detail: "Cool down walk. Phone face-down.",
    kind: "commute",
  },
  {
    id: "shower-pm-skin",
    time: "20:20",
    durationMin: 20,
    label: "Shower + PM skincare",
    detail: "Cleanser → Differin or niacinamide → moisturizer.",
    kind: "skincare",
  },
  {
    id: "dinner",
    time: "20:40",
    durationMin: 25,
    label: "Dinner",
    detail: "Hit remaining protein. Aim for 200g total. Stop at 1,800 kcal.",
    kind: "meal",
  },
  {
    id: "quran-pm",
    time: "21:05",
    durationMin: 10,
    label: "Quran — 2 pages",
    detail: "Evening reading. Quiet, no distractions.",
    kind: "spiritual",
  },
  {
    id: "isha",
    time: "21:15",
    durationMin: 15,
    label: "Pray Isha",
    detail: "Summer iqama ~9:30 PM. Sunnah + fard + witr.",
    kind: "spiritual",
    prayer: "isha",
  },
  {
    id: "edit-main",
    time: "21:30",
    durationMin: 20,
    label: "Edit + post main account videos",
    detail: "Quick cuts. Caption. Post to TikTok + Instagram. Then phone in another room.",
    kind: "content",
  },
  {
    id: "tracker-reflect",
    time: "21:50",
    durationMin: 8,
    label: "Update tracker + reflection",
    detail: "Calls · sets · closes · content posted · money collected. What worked? What sucked? What gets fixed tomorrow?",
    kind: "reflection",
  },
  {
    id: "lay-out-clothes",
    time: "22:00",
    durationMin: 0,
    label: "Lay out clothes + Fajr alarm + bed",
    detail: "Phone in another room. Make dua. Sleep. 6 hours is the budget — protect it.",
    kind: "sleep",
  },
];

export function buildDayBlocks(
  starbucks: boolean,
  weekday: string,
  plan?: DayPlan | null
): Block[] {
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const blocks: Block[] = [...morningBlocks];

  if (starbucks) {
    blocks.push(...starbucksBlocks);
  } else if (!isWeekend) {
    // Summer hardcore — sales-push weekday blocks.
    blocks.push(...summerWeekdayBlocks);
  } else {
    blocks.push({
      id: "weekend-home-work",
      time: "08:30",
      durationMin: 4 * 60,
      label: "Weekend lock-in — build + recovery",
      detail:
        "Lighter dial day. Batch content, ship automations, study, weekly review, family/personal time.",
      kind: "deep-work",
      weekendOnly: true,
    });
  }

  blocks.push(...afternoonBlocks);

  blocks.push({
    id: "dhuhr",
    time: "13:00",
    durationMin: 12,
    label: "Pray Dhuhr",
    detail: "Summer iqama ~1:30 PM. Pray right after sprint 3 ends.",
    kind: "spiritual",
    prayer: "dhuhr",
  });

  if (plan?.isJummah) {
    blocks.push({
      id: "jummah",
      time: "13:00",
      durationMin: 45,
      label: "Jummah prayer at mosque",
      detail: "Arrive 5 min before iqamah. Eat after.",
      kind: "spiritual",
      prayer: "jummah",
    });
  }

  if (plan?.isWeeklyReview) {
    blocks.push({
      id: "weekly-review",
      time: "11:00",
      durationMin: 60,
      label: "Weekly review",
      detail:
        "Dials · sets · closing calls · money · content posts · prayers · gym. Honest scoring. Plan next week.",
      kind: "review",
    });
  }

  blocks.push(...eveningBlocks);

  // Distribute the day's coldCallTarget across the 4 sprint blocks. On rest
  // days (coldCallTarget === 0) every sprint converts to a recovery block.
  const sprintIds = new Set([
    "calls-sprint-1",
    "calls-sprint-2",
    "calls-sprint-3",
    "calls-sprint-4",
  ]);
  const withSprintTargets = blocks.map((b) => {
    if (!sprintIds.has(b.id)) return b;
    if (plan && plan.coldCallTarget === 0) {
      return {
        ...b,
        label: "Rest — no dialing",
        detail: plan.isWeeklyReview
          ? "No cold calls — weekly review + personal/family time."
          : "Recovery / planning / batch content. No dials today.",
        kind: "personal" as const,
        durationMin: 20,
      };
    }
    if (plan && typeof plan.coldCallTarget === "number") {
      const sprintNum = Number(b.id.slice(-1));
      return {
        ...b,
        label: `${b.label.split(" — ")[0]} — toward ${plan.coldCallTarget} dials`,
        detail: `${b.detail} Daily target: ${plan.coldCallTarget} dials across 4 sprints. Make dua before dialing.`,
      };
    }
    return b;
  });

  // Bro split — Mon Chest, Tue Back, Wed Legs, Thu Shoulders, Fri Arms.
  const broSplit: Record<string, { label: string; detail: string }> = {
    Mon: {
      label: "Chest day · push",
      detail: "Flat press top set → incline → fly. 8-12 reps, 3 working sets per move.",
    },
    Tue: {
      label: "Back day · pull",
      detail: "Deadlift or row top set → lat pulldown → row variation → face pulls.",
    },
    Wed: {
      label: "Leg day",
      detail: "Squat or hack squat top set → RDL → leg press → calf raises.",
    },
    Thu: {
      label: "Shoulders",
      detail: "OHP top set → lateral raises (high volume) → rear delts → trap shrugs.",
    },
    Fri: {
      label: "Arms",
      detail: "Biceps + triceps superset. Cable curls + pushdowns. Finish with hammer + skull crushers.",
    },
  };
  const blocksWithSplit = withSprintTargets.map((b) => {
    if (b.id !== "gym") return b;
    const split = broSplit[weekday];
    if (!split) return b; // Sat/Sun rest
    return {
      ...b,
      label: `${split.label} · ${b.durationMin} min`,
      detail: split.detail,
    };
  });
  return blocksWithSplit
    .map((b) => ({ ...b, source: b.source ?? "base" }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Apply per-day user overrides + custom user-added blocks + calendar
 * events on top of the base plan. Pure function — does not mutate
 * inputs.
 */
export function applyOverrides(
  base: Block[],
  overrides: BlockOverride[],
  userBlocks: UserBlock[] = [],
  calendarBlocks: Block[] = []
): Block[] {
  const ovMap = new Map(overrides.map((o) => [o.blockId, o] as const));
  const adjusted = base
    .map((b) => {
      const ov = ovMap.get(b.id);
      if (!ov) return b;
      if (ov.removed) return null;
      return {
        ...b,
        time: ov.time ?? b.time,
        durationMin: ov.durationMin ?? b.durationMin,
        label: ov.label ?? b.label,
        detail: ov.detail ?? b.detail,
      };
    })
    .filter((b): b is Block => b !== null);
  return [...adjusted, ...userBlocks, ...calendarBlocks].sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

// ─────────────────────────────────────────────────────────────
// 60-DAY OVERRIDES — Day 1 = Mon May 25 → Day 60 = Thu Jul 23
// ─────────────────────────────────────────────────────────────

const WEEKDAYS: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"> =
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function jsDayToShort(d: number): "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" {
  return WEEKDAYS[d];
}

interface DayPack {
  oneThing?: string;
  coldCallTarget?: number;
  emailTarget?: number;
  studyFocus?: string;
  affiliateAction?: string;
}

// Day pack pattern per weekday (volume + content focus). Adjusted by
// "week vibe" as the cycle progresses (foundation → volume → intensity
// → compound → crescendo → push → mastery → close → final).
const WEEK_PATTERNS: DayPack[][] = [
  // Week 1 — Foundation
  [
    { oneThing: "Day 1. Set up the system clean.", coldCallTarget: 30, studyFocus: "Andres free portal intro — intent + logical certainty", affiliateAction: "Scroll TikTok 30 min — save 10 viral hooks. Outline affiliate video #1." },
    { oneThing: "Plan the week. Lock the three non-negotiables.", coldCallTarget: 0, studyFocus: "Email Marketing Bible OR Beautiful Prose — 30 min light", affiliateAction: "Storyboard affiliate videos #1 and #2. Family / personal time." },
    { oneThing: "Lock in the system. Make Day 1 of dialing unmissable.", coldCallTarget: 50, studyFocus: "Matt Ryder NEPQ intro video (20 min)", affiliateAction: "Shoot affiliate video #1 — hook + transformation." },
    { oneThing: "Build the muscle. 100 dials, no excuses.", coldCallTarget: 100, studyFocus: "Jeremy Miner 7th Level — 1 video (20 min)", affiliateAction: "Post #1 (burner accounts). Outline #2." },
    { oneThing: "Refine the script. Listen back to your own voice.", coldCallTarget: 110, studyFocus: "Andres Conteras — intent calibration drill", affiliateAction: "Shoot + edit affiliate video #2." },
    { oneThing: "Pull your own call recording. Find 5 mistakes.", coldCallTarget: 60, studyFocus: "Review your best Andres call — new notes", affiliateAction: "Post affiliate video #2." },
    { oneThing: "Owner hours. Call decision-makers before 11 AM.", coldCallTarget: 150, studyFocus: "Impact Team objection handling — re-watch with notes", affiliateAction: "Outline videos #3 + #4." },
  ],
  // Week 2 — Volume
  [
    { oneThing: "Batch shoot. Stack content inventory.", coldCallTarget: 40, studyFocus: "Yash 6 human needs framework — write which need your ICP hits", affiliateAction: "Batch shoot affiliate videos #3 + #4." },
    { oneThing: "Weekly review. What's working? What's not?", coldCallTarget: 0, studyFocus: "Light reading — 30 min", affiliateAction: "Plan Week 2. Family time." },
    { oneThing: "GHL trial check + follow up every warm prospect from Week 1.", coldCallTarget: 65, studyFocus: "Re-read Impact Formula full doc", affiliateAction: "Edit + post affiliate video #3." },
    { oneThing: "200 dials cumulative for the week. Track set rate honestly.", coldCallTarget: 70, studyFocus: "Alex Hormozi $100M Offers — review your offer ladder", affiliateAction: "Shoot affiliate video #5 — new hook angle." },
    { oneThing: "Roleplay 'what's riskier' frame — 10x before any closing call.", coldCallTarget: 75, studyFocus: "Andres frame stack (beach/weather analogy)", affiliateAction: "Edit + post #4. Shoot #6." },
    { oneThing: "Pull a call recording. Find 5 mistakes. Adjust script.", coldCallTarget: 60, emailTarget: 5, studyFocus: "Review your best Andres call — new notes", affiliateAction: "Edit + post #6." },
    { oneThing: "Owners before 11 AM. Pipeline review — push every warm prospect.", coldCallTarget: 65, studyFocus: "Compare Jeremy Miner NEPQ + Matt Ryder to Impact Formula", affiliateAction: "Outline videos #7–10 for Week 3 batch." },
  ],
  // Week 3 — Intensity
  [
    { oneThing: "Batch-shoot 4 affiliate videos. Stack the queue.", coldCallTarget: 25, studyFocus: "Pick 1 objection frame from Yash + 1 from Andres", affiliateAction: "Batch shoot 4 affiliate videos." },
    { oneThing: "Honest weekly review. What's actually moving the number?", coldCallTarget: 0, studyFocus: "Light study only — 30 min", affiliateAction: "Update plan based on Week 2 data." },
    { oneThing: "Build 1 specific reframe for each top objection.", coldCallTarget: 65, studyFocus: "Re-watch best Andres call — new notes this time", affiliateAction: "Edit + post affiliate video #7." },
    { oneThing: "Email game on. 20 personalized cold emails (not AI spam).", coldCallTarget: 70, emailTarget: 20, studyFocus: "Body language on Zoom — 2 YouTube videos (20 min)", affiliateAction: "Shoot affiliate video #8." },
    { oneThing: "Roleplay objection handling 30 min — Discord partner if possible.", coldCallTarget: 75, emailTarget: 20, studyFocus: "Jeremy Miner — advanced NEPQ questioning (20 min)", affiliateAction: "Edit + post affiliate video #8." },
    { oneThing: "Tonality + pacing. Record yourself reading the script. Kill 1 filler word.", coldCallTarget: 80, studyFocus: "Tonality + pacing audit", affiliateAction: "Shoot affiliate video #9 + edit." },
    { oneThing: "Push every warm prospect for a decision today.", coldCallTarget: 75, studyFocus: "Impact Team top 10 principles — write the 3 you violate most", affiliateAction: "Post affiliate video #9." },
  ],
  // Week 4 — Compound
  [
    { oneThing: "Batch shoot. Refine CRM. Self-care.", coldCallTarget: 25, studyFocus: "Yash One Frame — re-watch, find 1 nuance you missed", affiliateAction: "Batch shoot 4 affiliate videos." },
    { oneThing: "Plan Week 4. Where does the money come from? Where is it going?", coldCallTarget: 0, studyFocus: "Re-read Email Marketing Bible — apply to Instantly sequence", affiliateAction: "Self-care: barber, errands, personal admin." },
    { oneThing: "Document YOUR sales process in writing. What's working, what's not.", coldCallTarget: 85, emailTarget: 25, studyFocus: "Tony Robbins 6 needs — apply to your top 3 prospects", affiliateAction: "Edit + post affiliate video #10." },
    { oneThing: "Quality over volume today. 30 dials, slower, more re-loops.", coldCallTarget: 30, studyFocus: "Identify your weakest sales area — watch 3 videos on it (30 min)", affiliateAction: "Shoot 2 affiliate videos." },
    { oneThing: "Audit Instantly deliverability stats. Don't fly blind.", coldCallTarget: 90, emailTarget: 25, studyFocus: "Jeremy Miner — advanced questioning techniques (20 min)", affiliateAction: "Edit + post 2 affiliate videos." },
    { oneThing: "Reach out to ANY happy person in your network — referrals push (5–10% fee).", coldCallTarget: 95, emailTarget: 30, studyFocus: "Review your best closed deal — what made it work?", affiliateAction: "Shoot 2 affiliate videos." },
    { oneThing: "Owner hours. Push for closes today.", coldCallTarget: 85, studyFocus: "Identity selling — which of Tony Robbins 6 needs are you leveraging?", affiliateAction: "Edit + post 2 affiliate videos." },
  ],
  // Week 5 — Crescendo
  [
    { oneThing: "Batch shoot 5 affiliate videos — you're fast now.", coldCallTarget: 20, studyFocus: "Decision-making frames — when to use each one", affiliateAction: "Batch shoot 5 affiliate videos." },
    { oneThing: "30-day mark. Full retrospective. Biggest win, biggest fail.", coldCallTarget: 0, studyFocus: "Full 30-day review (90 min): metrics + lessons", affiliateAction: "Write Month 2 strategy doc." },
    { oneThing: "Apply Month 1 lessons. Tighten the script with what worked.", coldCallTarget: 80, emailTarget: 25, studyFocus: "Re-read Impact Formula with Month 1 context", affiliateAction: "Shoot affiliate video #11 — new angle for Month 2." },
    { oneThing: "Hire conversation — is it time for an SDR? Audit your pipeline.", coldCallTarget: 75, studyFocus: "Charlie Morgan — outbound systems at scale (30 min)", affiliateAction: "Edit + post affiliate video #11." },
    { oneThing: "Test a new opener. Track set-rate side by side with the old one.", coldCallTarget: 85, emailTarget: 30, studyFocus: "Andy Elliott — tonality + intensity (15 min)", affiliateAction: "Shoot affiliate video #12." },
    { oneThing: "Outbound day. 100 dials cumulative this week minimum.", coldCallTarget: 90, studyFocus: "Cole Gordon — high-ticket closing fundamentals", affiliateAction: "Edit + post affiliate video #12." },
    { oneThing: "Pre-weekend push. Get 3 calls booked for Monday.", coldCallTarget: 80, studyFocus: "Tony Robbins 6 needs — identity selling deeper", affiliateAction: "Outline content for Week 6 batch." },
  ],
  // Week 6 — Push
  [
    { oneThing: "Batch content. Quiet recovery day.", coldCallTarget: 30, studyFocus: "Iman Gadzhi — agency scaling fundamentals", affiliateAction: "Batch shoot 5 affiliate videos." },
    { oneThing: "Week 6 plan. What ONE thing moves the needle this week?", coldCallTarget: 0, studyFocus: "Light study — pick 1 weak area, watch 30 min", affiliateAction: "Plan Week 6 explicitly. Family / personal time." },
    { oneThing: "Mid-cycle reset. Tighten your daily checklist.", coldCallTarget: 80, studyFocus: "Re-read your own notes from Weeks 1–4", affiliateAction: "Edit + post #13." },
    { oneThing: "Two-list day — top 10 hottest, top 10 coldest. Different scripts.", coldCallTarget: 85, emailTarget: 25, studyFocus: "Jeremy Miner — advanced NEPQ situational questioning", affiliateAction: "Shoot affiliate #14." },
    { oneThing: "Recording review. Pull your 3 best moments from this week.", coldCallTarget: 90, emailTarget: 25, studyFocus: "Cole Gordon — handling stalls / 'let me think'", affiliateAction: "Edit + post #14." },
    { oneThing: "Outreach diversification — try 1 new channel (DM / event).", coldCallTarget: 75, studyFocus: "Liam James Kay — paid traffic frameworks (20 min)", affiliateAction: "Shoot affiliate #15." },
    { oneThing: "Jummah owner-call push. Aim for 2 closes today.", coldCallTarget: 90, studyFocus: "Identity selling — close from identity, not features", affiliateAction: "Post #15." },
  ],
  // Week 7 — Mastery
  [
    { oneThing: "Light batch day. Recover for the push.", coldCallTarget: 25, studyFocus: "Jordan Platten — agency SOP frameworks", affiliateAction: "Batch shoot 4 affiliate videos." },
    { oneThing: "Sunday review. Two-week sprint plan to close.", coldCallTarget: 0, studyFocus: "Personal review — am I hitting my standards?", affiliateAction: "Update content calendar for the next 14 days." },
    { oneThing: "Hard week start. Best week so far — beat it on dials.", coldCallTarget: 95, emailTarget: 30, studyFocus: "Andres advanced framing — beach analogy refresh", affiliateAction: "Edit + post #16." },
    { oneThing: "Discipline check — am I executing the daily checklist 100%?", coldCallTarget: 100, emailTarget: 30, studyFocus: "Re-watch your best closed deal recording", affiliateAction: "Shoot affiliate #17." },
    { oneThing: "Roleplay 30 min — Discord partner. Record + review.", coldCallTarget: 95, studyFocus: "Jeremy Miner — handling 'I need to think about it'", affiliateAction: "Edit + post #17." },
    { oneThing: "Pull all warm prospects. Schedule decision calls.", coldCallTarget: 85, emailTarget: 25, studyFocus: "Tony Robbins — closing from certainty", affiliateAction: "Shoot affiliate #18." },
    { oneThing: "Push for the close. Don't let anyone leave undecided.", coldCallTarget: 100, studyFocus: "Identity selling — final pass before close", affiliateAction: "Post #18." },
  ],
  // Week 8 — Close
  [
    { oneThing: "Content batch. Mental reset.", coldCallTarget: 30, studyFocus: "Yash — frame stacking advanced", affiliateAction: "Batch shoot 5 affiliate videos." },
    { oneThing: "55-day review. Plan the final week.", coldCallTarget: 0, studyFocus: "Read Month 1 retro again — what did you fix? What's left?", affiliateAction: "Final week content plan." },
    { oneThing: "Last 7-day sprint. Make this week unforgettable.", coldCallTarget: 100, emailTarget: 30, studyFocus: "Andres — best video from the portal, full attention", affiliateAction: "Edit + post #19." },
    { oneThing: "Aim for a personal best — most dials in a single day.", coldCallTarget: 120, studyFocus: "Cole Gordon — closing fundamentals refresher", affiliateAction: "Shoot affiliate #20." },
    { oneThing: "Mid-week close push. Every warm prospect gets a call today.", coldCallTarget: 100, emailTarget: 30, studyFocus: "Jeremy Miner — advanced NEPQ deep dive", affiliateAction: "Edit + post #20." },
    { oneThing: "Sales math day. Calculate your cost per appointment.", coldCallTarget: 90, studyFocus: "Iman Gadzhi — pricing + retention", affiliateAction: "Shoot affiliate #21." },
    { oneThing: "Big close day. Owner hours from 9 AM.", coldCallTarget: 100, studyFocus: "Identity selling — the close from identity", affiliateAction: "Post #21." },
  ],
  // Week 9 — Final 2 days only
  [
    { oneThing: "Last batch. Final affiliate push.", coldCallTarget: 30, studyFocus: "Hormozi — leads volume principles", affiliateAction: "Batch shoot final 4 affiliate videos." },
    { oneThing: "60-day mark. Full retrospective + Month 3 plan.", coldCallTarget: 0, studyFocus: "Full 60-day review (2 hrs): metrics, lessons, what's next", affiliateAction: "Write Month 3 plan. Post a final affiliate video." },
  ],
];

function packForDay(dayNumber: number): DayPack {
  const weekIdx = Math.floor((dayNumber - 1) / 7);
  const dayInWeek = (dayNumber - 1) % 7;
  const week = WEEK_PATTERNS[weekIdx] ?? WEEK_PATTERNS[WEEK_PATTERNS.length - 1];
  return week[dayInWeek] ?? {};
}

/**
 * Day 1 of the cycle, in Pacific time. Anchored to noon UTC so DST + the
 * server's UTC clock never bump the calendar over by one day.
 */
const START_KEY = "2026-05-25";
const DAY_MS = 24 * 3600 * 1000;
const START_TS = new Date(`${START_KEY}T12:00:00Z`).getTime();

function makeDay(dayNumber: number): DayPlan {
  const d = new Date(START_TS + (dayNumber - 1) * DAY_MS);
  const weekday = jsDayToShort(
    new Date(
      d.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    ).getDay()
  );
  const dateStr = dateKey(d);
  const fullDate = d.toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const pack = packForDay(dayNumber);
  const weekNumber = Math.ceil(dayNumber / 7);
  return {
    dayNumber,
    date: dateStr,
    weekday,
    fullDate,
    weekNumber,
    isWeeklyReview: weekday === "Sun",
    isJummah: weekday === "Fri",
    isLightDay: weekday === "Sat" || weekday === "Sun",
    ...pack,
  };
}

export const thirtyDayPlan: DayPlan[] = Array.from({ length: 60 }, (_, i) =>
  makeDay(i + 1)
);

// Helpful alias for code that wants the explicit name.
export const sixtyDayPlan = thirtyDayPlan;

// ─── Helpers ────────────────────────────────────────────────

export function getTodayPlan(now: Date = new Date()): DayPlan | null {
  const iso = dateKey(now);
  return thirtyDayPlan.find((d) => d.date === iso) ?? null;
}

export function getDayByNumber(n: number): DayPlan | null {
  return thirtyDayPlan.find((d) => d.dayNumber === n) ?? null;
}

export const CYCLE_LENGTH = 60;
export const CYCLE_RANGE = "May 25 → July 23";

export const NON_NEGOTIABLES = [
  "You don't skip Fajr. 4:00 AM wake, 4:18 adhan. That's the floor.",
  "Four call sprints a day. 100+ dials minimum on weekdays. No skipping the 4th.",
  "You make dua before every sprint. Niyyah straight, then dial.",
  "Phone in another room from 9 PM. No scroll. 6 hours of real sleep.",
  "Build one automation a week. AI agents > more grinding. Compound the leverage.",
  "Post content every single day. Even a bad video beats no video.",
  "You film, you edit, you post. Same day.",
  "Money is a tool to serve people. Not your worth. Not your iman.",
  "You don't quit on Day 14 because Day 13 sucked. Standards beat motivation.",
  "$20k/month is the bar. 158 lb lean is the bar. Both. By July 23.",
];
