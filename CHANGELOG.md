# CHANGELOG

All notable changes to Avori OS will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added — Closed-app push notifications + native step bridge
- **Web Push** so Avori can notify you **even when it's fully closed** (on
  the installed iPhone PWA). New service worker (`public/sw.js`), VAPID-based
  send pipeline, and subscriptions stored in the existing `apex_state` table
  (no new table). Settings → **Phone notifications** has Turn on / **Send
  test** / Turn off, plus an iOS "Add to Home Screen" hint.
- **Scheduled reminder cron** (`/api/cron/reminders`, via `vercel.json`)
  pushes a time-of-day-aware "come back / close strong" nudge to every
  subscribed device — the loss-aversion hook that pulls you back in.
- **Native background step bridge** (`src/lib/health/native-steps.ts`):
  when Avori runs as the Capacitor native app with a Health plugin, it reads
  the *real* daily step total iOS counts in the background (HealthKit) and
  mirrors it in — no double-counting with the web accelerometer. Dormant on
  the web build. Full build guide in DEPLOY.md (a website physically can't
  count steps while closed; this needs the native shell).

### Fixed — Mobile layout, slide-out menu & pipeline dragging
- **App now fits the phone screen.** A Recharts `ResponsiveContainer`
  reported a min-content width that propped its grid column open past the
  viewport, leaving a dead bar down the right side. Charts are now
  `min-w-0 overflow-hidden` (dashboard, agency, health, insights), and
  `html`/`body` clamp horizontal overflow as a safety net.
- **Top-left menu opens fully.** The slide-out drawer lived inside the
  top bar, whose `backdrop-filter` became the containing block for its
  `position: fixed` — trapping the drawer to the 64px bar (only the header
  showed). It's now portaled to `<body>`, so it spans the full height with
  the whole nav + Sign out.
- **Pipeline deals can be dragged to any stage.** The lifted card sat
  under the pointer, so the drop hit-test (`elementFromPoint`) resolved to
  the card's *own* column and the move never fired — now the card's
  pointer events are suppressed during the hit-test so it reads the column
  underneath. Each deal also gets an always-visible **stage picker**
  (native, tap-friendly) so you can jump a lead to Lead / Qualified /
  Proposal / Negotiation / Won on touch without hover — the old advance/
  delete buttons were hover-only and invisible on phones.

### Added — Mandatory per-account onboarding + personalized CRM + close XP
- **Onboarding is now required per account** (not per device): the questions
  live in the synced per-user `profile`, pop up right after registration, and
  an `OnboardingGate` bounces a signed-in user back to `/onboarding` from any
  page until they finish. The back button is blocked while it's incomplete.
- **Business questions are mandatory**: you can't continue past the business
  step without saying **what you're running** and **your business name**.
- **Agency page is personalized**: it's now titled with your business name and
  reads as your own built-in CRM throughout.
- **Close XP**: moving a deal to **Won** grants XP (scaled by deal value) — but
  **only once per lead**, so a won deal can't be farmed by dragging it in and
  out of Won.

### Added — Drag & drop sales pipeline
- The Agency pipeline is now a real **kanban board**: press & hold the grip
  handle on any deal and drag it between **Lead → Qualified → Proposal →
  Negotiation → Won** (or Lost). Works on touch (iPhone) and mouse; the
  target column highlights as you drag, and the card snaps into place on drop.
  The tap ↗ "advance" and Call/Text buttons still work.

### Rebrand → Avori OS + mobile/notification fixes
- **Renamed the app to "Avori OS"** everywhere it's shown (UI, PWA name, page
  titles, docs). Internal storage keys (`apex:*`, `apex_state`, auth cookies)
  and the `APEX_PASSWORD` env var are intentionally unchanged so existing data
  and deployments keep working.
- **Notification panel fixed**: it was see-through and hard to dismiss. Now a
  solid, opaque panel anchored under the bell (safe-area aware) with a clear ✕
  close button and a tap-anywhere backdrop.
- **Mobile menu fixed**: the top-left slide-out drawer was transparent/broken —
  now solid and opaque.
- **Always-on step tracking**: tracking moved to an app-wide provider so it
  keeps counting as you move between pages and **auto-resumes when you reopen**
  the app (no re-allowing each time, as long as the browser keeps motion
  access). Toggle it once on the Health page. *(A website still can't count
  while fully closed — that needs the native HealthKit build.)*
- **Day-plan reminders**: unchecked day-plan blocks that are past their time now
  show in the bell, the nav counts, and the reminder nudges.


### Added — Twilio dialer/CRM, agentic AI, mobile nav
- **Twilio dialer + texting** on the Agency page: a browser dialer (call
  leads through your Twilio number via the Voice SDK), SMS composer, per-deal
  **Call/Text** buttons, and a call/text **activity log** — a GoHighLevel-style
  CRM. New routes: `/api/twilio/{token,voice,sms/send,sms/incoming}`. Lead
  import + the deal form now capture **phone numbers**. Everything is driven by
  env vars and shows a "Connect Twilio" card until configured.
- **Agentic AI coach**: the assistant can now *do things* in the app — add
  tasks/work items/leads, log water/steps/weight/meals, create challenges,
  navigate, and even start a call or send a text. It emits structured action
  blocks that run against your own synced state; confirmation chips show what
  it did. Works with Claude (via the system-prompt tool spec) and in mock mode.
- **Mobile navigation fix**: a new slide-out menu (top-bar) gives phones the
  full nav — including **Settings**, which was previously unreachable on mobile.
  Settings + a Dialer shortcut were also added to the command palette.

### Added — Accounts, addiction loop, auto step tracking & notifications
- **Multi-user accounts**: email/password **login + register** pages backed
  by Supabase Auth, with a local-account fallback when Supabase isn't
  configured. All synced state is now namespaced per user (`apex:u:<uid>:…`).
- **Onboarding questionnaire**: after registering, a multi-step flow captures
  name, age, business type/stage, goals, income target, work style, daily
  structure, body stats, experience and motivations — stored as a per-user
  `profile` and used to personalize the app.
- **Addiction / retention engine**: a daily **mystery-box reward** (variable
  reinforcement) that extends your streak, **loss-aversion** streak framing,
  a dashboard **"Next up"** card that always surfaces the most important open
  action, and red-dot **counts** across the sidebar + mobile nav.
- **Live notifications**: a notification center (the top-bar bell) listing
  everything still open today, plus opt-in **browser reminders** that nudge
  you about the top item (quiet hours 10 PM–6 AM).
- **Automatic step tracking**: accelerometer pedometer that classifies
  **still / walking / running / vehicle** and only counts real walking/running
  steps — no manual logging.

### Changed
- **60-day plan** reframed for **home or Starbucks** (school removed),
  emphasizing first cold calls, buying/learning GHL, building automations and
  daily sales study. The Work list now seeds the full startup queue, and the
  Tasks page has a one-tap **starter pack**.
- **Lead import** now lets you set a **value per lead**, **select all**, and
  **apply a value to all selected** before importing.
- Meal photo scanner relabeled to **"Meal Vision"** (model name removed from
  the UI).

### Planned for v0.2 — Live data
- Supabase auth (email magic link + Apple/Google OAuth)
- Row-level security policies for every Prisma model
- Server actions replacing the mock data layer
- Real-time subscriptions for streaks and leaderboards
- Daily cron evaluating the adaptive difficulty engine

### Planned for v0.3 — Live AI
- Anthropic streaming chat via Server-Sent Events
- pgvector embedding pipeline for `AiMemory`
- Hybrid retrieval (semantic + importance + recency)
- GPT-4o photo meal recognition with portion estimation
- Daily insight generation cron

### Planned for v0.4 — Cross-platform
- Capacitor 6 wrap → iOS TestFlight + Play Store internal
- Tauri 2 wrap → macOS .dmg + Windows .msi
- Expo Notifications across all platforms
- Apple HealthKit + Google Fit read-sync

### Planned for v0.5 — Network effects
- Opt-in public leaderboards
- Accountability-partner coach mode
- Shareable streak badges + milestone OG images

---

## [0.1.0] — 2026-05-10

The bootstrap. First production-grade scaffold of the AI Life Operating System.

### Added

**Surfaces (10 fully designed routes + login)**
- `/` — AI Life Dashboard with hero stats, 8 vital metrics, 7-day
  productivity chart, real-time AI insights, today's tasks, habit grid,
  and daily discipline reinforcement
- `/tasks` — AI Adaptive Todo system: smart filtering, AI coach
  recommendation card, difficulty calibration timeline, and energy-curve
  intelligence panel
- `/discipline` — Discipline Engine: score ring, daily reinforcement
  quote, active challenges (Operator, 75 Hard Avori Edition, Deep Work
  Marathon), breach log, non-negotiable habits
- `/health` — Macro ring + calorie tracking, photo-meal scan CTA, vitals
  (water/steps/sleep/HR), weight trend, sleep bar chart, workout log
- `/agency` — Avori Growth Corp command center: KPI strip, MRR
  trajectory chart, sales pipeline kanban (5 stages), client roster
  with health scores, active campaigns, AI business advisor
- `/learn` — Curated track library, in-progress hero cards, AI lesson
  summaries with quiz/notes/save actions
- `/assistant` — AI Coach chat: typing indicator, suggested prompts,
  persistent memory rail, coach personality switcher (strategist /
  drill / mentor / stoic)
- `/insights` — Pattern analysis: life-balance radar (you vs. peer),
  30-day life score trend, behavioral correlations ranked by strength,
  AI memory activity timeline
- `/achievements` — Level/XP hero, rarity-tiered badge grid (common →
  mythic), Operator leaderboard with rank movement
- `/settings` — Profile, AI behavior, notifications, integrations,
  devices, privacy & data
- `/login` — Cinematic entry surface with animated logo and promises

**Design system**
- Dark-first cinematic palette (void → obsidian → graphite → onyx)
- Signature accent gradient (violet → indigo → cyan)
- Glassmorphism utilities (`glass`, `glass-strong`, `surface-card`,
  `surface-elevated`)
- Custom keyframes (aurora, shimmer, float, pulse-glow, fade-up,
  scale-in, slide-in-right, gradient)
- Tabular numerics, minimal scrollbars, premium selection
- Ambient backdrop with radial gradients and SVG grain texture
- Fully responsive: mobile bottom nav, tablet, desktop sidebar

**Reusable primitives**
- `Button` (6 variants × 5 sizes, asChild support)
- `Card` (glass / surface / elevated)
- `Progress` linear + `RingProgress` SVG ring with animated gradient
- `Badge` (6 color variants)
- `PageHeader` (eyebrow + title + subtitle + icon accent + actions)

**Shell**
- Sticky sidebar with active-route motion layoutId
- Top bar with greeting, search, streak + discipline chips, notifications
- Mobile bottom nav with glow-on-active
- `cmdk`-powered command palette (⌘K) with groups, keyboard nav,
  navigation + quick actions

**Database schema (24 models, Prisma 6)**
- Identity: `User` (+ XP/level/scores/preferences)
- Tasks: `Task` (with subtasks), `Habit`, `HabitLog`
- Discipline: `DisciplineBreach`, `Challenge`
- Health: `Meal`, `Workout`, `SleepLog`, `BodyMetric`, `MoodLog`
- AI: `AiInsight`, `AiMemory` (with `vector(1536)` embedding column),
  `Conversation`, `Message`
- Gamification: `Achievement`, `AchievementProgress`
- Agency: `Client`, `Deal`, `Campaign`
- Learning: `LearningTrack`, `LearningProgress`
- Enums for every categorical field

**Documentation**
- README with full architecture diagram, tech stack rationale,
  cross-platform strategy, data flow, AI memory pipeline, adaptive
  difficulty algorithm, feature status matrix, design principles, and
  roadmap through v0.5

### Verified
- `npm install` clean (509 packages, zero vulnerabilities surfaced)
- `tsc --noEmit` passes (TypeScript strict)
- `next build` passes — 14 routes prerendered as static, 150–260 KB
  First Load JS per route

[Unreleased]: https://github.com/sayedbusiness/the-tracker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sayedbusiness/the-tracker/releases/tag/v0.1.0
