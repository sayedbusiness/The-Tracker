# Avori OS — The Life Operating System

> A cinematic, AI-powered personal command center for discipline, productivity,
> health, business, and growth. Built like a venture-backed product, designed
> like an Apple keynote.

This is not a productivity app. It's a **personal operating system** — a single
surface that tracks every meaningful signal of your life, learns your patterns,
adapts the difficulty to you over time, and holds you accountable to the
version of yourself you said you wanted to become.

---

## Why this exists

Most productivity apps are graveyards of good intentions. They give you a
todo list and walk away. Avori OS does the opposite — it **learns who you are
and pushes you toward who you said you'd become**.

The system is built around four pillars:

1. **Track** — every meaningful signal (tasks, sleep, meals, workouts, mood, business)
2. **Analyze** — surface the patterns hiding in your behavior
3. **Adapt** — scale difficulty as you grow stronger
4. **Reinforce** — gamification + a brutally honest AI coach

---

## The stack — and why

| Layer            | Choice                          | Why                                                                                 |
|------------------|---------------------------------|-------------------------------------------------------------------------------------|
| Framework        | **Next.js 15 (App Router)**     | RSC for streamed dashboards, edge-ready, single codebase for web/iOS/macOS/Windows |
| Language         | **TypeScript (strict)**         | Catch shape errors before runtime in a large feature surface                       |
| Styling          | **Tailwind CSS v4 (CSS-first)** | Zero-runtime, design tokens as CSS variables, native dark-first                   |
| UI primitives    | **Radix + cmdk**                | Accessibility-correct, headless — we own the look                                  |
| Motion           | **Framer Motion 12**            | Production-grade physics, layout animations, shared element transitions            |
| Charts           | **Recharts 2**                  | Composable React-native charts, easy to theme                                      |
| State            | **Zustand**                     | Tiny, no boilerplate, perfect for client state                                     |
| Forms            | Native + zod (incremental)      | Server actions + edge validation                                                   |
| Database         | **Postgres (Supabase)**         | RLS for multi-user, generous free tier, edge-ready                                 |
| ORM              | **Prisma 6**                    | Type-safe queries, migrations, supports pgvector                                   |
| AI brain         | **Claude Opus 4.7 (Anthropic)** | Best-in-class reasoning, long context (200K+) for memory                          |
| Vector memory    | **pgvector** (in Postgres)      | One DB to operate, no separate Pinecone bill                                      |
| Vision (food)    | **Gemini 2.5 Flash** (multimodal) | Fast, cheap, strict-JSON output for meal-photo recognition                       |
| Auth             | **Supabase Auth**               | Email magic link + OAuth (Apple, Google), JWT, RLS-aware                          |
| Real-time        | **Supabase Realtime**           | Postgres-backed live queries for streaks/leaderboards                              |
| Push             | **Expo Notifications**          | One API for iOS/Android/web                                                       |
| Mobile shells    | **Capacitor 6**                 | Wraps the Next.js PWA → real App Store / Play Store binaries                      |
| Desktop shells   | **Tauri 2**                     | Lightweight native macOS/Windows builds, system-tray, native notifications        |
| Wearables        | HealthKit · Google Fit          | Read-only sync on device, never leaves the user                                   |
| Analytics        | **PostHog (self-host option)**  | Product analytics with user-controlled retention                                  |
| Hosting          | **Vercel** (web) · Supabase     | Edge functions for AI streaming, near-zero ops                                    |
| CI / CD          | GitHub Actions                  | Type-check, lint, e2e, preview deploy on every PR                                 |

### Cross-platform strategy

One codebase. Three deliveries:

1. **Web (`apex.os`)** — Next.js running on Vercel edge. Works on every browser, every device.
2. **Mobile (iOS / iPadOS / Android)** — Capacitor 6 wraps the PWA. Real notifications, real App Store distribution, but the UI is the same React code.
3. **Desktop (macOS / Windows / Linux)** — Tauri 2 wraps the same PWA into a ~10MB native binary with system tray, global shortcuts, and OS-level notifications.

Result: every screen ships everywhere, simultaneously.

---

## The architecture

```
The-Tracker/
├── prisma/
│   └── schema.prisma          ← The full data model (24 models)
├── src/
│   ├── app/
│   │   ├── (app)/             ← Authenticated app surface
│   │   │   ├── layout.tsx     ← Shell wrapper
│   │   │   ├── page.tsx       ← AI Life Dashboard
│   │   │   ├── tasks/         ← AI Adaptive Todos
│   │   │   ├── discipline/    ← Discipline Engine
│   │   │   ├── health/        ← Food / fitness / sleep
│   │   │   ├── agency/        ← Avori Growth Corp command center
│   │   │   ├── learn/         ← Learning library
│   │   │   ├── assistant/     ← AI Coach chat
│   │   │   ├── insights/      ← Pattern analysis + memory
│   │   │   ├── achievements/  ← Gamification, leaderboard
│   │   │   └── settings/
│   │   ├── globals.css        ← Design tokens, glass utilities, keyframes
│   │   └── layout.tsx         ← Root: fonts, metadata, viewport
│   ├── components/
│   │   ├── ui/                ← Button, Card, Progress, Badge primitives
│   │   ├── shell/             ← Sidebar, top-bar, command palette, mobile nav
│   │   ├── dashboard/         ← Hero, metric tiles, charts, insights
│   │   └── tasks/             ← Task-specific blocks
│   ├── lib/
│   │   ├── utils.ts           ← cn(), formatters, time helpers
│   │   └── mock-data.ts       ← Demo dataset (swap to Prisma queries)
│   └── server/                ← (next) AI agents, server actions, RLS helpers
├── public/
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

### The data flow

```
       ┌─────────────────────────────────────────┐
       │            CLIENT (RSC + RCC)           │
       │  Next.js App Router · Tailwind · FM12   │
       └──────────────┬────────────┬─────────────┘
                      │            │
              read    │            │  write
                      ▼            ▼
       ┌─────────────────────────────────────────┐
       │       SERVER (Edge functions)           │
       │   Server Actions · API routes · auth    │
       └──────────────┬────────────┬─────────────┘
                      │            │
                      ▼            ▼
              ┌──────────┐     ┌──────────┐
              │ Postgres │◄────│ pgvector │
              │ + RLS    │     │ memory   │
              └────┬─────┘     └────┬─────┘
                   │                │
                   ▼                ▼
              ┌──────────────────────────┐
              │   Claude Opus 4.7 brain  │
              │   + GPT-4o vision (food) │
              └──────────────────────────┘
```

### AI memory architecture

The AI doesn't reload your life every conversation — it has **persistent memory**:

- **Short-term**: last 20 messages in conversation, full context window
- **Working memory**: today's metrics, active goals, current streaks (RLS-scoped Postgres query)
- **Long-term**: every meaningful event (task completed, habit broken, goal stated) is embedded with OpenAI `text-embedding-3-large` and stored in `pgvector`
- **Retrieval**: each user message triggers a hybrid search — cosine similarity + importance score + recency decay — to pull the most relevant 5-10 memories into context

This is why the AI can say "you mentioned wanting to launch a productized service in Q3" without you ever bringing it up again.

### The adaptive difficulty engine

The novel piece. Every night a cron job evaluates the last 7-14 days per user:

```
new_difficulty = clamp(
  current_difficulty
    + (completion_rate > 0.85 ? +0.2 : 0)
    + (streak_days > 21 ? +0.1 : 0)
    - (missed_days > 3 ? -0.3 : 0)
    - (mood < 5 for 3 days ? -0.2 : 0),
  1.0,  // floor — never let the user coast
  5.0
)
```

The result feeds into:
- Number of P0 tasks generated per day
- Difficulty rating attached to new tasks
- The tone of the AI coach (more demanding ↔ more supportive)
- Challenge slot availability

Critically: the floor (1.0) means the system never lets you coast indefinitely. The ceiling (5.0) keeps it humane.

---

## Major features (status)

| Feature                       | Status   | Where it lives                          |
|-------------------------------|----------|------------------------------------------|
| AI Life Dashboard             | ✅ Built | `src/app/(app)/page.tsx`                |
| AI Adaptive Todo System       | ✅ Built | `src/app/(app)/tasks/`                  |
| AI Discipline Engine          | ✅ Built | `src/app/(app)/discipline/`             |
| Health + Food + Fitness       | ✅ Built | `src/app/(app)/health/`                 |
| Avori Growth Corp Command Ctr  | ✅ Built | `src/app/(app)/agency/`                 |
| Learning library + AI summaries| ✅ Built | `src/app/(app)/learn/`                  |
| AI Coach (chat)               | ✅ Built | `src/app/(app)/assistant/`              |
| Pattern Analysis + Memory     | ✅ Built | `src/app/(app)/insights/`               |
| Gamification + Achievements   | ✅ Built | `src/app/(app)/achievements/`           |
| Settings + integrations       | ✅ Built | `src/app/(app)/settings/`               |
| Command palette (⌘K)          | ✅ Built | `src/components/shell/command-palette.tsx` |
| Mobile responsive             | ✅ Built | Tailwind responsive utilities + bottom nav |
| Database schema               | ✅ Built | `prisma/schema.prisma` (24 models)      |
| Real Anthropic streaming AI   | 🔜 Next  | `src/server/agents/`                    |
| Photo food recognition        | 🔜 Next  | `src/server/vision/`                    |
| HealthKit / Google Fit sync   | 🔜 Next  | Native bridge via Capacitor             |
| Push notifications            | 🔜 Next  | Expo + service worker                   |
| iOS / macOS / Windows builds  | 🔜 Next  | Capacitor + Tauri config                |

---

## Local dev

```bash
# Install
pnpm install

# Run with mock data (no DB required)
pnpm dev
# → http://localhost:3000

# When ready to wire the real stack:
cp .env.example .env.local
# Fill in DATABASE_URL, ANTHROPIC_API_KEY, etc.
pnpm db:push      # Push schema to Postgres
pnpm db:studio    # Open Prisma Studio
```

---

## Design system principles

1. **Dark first, light optional.** Every surface designed for low-light focus.
2. **Glassmorphism, sparingly.** Used to imply layered depth, not for decoration.
3. **Motion has meaning.** Every transition tells you what happened — never just "to look cool."
4. **Tabular numbers everywhere.** Metrics never reflow.
5. **Negative space > more content.** The reader's eye should never feel chased.
6. **One accent gradient.** Violet → Indigo → Cyan. Everything else supports it.
7. **Typography hierarchy in 3 sizes max.** Display, body, micro. No exceptions.

---

## Roadmap

### v0.1 — Foundation (you are here)
- ✅ Full UI for all 10+ feature surfaces
- ✅ Design system + glassmorphism kit
- ✅ Cross-device responsive (mobile, tablet, desktop)
- ✅ Command palette + keyboard nav
- ✅ Prisma schema (24 models)
- ✅ Mock data layer

### v0.2 — Live data
- [ ] Supabase auth + RLS policies
- [ ] Server actions replacing mock data
- [ ] Realtime subscriptions for streaks/leaderboard
- [ ] Daily cron for difficulty engine

### v0.3 — Live AI
- [ ] Anthropic streaming chat (server-sent events)
- [ ] pgvector memory pipeline
- [ ] Daily insight generation
- [ ] GPT-4o photo meal recognition

### v0.4 — Cross-platform
- [ ] Capacitor wrap → TestFlight + Play Store internal
- [ ] Tauri wrap → macOS .dmg + Windows .msi
- [ ] Expo Notifications wired
- [ ] HealthKit / Google Fit read sync

### v0.5 — Network effects
- [ ] Optional public leaderboards
- [ ] Coach-mode for accountability partners
- [ ] Shareable streak badges

---

## License

Private. © Avori Growth Corp.
