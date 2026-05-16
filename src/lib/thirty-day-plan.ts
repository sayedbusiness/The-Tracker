/**
 * APEX OS — Sayed's 30-Day Operating System (Cycle 1)
 *
 *   Day 1 = Saturday May 16, 2026
 *   Day 30 = Sunday June 14, 2026
 *
 * Cycle structure:
 *   - Each day combines: standard template (prayers, Quran, skincare,
 *     content, gym) + a "day pack" (cold-call count, study, affiliate).
 *   - Weekends (Sat/Sun): lighter call volume; Sunday is the weekly
 *     review block.
 *   - Mon–Thu: ramping call intensity.
 *   - Friday: Jummah replaces Dhuhr; owner hours before 11 AM.
 *
 * Every block has a stable id so completion state persists across
 * devices once Vercel KV is enabled (see /api/state).
 */

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
  | "review";

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
}

export interface DayPlan {
  dayNumber: number; // 1..30
  date: string; // "2026-05-16"
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  fullDate: string; // "Saturday, May 16"
  weekNumber: 1 | 2 | 3 | 4 | 5;
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
  return blocks.sort((a, b) => a.time.localeCompare(b.time));
}

// ─────────────────────────────────────────────────────────────
// 30-DAY OVERRIDES — Day 1 = Sat May 16 → Day 30 = Sun Jun 14
// ─────────────────────────────────────────────────────────────

const WEEK_OF: Record<number, 1 | 2 | 3 | 4 | 5> = {};
for (let i = 1; i <= 30; i++) {
  WEEK_OF[i] = Math.ceil(i / 7) as 1 | 2 | 3 | 4 | 5;
}

const ALL_DAYS: Array<Omit<DayPlan, "weekNumber">> = [
  // ─── WEEK 1 — Foundation ───────────────────────────────
  {
    dayNumber: 1, date: "2026-05-16", weekday: "Sat", fullDate: "Saturday, May 16",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Day 1. Set up the system. Lay out the next 30 days clean.",
    coldCallTarget: 30,
    studyFocus: "Andres free portal intro — intent + logical certainty",
    affiliateAction: "Scroll TikTok 30 min — save 10 viral hooks. Outline affiliate video #1.",
  },
  {
    dayNumber: 2, date: "2026-05-17", weekday: "Sun", fullDate: "Sunday, May 17",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Plan Week 1. Define your three non-negotiables.",
    coldCallTarget: 0,
    studyFocus: "Email Marketing Bible OR Beautiful Prose — 30 min light",
    affiliateAction: "Storyboard affiliate videos #1 and #2. Family / personal time.",
  },
  {
    dayNumber: 3, date: "2026-05-18", weekday: "Mon", fullDate: "Monday, May 18",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Lock in the system. Make Day 1 of the dialing week unmissable.",
    coldCallTarget: 50,
    studyFocus: "Matt Ryder NEPQ intro video (20 min) + 1 Yash call recording",
    affiliateAction: "Shoot affiliate video #1 — hook + transformation. Edit + queue.",
  },
  {
    dayNumber: 4, date: "2026-05-19", weekday: "Tue", fullDate: "Tuesday, May 19",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Build the muscle. 100 dials, no excuses.",
    coldCallTarget: 100,
    studyFocus: "Jeremy Miner 7th Level — 1 video (20 min)",
    affiliateAction: "Post affiliate video #1 (burner accounts). Outline #2.",
  },
  {
    dayNumber: 5, date: "2026-05-20", weekday: "Wed", fullDate: "Wednesday, May 20",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Refine the script. Listen back to your own voice.",
    coldCallTarget: 110,
    studyFocus: "Andres Conteras free portal — intent calibration drill",
    affiliateAction: "Shoot + edit affiliate video #2.",
  },
  {
    dayNumber: 6, date: "2026-05-21", weekday: "Thu", fullDate: "Thursday, May 21",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Pull your own call recording. Find 5 mistakes.",
    coldCallTarget: 60,
    studyFocus: "Review your best Andres call from training — new notes",
    affiliateAction: "Post affiliate video #2.",
  },
  {
    dayNumber: 7, date: "2026-05-22", weekday: "Fri", fullDate: "Friday, May 22",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Owner hours. Call decision-makers before 11 AM.",
    coldCallTarget: 150,
    studyFocus: "Impact Team objection handling — re-watch with notes",
    affiliateAction: "Outline affiliate videos #3 + #4.",
  },

  // ─── WEEK 2 — Volume ──────────────────────────────────
  {
    dayNumber: 8, date: "2026-05-23", weekday: "Sat", fullDate: "Saturday, May 23",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch shoot. Stack content inventory.",
    coldCallTarget: 40,
    studyFocus: "Yash 6 human needs framework — write which need your ICP hits",
    affiliateAction: "Batch shoot affiliate videos #3 + #4.",
  },
  {
    dayNumber: 9, date: "2026-05-24", weekday: "Sun", fullDate: "Sunday, May 24",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Weekly review. What's working? What's not?",
    coldCallTarget: 0,
    studyFocus: "Light reading — 30 min, no pressure",
    affiliateAction: "Plan Week 2. Family / personal time.",
  },
  {
    dayNumber: 10, date: "2026-05-25", weekday: "Mon", fullDate: "Monday, May 25",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "GHL trial check + follow up every warm prospect from Week 1.",
    coldCallTarget: 65,
    studyFocus: "Re-read Impact Formula full doc",
    affiliateAction: "Edit + post affiliate video #3.",
  },
  {
    dayNumber: 11, date: "2026-05-26", weekday: "Tue", fullDate: "Tuesday, May 26",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "200 dials cumulative for the week. Track set rate honestly.",
    coldCallTarget: 70,
    studyFocus: "Alex Hormozi 100M Offers — review your offer ladder",
    affiliateAction: "Shoot affiliate video #5 — new hook angle.",
  },
  {
    dayNumber: 12, date: "2026-05-27", weekday: "Wed", fullDate: "Wednesday, May 27",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Rev-share 'what's riskier' frame — roleplay 10x before any closing call.",
    coldCallTarget: 75,
    studyFocus: "Andres frame stack (beach/weather analogy, 9–5 vs entrepreneur)",
    affiliateAction: "Edit + post affiliate video #4. Shoot #6.",
  },
  {
    dayNumber: 13, date: "2026-05-28", weekday: "Thu", fullDate: "Thursday, May 28",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Pull a call recording. Find 5 mistakes. Adjust script.",
    coldCallTarget: 60,
    emailTarget: 5,
    studyFocus: "Review your best Andres call — new notes",
    affiliateAction: "Edit + post #6.",
  },
  {
    dayNumber: 14, date: "2026-05-29", weekday: "Fri", fullDate: "Friday, May 29",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Owners before 11 AM. Pipeline review — push every warm prospect.",
    coldCallTarget: 65,
    studyFocus: "Compare Jeremy Miner NEPQ + Matt Ryder to Impact Formula — write differences",
    affiliateAction: "Outline videos #7–10 for Week 3 batch.",
  },

  // ─── WEEK 3 — Intensity ────────────────────────────────
  {
    dayNumber: 15, date: "2026-05-30", weekday: "Sat", fullDate: "Saturday, May 30",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch-shoot 4 affiliate videos. Stack the queue.",
    coldCallTarget: 25,
    studyFocus: "Pick 1 objection frame from Yash + 1 from Andres — when you'd use each",
    affiliateAction: "Batch shoot 4 affiliate videos.",
  },
  {
    dayNumber: 16, date: "2026-05-31", weekday: "Sun", fullDate: "Sunday, May 31",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Honest weekly review. What's actually moving the number?",
    coldCallTarget: 0,
    studyFocus: "Light study only — 30 min, no pressure",
    affiliateAction: "Update plan based on Week 2 data.",
  },
  {
    dayNumber: 17, date: "2026-06-01", weekday: "Mon", fullDate: "Monday, June 1",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Build 1 specific reframe for each top objection.",
    coldCallTarget: 65,
    studyFocus: "Re-watch best Andres call — new notes this time",
    affiliateAction: "Edit + post affiliate video #7.",
  },
  {
    dayNumber: 18, date: "2026-06-02", weekday: "Tue", fullDate: "Tuesday, June 2",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Email game on. 20 personalized cold emails (not AI spam).",
    coldCallTarget: 70,
    emailTarget: 20,
    studyFocus: "Body language on Zoom — 2 YouTube videos (20 min)",
    affiliateAction: "Shoot affiliate video #8.",
  },
  {
    dayNumber: 19, date: "2026-06-03", weekday: "Wed", fullDate: "Wednesday, June 3",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Roleplay objection handling 30 min — Discord partner if possible.",
    coldCallTarget: 75,
    emailTarget: 20,
    studyFocus: "Jeremy Miner — advanced NEPQ questioning (20 min)",
    affiliateAction: "Edit + post affiliate video #8.",
  },
  {
    dayNumber: 20, date: "2026-06-04", weekday: "Thu", fullDate: "Thursday, June 4",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Tonality + pacing — record yourself reading the script. Kill 1 filler word.",
    coldCallTarget: 80,
    studyFocus: "Tonality + pacing audit",
    affiliateAction: "Shoot affiliate video #9 + edit.",
  },
  {
    dayNumber: 21, date: "2026-06-05", weekday: "Fri", fullDate: "Friday, June 5",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Push every warm prospect for a decision today.",
    coldCallTarget: 75,
    studyFocus: "Impact Team top 10 principles — write the 3 you violate most",
    affiliateAction: "Post affiliate video #9.",
  },

  // ─── WEEK 4 — Compound ─────────────────────────────────
  {
    dayNumber: 22, date: "2026-06-06", weekday: "Sat", fullDate: "Saturday, June 6",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch shoot. Refine CRM. Self-care.",
    coldCallTarget: 25,
    studyFocus: "Yash One Frame — re-watch, find 1 nuance you missed",
    affiliateAction: "Batch shoot 4 affiliate videos.",
  },
  {
    dayNumber: 23, date: "2026-06-07", weekday: "Sun", fullDate: "Sunday, June 7",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Plan Week 4. Where does the money come from? Where is it going?",
    coldCallTarget: 0,
    studyFocus: "Re-read Email Marketing Bible — apply to Instantly sequence",
    affiliateAction: "Self-care: barber, errands, personal admin.",
  },
  {
    dayNumber: 24, date: "2026-06-08", weekday: "Mon", fullDate: "Monday, June 8",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Document YOUR sales process in writing. What's working, what's not.",
    coldCallTarget: 85,
    emailTarget: 25,
    studyFocus: "Tony Robbins 6 needs — apply to your top 3 prospects",
    affiliateAction: "Edit + post affiliate video #10.",
  },
  {
    dayNumber: 25, date: "2026-06-09", weekday: "Tue", fullDate: "Tuesday, June 9",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Quality over volume today. 30 dials, slower, more re-loops.",
    coldCallTarget: 30,
    studyFocus: "Identify your weakest sales area — watch 3 videos on it (30 min)",
    affiliateAction: "Shoot 2 affiliate videos.",
  },
  {
    dayNumber: 26, date: "2026-06-10", weekday: "Wed", fullDate: "Wednesday, June 10",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Audit Instantly deliverability stats. Don't fly blind.",
    coldCallTarget: 90,
    emailTarget: 25,
    studyFocus: "Jeremy Miner — advanced questioning techniques (20 min)",
    affiliateAction: "Edit + post 2 affiliate videos.",
  },
  {
    dayNumber: 27, date: "2026-06-11", weekday: "Thu", fullDate: "Thursday, June 11",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Reach out to ANY happy person in your network — referrals push (5–10% fee).",
    coldCallTarget: 95,
    emailTarget: 30,
    studyFocus: "Review your best closed deal — what made it work? Write a breakdown.",
    affiliateAction: "Shoot 2 affiliate videos.",
  },
  {
    dayNumber: 28, date: "2026-06-12", weekday: "Fri", fullDate: "Friday, June 12",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Owner hours. Push for closes today.",
    coldCallTarget: 85,
    studyFocus: "Identity selling — which of Tony Robbins 6 needs are you leveraging on calls?",
    affiliateAction: "Edit + post 2 affiliate videos.",
  },

  // ─── WEEK 5 — Crescendo ────────────────────────────────
  {
    dayNumber: 29, date: "2026-06-13", weekday: "Sat", fullDate: "Saturday, June 13",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch shoot 5 affiliate videos — you're fast now. Move fast.",
    coldCallTarget: 20,
    studyFocus: "Decision-making frames — when to use each one",
    affiliateAction: "Batch shoot 5 affiliate videos.",
  },
  {
    dayNumber: 30, date: "2026-06-14", weekday: "Sun", fullDate: "Sunday, June 14",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Final day. 30-day review. Biggest win, biggest fail, what habit changed you most. Plan Month 2.",
    coldCallTarget: 0,
    studyFocus: "Full 30-day review (2 hours): metrics + lessons.",
    affiliateAction: "Post a final affiliate video. Write Month 2 plan.",
  },
];

export const thirtyDayPlan: DayPlan[] = ALL_DAYS.map((d) => ({
  ...d,
  weekNumber: WEEK_OF[d.dayNumber],
}));

// ─── Helpers ────────────────────────────────────────────────

export function getTodayPlan(now: Date = new Date()): DayPlan | null {
  const iso = now.toISOString().slice(0, 10);
  return thirtyDayPlan.find((d) => d.date === iso) ?? null;
}

export function getDayByNumber(n: number): DayPlan | null {
  return thirtyDayPlan.find((d) => d.dayNumber === n) ?? null;
}

export const CYCLE_RANGE = "May 16 → June 14";

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
