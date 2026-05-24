/**
 * APEX OS — Sayed's 60-Day Operating System (Cycle 1)
 *
 *   Day 1 = Saturday May 16, 2026
 *   Day 60 = Tuesday July 14, 2026
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
  | "school"
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
  schoolDayOnly?: boolean;
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
  fullDate: string; // "Saturday, May 16"
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
    time: "04:43",
    durationMin: 5,
    label: "Wake up",
    detail: "Phone face-down. No scrolling. Hands → bathroom → brush teeth.",
    kind: "spiritual",
  },
  {
    id: "wudu-fajr",
    time: "04:48",
    durationMin: 25,
    label: "Wudu + Pray Fajr",
    detail: "Sunnah → fard → tasbih 5 min. Iqamah 5:15am.",
    kind: "spiritual",
    prayer: "fajr",
  },
  {
    id: "quran-am",
    time: "05:13",
    durationMin: 12,
    label: "Quran — 2 pages",
    detail: "Slow, intentional. Reflect on what you read.",
    kind: "spiritual",
  },
  {
    id: "win-journal",
    time: "05:25",
    durationMin: 5,
    label: "Write the ONE thing that makes today a win",
    detail: "One sentence. Pen to paper. Make it specific.",
    kind: "reflection",
  },
  {
    id: "skincare-am",
    time: "05:30",
    durationMin: 30,
    label: "AM skincare routine",
    detail: "CeraVe SA cleanser → niacinamide/azelaic → BASED moisturizer → SPF.",
    kind: "skincare",
  },
  {
    id: "script-write",
    time: "06:00",
    durationMin: 20,
    label: "Script write — 10× pen + paper",
    detail: "Impact Formula generic script, written by hand. Daily reps.",
    kind: "study",
  },
  {
    id: "dress-pack",
    time: "06:20",
    durationMin: 15,
    label: "Get dressed + pack bag",
    detail: "Laptop, charger, headphones, notebook, pen, water bottle.",
    kind: "personal",
  },
  {
    id: "breakfast",
    time: "06:35",
    durationMin: 25,
    label: "Breakfast",
    detail: "Protein-heavy. Lift toward 200g daily protein target.",
    kind: "meal",
  },
];

const schoolBlocks: Block[] = [
  {
    id: "school-commute",
    time: "07:30",
    durationMin: 30,
    label: "Commute to school",
    detail: "Voice notes or NEPQ podcast. Niyyah for the day.",
    kind: "commute",
    schoolDayOnly: true,
  },
  {
    id: "school",
    time: "08:00",
    durationMin: 6 * 60 + 50,
    label: "School",
    detail: "8:00 AM – 2:50 PM. Stay engaged. Use breaks for Quran review or script reps.",
    kind: "school",
    schoolDayOnly: true,
  },
  {
    id: "school-lunch",
    time: "11:30",
    durationMin: 30,
    label: "Lunch at school",
    detail: "Photo log via the Health tab. Hit at least 40g protein.",
    kind: "meal",
    schoolDayOnly: true,
  },
  {
    id: "walk-home",
    time: "14:50",
    durationMin: 20,
    label: "Walk home",
    detail: "Decompress. No headphones — let the brain breathe.",
    kind: "commute",
    schoolDayOnly: true,
  },
];

const starbucksBlocks: Block[] = [
  {
    id: "walk-starbucks",
    time: "07:30",
    durationMin: 30,
    label: "Walk to Starbucks",
    detail: "30-min walk. NEPQ podcast or silence.",
    kind: "commute",
    starbucksOnly: true,
  },
  {
    id: "starbucks-block",
    time: "08:00",
    durationMin: 6 * 60 + 30,
    label: "Starbucks deep-work block",
    detail:
      "8:00 AM – 2:30 PM. Order drink, settle, open today's checklist. Script reps, study, cold call prep, content scripting.",
    kind: "starbucks",
    starbucksOnly: true,
  },
  {
    id: "walk-from-starbucks",
    time: "14:30",
    durationMin: 30,
    label: "Walk home from Starbucks",
    detail: "Decompress. Voice notes for content ideas.",
    kind: "commute",
    starbucksOnly: true,
  },
];

const afternoonBlocks: Block[] = [
  {
    id: "snack-reset",
    time: "15:10",
    durationMin: 15,
    label: "Snack + reset",
    detail: "Protein snack. Stretch. Get ready for the call sprint.",
    kind: "meal",
  },
  {
    id: "cold-calls",
    time: "15:25",
    durationMin: 75,
    label: "Cold call sprint",
    detail:
      "Sacramento contractors — auto detailing, ceramic coating, roofers. Track every call: pickup yes/no · response · set yes/no.",
    kind: "agency",
  },
  {
    id: "calls-notes",
    time: "16:40",
    durationMin: 12,
    label: "Pipeline notes + tracker update",
    detail: "Write down what worked. Update the CRM.",
    kind: "agency",
  },
  {
    id: "asr",
    time: "16:52",
    durationMin: 10,
    label: "Pray Asr",
    detail: "Iqamah 5:15pm.",
    kind: "spiritual",
    prayer: "asr",
  },
  {
    id: "content-idea",
    time: "17:02",
    durationMin: 15,
    label: "Today's content idea — agency + main account",
    detail:
      "Agency: value/results/teach. Main: motivational/entrepreneur. Outline before filming.",
    kind: "content",
  },
  {
    id: "film-content",
    time: "17:17",
    durationMin: 60,
    label: "Film: 1 agency video + 2–5 main account videos",
    detail: "Batch session. Same outfit, multiple takes, different angles.",
    kind: "content",
  },
  {
    id: "edit-agency",
    time: "18:17",
    durationMin: 30,
    label: "Edit + post agency video",
    detail:
      "Captions, hook in first 0.5 sec, on-beat. Post to TikTok, Instagram, Facebook, LinkedIn.",
    kind: "content",
  },
  {
    id: "gym-prep",
    time: "18:47",
    durationMin: 13,
    label: "Get ready for gym",
    detail: "Shaker + pre-workout. Confirm with gym bro.",
    kind: "personal",
  },
];

const eveningBlocks: Block[] = [
  {
    id: "gym",
    time: "19:00",
    durationMin: 60,
    label: "Gym session",
    detail: "Lift hard. Compound first. Track your top set.",
    kind: "gym",
  },
  {
    id: "maghrib-gym",
    time: "20:01",
    durationMin: 7,
    label: "Pray Maghrib (at gym)",
    detail: "Do not delay — narrow window. Pray before leaving the gym.",
    kind: "spiritual",
    prayer: "maghrib",
  },
  {
    id: "walk-from-gym",
    time: "20:08",
    durationMin: 17,
    label: "Walk home from gym",
    detail: "Cool down walk.",
    kind: "commute",
  },
  {
    id: "shower-pm-skin",
    time: "20:25",
    durationMin: 25,
    label: "Shower + PM skincare",
    detail: "Cleanser → Differin or niacinamide → moisturizer.",
    kind: "skincare",
  },
  {
    id: "dinner",
    time: "20:50",
    durationMin: 25,
    label: "Dinner",
    detail: "Hit remaining protein for the day. Aim for 200g total.",
    kind: "meal",
  },
  {
    id: "quran-pm",
    time: "21:15",
    durationMin: 8,
    label: "Quran — 2 pages",
    detail: "Evening reading. Quiet, no distractions.",
    kind: "spiritual",
  },
  {
    id: "isha",
    time: "21:23",
    durationMin: 12,
    label: "Pray Isha",
    detail: "Sunnah + fard + witr. Iqamah 9:45pm.",
    kind: "spiritual",
    prayer: "isha",
  },
  {
    id: "edit-main",
    time: "21:35",
    durationMin: 20,
    label: "Edit + post main account videos",
    detail: "Quick cuts. Caption. Post to TikTok + Instagram.",
    kind: "content",
  },
  {
    id: "tracker-reflect",
    time: "21:55",
    durationMin: 5,
    label: "Update tracker + 5-min reflection",
    detail: "Calls · sets · content posted · money collected. What worked? What sucked?",
    kind: "reflection",
  },
  {
    id: "lay-out-clothes",
    time: "22:00",
    durationMin: 0,
    label: "Lay out clothes + Fajr alarm + bed",
    detail: "Phone face-down. Make dua. Sleep.",
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
    blocks.push(...schoolBlocks);
  } else {
    blocks.push({
      id: "weekend-home-work",
      time: "07:30",
      durationMin: 6 * 60 + 30,
      label: "Home work session",
      detail:
        "Long-form deep work — affiliate planning, study, content batch, cold call prep, journaling.",
      kind: "deep-work",
      weekendOnly: true,
    });
  }

  const afternoon = afternoonBlocks.map((b) => {
    if (b.id !== "cold-calls") return b;
    if (plan && plan.coldCallTarget === 0) {
      return {
        ...b,
        label: "Rest from dialing today",
        detail: plan.isWeeklyReview
          ? "No cold calls — weekly review + personal/family time. Show up for the people who got you here."
          : "No cold calls today — recovery, batch planning, study.",
        kind: "personal" as const,
        durationMin: 30,
      };
    }
    if (plan && typeof plan.coldCallTarget === "number") {
      return {
        ...b,
        label: `Cold call sprint — ${plan.coldCallTarget} dials`,
        detail: `${b.detail} Target: ${plan.coldCallTarget} dials. Make dua before dialing.`,
      };
    }
    return b;
  });
  blocks.push(...afternoon);

  blocks.push({
    id: "dhuhr",
    time: "13:03",
    durationMin: 12,
    label: "Pray Dhuhr",
    detail: "Iqamah 1:30pm. Slip away during break/lunch.",
    kind: "spiritual",
    prayer: "dhuhr",
  });

  if (plan?.studyFocus) {
    blocks.push({
      id: "day-study",
      time: "18:50",
      durationMin: 25,
      label: "Today's study focus",
      detail: plan.studyFocus,
      kind: "study",
    });
  }
  if (plan?.affiliateAction) {
    blocks.push({
      id: "day-affiliate",
      time: "16:30",
      durationMin: 30,
      label: "Affiliate action",
      detail: plan.affiliateAction,
      kind: "affiliate",
    });
  }
  if (plan?.emailTarget && plan.emailTarget > 0) {
    blocks.push({
      id: "day-emails",
      time: "16:15",
      durationMin: 25,
      label: `Send ${plan.emailTarget} cold emails`,
      detail: "Personalized via Instantly. Not AI spam. Track sends.",
      kind: "agency",
    });
  }

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
  return blocks.map((b) => ({ ...b, source: b.source ?? "base" })).sort((a, b) => a.time.localeCompare(b.time));
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
// 60-DAY OVERRIDES — Day 1 = Sat May 16 → Day 60 = Tue Jul 14
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

const START = new Date(2026, 4, 16); // May = 4 (zero-indexed)

function makeDay(dayNumber: number): DayPlan {
  const d = new Date(START);
  d.setDate(d.getDate() + (dayNumber - 1));
  const weekday = jsDayToShort(d.getDay());
  const dateStr = dateKey(d);
  const fullDate = d.toLocaleDateString("en-US", {
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
export const CYCLE_RANGE = "May 16 → July 14";

export const NON_NEGOTIABLES = [
  "You don't skip Fajr. That's the floor.",
  "You write your script every day. Even Sundays. 10 min, pen + paper.",
  "You make dua before every cold call sprint. Niyyah straight, then dial.",
  "You don't compare your Day 5 to someone else's Year 5.",
  "You don't quit on Day 14 because Day 13 sucked. Standards beat motivation.",
  "Money is a tool to serve people. Not your worth. Not your iman.",
  "Post content every single day. Even a bad video beats no video.",
  "You film, you edit, you post. Same day.",
];
