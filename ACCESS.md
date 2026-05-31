# How to access Avori OS

Three paths depending on what you want to do. Pick one.

---

## ① The fastest path — run it locally (5 minutes)

You have everything you need to run Avori OS on your machine right now. No
database, no API keys, no cloud accounts. Mock data is built in.

```bash
# 1. Clone (or pull this branch you're on)
git checkout claude/productivity-system-design-GUnfJ

# 2. Install dependencies (one time, ~50 seconds)
npm install

# 3. Start the dev server
npm run dev

# 4. Open in your browser
open http://localhost:3000
```

That's it. Tour every screen via the sidebar or hit ⌘K (Mac) / Ctrl+K
(Windows) for the command palette. Every chart, animation, and metric is
fully wired against the demo dataset.

### What works in this mode
- ✅ All 10 routes render with full polish
- ✅ Toggleable tasks, animated rings, hover states
- ✅ AI chat works — sends real requests to `/api/chat`, gets streaming
     replies (from the built-in mock if `ANTHROPIC_API_KEY` is unset)
- ✅ Mobile-responsive — drag your browser to a narrow viewport to see
     the bottom nav appear

---

## ② Make it install like a real app (PWA — 30 seconds)

Avori OS ships as a Progressive Web App. On any device you can install
it without an App Store:

**On iPhone / iPad (Safari):**
1. Open `http://localhost:3000` (or your deployed URL) in Safari
2. Tap the Share button → "Add to Home Screen"
3. Launch from your home screen — it'll run full-screen with no
   browser chrome, just like a native app

**On Mac (Safari or Chrome):**
1. Open in Safari → File → "Add to Dock"  *(or in Chrome: ⋮ → "Cast,
   Save and Share" → "Install Avori OS…")*
2. Launches in its own window from your Dock with a custom icon

**On Windows (Edge or Chrome):**
1. Click the install icon in the URL bar
2. Pin it to taskbar

**On Android (Chrome):**
1. ⋮ menu → "Install app"

The PWA manifest is at `src/app/manifest.ts` — full-screen mode, custom
icon, app shortcuts (Coach, Tasks, Agency, Health appear in long-press
menus on iOS/Android).

---

## ③ Make it real (production wiring — 30 minutes)

When you're ready to go from demo to a personal-use deployment:

### Step 1 — Provision the backend
```bash
# Create a free Supabase project at supabase.com (Postgres + auth + storage)
# Grab DATABASE_URL and the anon key from project settings.

cp .env.example .env.local
# Fill in DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Push the schema (creates all 24 tables)
npx prisma db push

# Seed the demo data
npx prisma db seed
```

### Step 2 — Add the AI brain
Get a key at console.anthropic.com → add to `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4-7
```

The chat at `/assistant` will now stream real Claude replies instead of
the mock. The system prompt is in `src/lib/ai/system-prompt.ts` — tune
it to your taste.

### Step 3 — Deploy to the web
```bash
# Push to GitHub, then:
# 1. vercel.com → New Project → import this repo
# 2. Set env vars in Vercel dashboard (same as .env.local)
# 3. Deploy. Edge runtime + global CDN out of the box.
```

`vercel.json` is already configured with secure headers and immutable
static asset caching.

### Step 4 — Native mobile (when you want App Store distribution)
```bash
# Install Capacitor
npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android

# Build the static bundle Capacitor wraps
npm run build

# Add platforms (one time)
npx cap add ios
npx cap add android

# Open in Xcode / Android Studio
npx cap open ios
npx cap open android
```

Capacitor reads `capacitor.config.ts` (already configured). Each
iteration is `npm run build && npx cap sync`.

### Step 5 — Native desktop
```bash
# Install Tauri (requires Rust toolchain)
npm i -D @tauri-apps/cli @tauri-apps/api

# Dev
npx tauri dev

# Production builds (.dmg + .msi + .deb + AppImage)
npx tauri build
```

Tauri reads `src-tauri/tauri.conf.json`. See `src-tauri/README.md`
for platform-specific setup.

---

## Where to look in the codebase

| You want to…                              | Open                                             |
|-------------------------------------------|--------------------------------------------------|
| Change the brand / colors                 | `src/app/globals.css` (CSS theme tokens)         |
| Add or rename a route                     | `src/app/(app)/<route>/page.tsx`                 |
| Tune the AI coach's tone                  | `src/lib/ai/system-prompt.ts`                    |
| Swap mock data for real DB queries        | `src/lib/mock-data.ts` → `src/server/`           |
| Adjust the database schema                | `prisma/schema.prisma`                           |
| Change the sidebar nav order              | `src/components/shell/sidebar.tsx`               |
| Modify the design primitives              | `src/components/ui/`                             |
| Edit the keyboard ⌘K palette              | `src/components/shell/command-palette.tsx`       |

---

## Troubleshooting

**`npm install` fails on Node < 20**
Use Node 22 LTS. `nvm install 22 && nvm use 22`

**Dev server takes 30 seconds to first paint**
That's normal first-compile time with Turbopack. Subsequent reloads are
instant.

**AI chat replies feel scripted**
You haven't set `ANTHROPIC_API_KEY` yet — it's running on the local
mock generator. Add the key to `.env.local` and restart.

**Photo meal scan does nothing**
The button is wired but the vision backend isn't yet — that lands in
v0.3 (`OPENAI_API_KEY` → GPT-4o multimodal).

**HealthKit / Apple Watch isn't syncing**
Native bridges land in v0.4 once we wrap with Capacitor. Until then,
manual entry only.
