/**
 * APEX OS — Sayed's 30-Day Operating System (Cycle 1)
 *
 * Built from your Notion plan, restructured for the new start date and
 * your real schedule (school 8am–2:50pm, gym 7–8pm, bed 10pm).
 *
 *   Day 1 = Monday May 11, 2026
 *   Day 30 = Tuesday June 9, 2026
 *
 * Each day combines:
 *   - The standard daily template (prayers, Quran, skincare, content, gym)
 *   - A "day pack" of variable items: cold-call count, study topic,
 *     affiliate video number, weekly review, etc.
 *   - A Starbucks alternate path that swaps the school/home block for a
 *     deep-work session at Starbucks.
 *
 * Every block has a stable id so completion state can persist later
 * (currently held in client-side state for the demo).
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
  starbucksOnly?: boolean; // only show when Starbucks toggle is on
  schoolDayOnly?: boolean; // only on weekdays with school
  weekendOnly?: boolean;
  prayer?: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "jummah";
}

export interface DayPlan {
  dayNumber: number; // 1..30
  date: string; // "2026-05-11"
  weekday: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  fullDate: string; // "Monday, May 11"
  weekNumber: 1 | 2 | 3 | 4 | 5;
  isWeeklyReview: boolean;
  isJummah: boolean;
  isLightDay: boolean;
  oneThing?: string; // the day's hero focus
  coldCallTarget?: number;
  emailTarget?: number;
  studyFocus?: string;
  affiliateAction?: string;
  customBlocks?: Block[];
}

// ─────────────────────────────────────────────────────────────
// STANDARD DAILY TEMPLATE — applies to every day
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
    detail: "Protein-heavy. ~40g protein for the morning lift toward 180g target.",
    kind: "meal",
  },
];

// School path (default)
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

// Starbucks alternate path
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
    detail: "Write down what worked. Update Notion CRM.",
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
    detail: "Hit remaining protein for the day. Aim for 180g total.",
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

export function buildDayBlocks(starbucks: boolean, weekday: string): Block[] {
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const blocks: Block[] = [...morningBlocks];

  if (starbucks) {
    blocks.push(...starbucksBlocks);
  } else if (!isWeekend) {
    blocks.push(...schoolBlocks);
  } else {
    // Weekend, no Starbucks — replace school/Starbucks with home work session
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

  blocks.push(...afternoonBlocks);

  // Dhuhr is during school/Starbucks block — surface it as its own row
  blocks.splice(
    blocks.length - afternoonBlocks.length,
    0,
    {
      id: "dhuhr",
      time: "13:03",
      durationMin: 12,
      label: "Pray Dhuhr",
      detail: "Iqamah 1:30pm. Slip away during break/lunch.",
      kind: "spiritual",
      prayer: "dhuhr",
    }
  );

  blocks.push(...eveningBlocks);
  return blocks.sort((a, b) => a.time.localeCompare(b.time));
}

// ─────────────────────────────────────────────────────────────
// 30-DAY OVERRIDES
// Cold-call ramp follows your Notion plan, mapped to new dates
// ─────────────────────────────────────────────────────────────

const WEEK_OF: Record<number, 1 | 2 | 3 | 4 | 5> = {};
for (let i = 1; i <= 30; i++) {
  WEEK_OF[i] = (Math.ceil(i / 7) as 1 | 2 | 3 | 4 | 5);
}

const ALL_DAYS: Array<Omit<DayPlan, "weekNumber">> = [
  // ─── WEEK 1 — Foundation ───────────────────────
  {
    dayNumber: 1, date: "2026-05-11", weekday: "Mon", fullDate: "Monday, May 11",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Lock in the system. Make Day 1 unmissable.",
    coldCallTarget: 50,
    studyFocus: "Andres free portal — intent + logical certainty",
    affiliateAction: "Research: scroll TikTok 30 min, save 10 viral hooks. Outline affiliate video #1.",
  },
  {
    dayNumber: 2, date: "2026-05-12", weekday: "Tue", fullDate: "Tuesday, May 12",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Build the muscle. 100 dials, no excuses.",
    coldCallTarget: 100,
    studyFocus: "Matt Ryder NEPQ intro video (20 min) + 1 Yash call recording",
    affiliateAction: "Shoot affiliate video #1 — hook + transformation. Edit + queue for tomorrow.",
  },
  {
    dayNumber: 3, date: "2026-05-13", weekday: "Wed", fullDate: "Wednesday, May 13",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Refine the script. Listen back to your own voice.",
    coldCallTarget: 110,
    studyFocus: "Jeremy Miner 7th Level — 1 video (20 min)",
    affiliateAction: "Post affiliate video #1 (burner accounts). Outline affiliate video #2.",
  },
  {
    dayNumber: 4, date: "2026-05-14", weekday: "Thu", fullDate: "Thursday, May 14",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Pull your own call recording. Find 5 mistakes.",
    coldCallTarget: 60,
    studyFocus: "Review your best Andres call from training",
    affiliateAction: "Shoot + edit affiliate video #2.",
  },
  {
    dayNumber: 5, date: "2026-05-15", weekday: "Fri", fullDate: "Friday, May 15",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Owner hours. Call decision-makers before 11 AM.",
    coldCallTarget: 150,
    studyFocus: "Impact Team objection handling — re-watch with notes",
    affiliateAction: "Post affiliate video #2.",
  },
  {
    dayNumber: 6, date: "2026-05-16", weekday: "Sat", fullDate: "Saturday, May 16",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch shoot. Stack inventory.",
    coldCallTarget: 40,
    studyFocus: "Yash 6 human needs framework — write which need your ICP hits",
    affiliateAction: "Outline affiliate videos #3 + #4. Start DNS authentication for contact.apexgrowthcorp.com.",
  },
  {
    dayNumber: 7, date: "2026-05-17", weekday: "Sun", fullDate: "Sunday, May 17",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Weekly review. What's working? What's not?",
    coldCallTarget: 0,
    studyFocus: "Light reading — Email Marketing Bible OR Beautiful Prose, 30 min",
    affiliateAction: "Plan Week 2. Family / personal time.",
  },

  // ─── WEEK 2 — Volume ───────────────────────────
  {
    dayNumber: 8, date: "2026-05-18", weekday: "Mon", fullDate: "Monday, May 18",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "GHL trial check + follow up every warm prospect from Week 1.",
    coldCallTarget: 65,
    studyFocus: "Re-read Impact Formula full doc",
    affiliateAction: "Shoot + edit + post affiliate video #3.",
  },
  {
    dayNumber: 9, date: "2026-05-19", weekday: "Tue", fullDate: "Tuesday, May 19",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "200 dials. Track set rate honestly.",
    coldCallTarget: 70,
    studyFocus: "Impact Team — emotional certainty bottom half",
    affiliateAction: "Shoot affiliate video #4 — new hook angle.",
  },
  {
    dayNumber: 10, date: "2026-05-20", weekday: "Wed", fullDate: "Wednesday, May 20",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Rev-share 'what's riskier' frame — roleplay 10x before any closing call.",
    coldCallTarget: 75,
    studyFocus: "Andres frame stack (beach/weather analogy, 9–5 vs entrepreneur)",
    affiliateAction: "Shoot + edit + post affiliate video #5. Edit + post #4.",
  },
  {
    dayNumber: 11, date: "2026-05-21", weekday: "Thu", fullDate: "Thursday, May 21",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Pull a call recording. Find 5 mistakes. Adjust script.",
    coldCallTarget: 60,
    emailTarget: 5,
    studyFocus: "Review your best Andres call — new notes",
    affiliateAction: "Shoot + edit affiliate video #6.",
  },
  {
    dayNumber: 12, date: "2026-05-22", weekday: "Fri", fullDate: "Friday, May 22",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Owners before 11 AM. Pipeline review — push every warm prospect.",
    coldCallTarget: 65,
    studyFocus: "Compare 7th Level + NEPQ to Impact Formula — write differences",
    affiliateAction: "Post affiliate video #6.",
  },
  {
    dayNumber: 13, date: "2026-05-23", weekday: "Sat", fullDate: "Saturday, May 23",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch-shoot 4 affiliate videos. Stack the queue.",
    coldCallTarget: 25,
    studyFocus: "Pick 1 objection frame from Yash + 1 from Andres — when you'd use each",
    affiliateAction: "Outline affiliate videos #7–10 (Week 3 batch plan).",
  },
  {
    dayNumber: 14, date: "2026-05-24", weekday: "Sun", fullDate: "Sunday, May 24",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Honest weekly review. What's actually working?",
    coldCallTarget: 0,
    studyFocus: "Light study only — 30 min, no pressure",
    affiliateAction: "Update plan based on Week 2 data.",
  },

  // ─── WEEK 3 — Intensity ─────────────────────────
  {
    dayNumber: 15, date: "2026-05-25", weekday: "Mon", fullDate: "Monday, May 25",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Build 1 specific reframe for each top objection.",
    coldCallTarget: 65,
    studyFocus: "Re-watch best Andres call — new notes this time",
    affiliateAction: "Edit + post affiliate video #7.",
  },
  {
    dayNumber: 16, date: "2026-05-26", weekday: "Tue", fullDate: "Tuesday, May 26",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Email game on. 20 personalized cold emails (not AI spam).",
    coldCallTarget: 70,
    emailTarget: 20,
    studyFocus: "Body language on Zoom — 2 YouTube videos (20 min)",
    affiliateAction: "Shoot affiliate video #8.",
  },
  {
    dayNumber: 17, date: "2026-05-27", weekday: "Wed", fullDate: "Wednesday, May 27",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Roleplay objection handling 30 min — Discord partner if possible.",
    coldCallTarget: 75,
    emailTarget: 20,
    studyFocus: "NEPQ — Jeremy Miner advanced questioning (20 min)",
    affiliateAction: "Edit + post affiliate video #8.",
  },
  {
    dayNumber: 18, date: "2026-05-28", weekday: "Thu", fullDate: "Thursday, May 28",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Tonality + pacing — record yourself reading the script. Kill 1 filler word.",
    coldCallTarget: 80,
    studyFocus: "Tonality + pacing audit",
    affiliateAction: "Shoot affiliate video #9 + edit.",
  },
  {
    dayNumber: 19, date: "2026-05-29", weekday: "Fri", fullDate: "Friday, May 29",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Push every warm prospect for a decision today.",
    coldCallTarget: 75,
    studyFocus: "Impact Team top 10 principles — write the 3 you violate most",
    affiliateAction: "Post affiliate video #9.",
  },
  {
    dayNumber: 20, date: "2026-05-30", weekday: "Sat", fullDate: "Saturday, May 30",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch shoot. Refine Notion CRM. Self-care.",
    coldCallTarget: 25,
    studyFocus: "Yash One Frame — re-watch, find 1 nuance you missed",
    affiliateAction: "Batch shoot 4 affiliate videos.",
  },
  {
    dayNumber: 21, date: "2026-05-31", weekday: "Sun", fullDate: "Sunday, May 31",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Plan Week 4. Where does the money come from? Where is it going?",
    coldCallTarget: 0,
    studyFocus: "Re-read Email Marketing Bible — apply to Instantly sequence",
    affiliateAction: "Self-care: barber, errands, personal admin.",
  },

  // ─── WEEK 4 — Compound ──────────────────────────
  {
    dayNumber: 22, date: "2026-06-01", weekday: "Mon", fullDate: "Monday, June 1",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Document YOUR sales process in Notion. What's working, what's not.",
    coldCallTarget: 85,
    emailTarget: 25,
    studyFocus: "Tony Robbins 6 needs deeper — apply to your top 3 prospects",
    affiliateAction: "Edit + post affiliate video #10.",
  },
  {
    dayNumber: 23, date: "2026-06-02", weekday: "Tue", fullDate: "Tuesday, June 2",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Quality over volume today. 30 dials, slower, more re-loops.",
    coldCallTarget: 30,
    studyFocus: "Identify your weakest sales area — watch 3 videos on it (30 min)",
    affiliateAction: "Shoot 2 affiliate videos.",
  },
  {
    dayNumber: 24, date: "2026-06-03", weekday: "Wed", fullDate: "Wednesday, June 3",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Audit Instantly deliverability stats. Don't fly blind.",
    coldCallTarget: 90,
    emailTarget: 25,
    studyFocus: "NEPQ — advanced questioning techniques (20 min)",
    affiliateAction: "Edit + post 2 affiliate videos from yesterday.",
  },
  {
    dayNumber: 25, date: "2026-06-04", weekday: "Thu", fullDate: "Thursday, June 4",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Reach out to ANY happy person in your network — referrals push (5–10% fee).",
    coldCallTarget: 95,
    emailTarget: 30,
    studyFocus: "Review your best closed deal — what made it work? Write a breakdown.",
    affiliateAction: "Shoot 2 affiliate videos.",
  },
  {
    dayNumber: 26, date: "2026-06-05", weekday: "Fri", fullDate: "Friday, June 5",
    isWeeklyReview: false, isJummah: true, isLightDay: false,
    oneThing: "Owner hours. Push for closes today.",
    coldCallTarget: 85,
    studyFocus: "Identity selling — which of Tony Robbins 6 needs are you leveraging on calls?",
    affiliateAction: "Edit + post 2 affiliate videos.",
  },
  {
    dayNumber: 27, date: "2026-06-06", weekday: "Sat", fullDate: "Saturday, June 6",
    isWeeklyReview: false, isJummah: false, isLightDay: true,
    oneThing: "Batch shoot 5 affiliate videos — you're fast now. Move fast.",
    coldCallTarget: 20,
    studyFocus: "Decision-making frames — when to use each one",
    affiliateAction: "Batch shoot 5 affiliate videos.",
  },
  {
    dayNumber: 28, date: "2026-06-07", weekday: "Sun", fullDate: "Sunday, June 7",
    isWeeklyReview: true, isJummah: false, isLightDay: true,
    oneThing: "Big-picture review. What to cut from Month 2? Focus is power.",
    coldCallTarget: 0,
    studyFocus: "Personal review — am I hitting my standards?",
    affiliateAction: "Family / personal time.",
  },

  // ─── WEEK 5 — Crescendo ─────────────────────────
  {
    dayNumber: 29, date: "2026-06-08", weekday: "Mon", fullDate: "Monday, June 8",
    isWeeklyReview: false, isJummah: false, isLightDay: false,
    oneThing: "Last referrals push — 5 warm contacts.",
    coldCallTarget: 100,
    emailTarget: 30,
    studyFocus: "Pick 1 advanced topic — identity selling, emotional certainty, or decision frames. Go deep.",
    affiliateAction: "Shoot + edit + post affiliate video.",
  },
  {
    dayNumber: 30, date: "2026-06-09", weekday: "Tue", fullDate: "Tuesday, June 9",
    isWeeklyReview: true, isJummah: false, isLightDay: false,
    oneThing: "Final day. Slower script. Intentional. Feel every word.",
    coldCallTarget: 100,
    studyFocus: "Full 30-day review (2 hours): metrics, biggest win, biggest failure, what habit changed you most.",
    affiliateAction: "Post a final affiliate video. Write Month 2 plan in Notion.",
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
