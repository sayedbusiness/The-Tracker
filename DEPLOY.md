# Going to production — every step, with costs

Plain-English walkthrough of every "how do I actually ship this" question.
I've grouped by what costs nothing vs. what costs money so you can decide.

---

## 🔄 Cross-device sync (5 min, free, uses Supabase)

Without this, every device keeps its own copy of your tasks, meals,
challenges, etc. With it, any change on one device shows up on every
other device within 20 seconds.

This uses your existing **Supabase** project — no extra cost, well
within the free tier (500 MB Postgres / 2 GB egress / month).

**Step 1 — Create the storage table (one-time, ~30 seconds):**

1. Go to **app.supabase.com** → open your project
2. Click **SQL Editor** in the left rail → **New query**
3. Paste this and click **Run**:

   ```sql
   create table if not exists apex_state (
     key         text primary key,
     value       jsonb       not null,
     updated_at  bigint      not null
   );

   -- We only read/write this table from the server using the
   -- service_role key, so RLS isn't needed. But enabling it (with no
   -- public policies) makes the table invisible to anon/auth clients,
   -- which is the safer default.
   alter table apex_state enable row level security;
   ```

**Step 2 — Add the env vars to Vercel (if they aren't already there):**

1. Go to **vercel.com** → your project → **Settings** → **Environment Variables**
2. Confirm these two exist (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL (e.g. `https://abcd.supabase.co`).
     Find it in Supabase → **Project Settings → API → Project URL**.
   - `SUPABASE_SERVICE_ROLE_KEY` = your `service_role` key (NOT the
     anon key). Same Supabase page → **service_role · secret**.
     **Never** put this key in client code — it's already only used
     server-side here.
3. If you added/changed anything, go to **Deployments** → ⋯ on the
   latest → **Redeploy** (env vars only apply to new builds).

**Step 3 — Test it:**

Open the app on your phone, add a task. Wait 20 seconds. Refresh on
your laptop — the task appears. (You can also tap refresh and it'll
pull immediately.)

**Until you set this up:** The app still works perfectly on each
device individually. You just won't see cross-device updates. Every
button, every form, every change still persists on the device where
you made it.

---

## 👤 Turning on accounts (login + register, multi-user)

The app supports real email/password accounts so anyone can sign up and
get their own private data. It auto-detects which mode to run in:

| Mode | When it's used | What the user sees |
|------|----------------|--------------------|
| **Accounts** | `NEXT_PUBLIC_SUPABASE_URL` **and** `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set | A real login + register screen. After signing up they answer a short personalization questionnaire. Each account's data is private. |
| **Password** | Only `AVORI_PASSWORD` (or legacy `APEX_PASSWORD`) is set | The single shared-password gate. |
| **Open** | Neither is set | No gate. The login/register screens still work, backed by local (device-only) accounts — handy for demos. |

**To enable real accounts (5 min, free):**

1. In Supabase → **Project Settings → API**, copy the **anon / public**
   key (this one is safe in client code).
2. In Vercel → **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = that anon key.
   - (You already have `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from the sync step above.)
3. In Supabase → **Authentication → Providers → Email**, decide on
   confirmation:
   - **Off** (recommended for a fast start): users can sign in the moment
     they register.
   - **On**: users must click an email link before their first sign-in.
4. Redeploy.

**How data is kept separate:** every synced key is namespaced with the
signed-in user's id (`apex:u:<uid>:…`) in the same `apex_state` table —
no schema change needed. The personalization answers from onboarding are
stored per user under the `profile` key.

> Note on isolation: the per-user `apex-uid` cookie is a pragmatic v1
> boundary, not a hardened one. For strict isolation later, move state
> reads/writes behind Supabase **Row Level Security** keyed on the JWT.

---

## 🔔 Notifications

- **In-app:** the bell in the top bar always shows everything still open
  today (calls, tasks, quests, habits, health) with a live count, and the
  nav items show red-dot badges. No setup needed.
- **Browser push (while a tab is open):** tap **Turn on reminders** in the
  bell menu (or Settings → Reminders) and grant permission. The app then
  nudges you about the top open item, with quiet hours 10 PM–6 AM.
- **Fully-closed-app push** (notifications when the PWA isn't running at
  all) needs a service worker + Web Push subscription (or Expo on the
  native shells) — that's the next layer.

---

## ☎️ Twilio dialer & texting (Agency / CRM page)

The Agency page has a built-in **dialer** (call leads from the browser) and
**texting**, plus per-deal Call/Text buttons and an activity log — a
GoHighLevel-style CRM. It's powered by Twilio and turns on once these env
vars are set (server-only — never commit them):

| Env var | What it is | Where to get it |
|---------|-----------|-----------------|
| `TWILIO_ACCOUNT_SID` | `AC…` Account SID | Twilio Console home |
| `TWILIO_API_KEY_SID` | `SK…` Standard API Key SID | Console → Account → API keys & tokens → Create API key |
| `TWILIO_API_KEY_SECRET` | the API key secret | shown **once** when you create the key |
| `TWILIO_TWIML_APP_SID` | `AP…` TwiML App SID | see step 1 below |
| `TWILIO_PHONE_NUMBER` | your Twilio number, E.164 (`+1…`) | Console → Phone Numbers |

> ⚠️ **Security:** the API key secret is a credential. Keep it only in Vercel
> env vars. If it's ever pasted somewhere shared (chat, screenshot, commit),
> **rotate it** in the Twilio Console.

**Step 1 — Create a TwiML App** (Console → Voice → TwiML → TwiML Apps → Create):
Give it a name like "Avori Dialer". Set the request URLs to your deployed app
(replace `your-app.vercel.app` with your real domain):

- **Voice Configuration → Request URL:**
  `https://your-app.vercel.app/api/twilio/voice`  (HTTP **POST**)
- **Messaging Configuration → Request URL:**
  `https://your-app.vercel.app/api/twilio/sms/incoming`  (HTTP **POST**)

Save it, then copy its SID (`AP…`) into `TWILIO_TWIML_APP_SID`.

**Step 2 — Point your phone number at the app** (optional, for inbound):
On your Twilio number's config, set the **Messaging** webhook to
`https://your-app.vercel.app/api/twilio/sms/incoming` (POST). Voice inbound is
handled by the TwiML App above.

**Step 3 — Add the env vars in Vercel** (Settings → Environment Variables),
then redeploy. Open the Agency page → the **Dialer** card goes live (grant mic
access when prompted). If the vars are missing, the page shows a friendly
"Connect Twilio" card instead.

How it works: the browser gets a short-lived Voice token from
`/api/twilio/token`, the Voice SDK places the call, and Twilio fetches
`/api/twilio/voice` (your TwiML App URL) to bridge it from your number. Texts
post to `/api/twilio/sms/send`.

---

## 👟 Automatic step tracking

The Health page can count steps from the phone's motion sensor and detect
whether you're **still / walking / running / in a vehicle** — only real
walking/running steps are counted. Requirements:

- Must be served over **HTTPS** (Vercel is) — the motion API is disabled
  on insecure origins.
- On **iPhone/Safari**, tapping **Start** prompts for motion access (a
  one-time iOS permission). Grant it.
- On desktop (no motion sensor) it falls back to manual entry.

---

## 📅 Connecting Google Calendar (3 min)

The `/calendar` page reads the next 24 hours of your Google Calendar.
You need to set up an OAuth client once:

1. Go to **https://console.cloud.google.com/** → create a project (or pick an existing one)
2. **APIs & Services → Library** → search **Google Calendar API** → enable it
3. **APIs & Services → OAuth consent screen** → External → fill name, email → add scope `.../auth/calendar.readonly` → add your email as a test user
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `https://<your-vercel-url>/api/calendar/callback`
     (and `http://localhost:3000/api/calendar/callback` for local dev)
5. Copy the **Client ID** and **Client secret**
6. Add to Vercel env vars:
   - `GOOGLE_CLIENT_ID` = your client id
   - `GOOGLE_CLIENT_SECRET` = your client secret
   - `GOOGLE_REDIRECT_URI` = `https://<your-vercel-url>/api/calendar/callback`
7. Redeploy. Now `/calendar` shows a "Connect with Google" button → tap it → grant read access → you're synced. Cookie stays valid for 90 days.

---

## 🔒 Locking your live URL (must do before sharing the link)

Anyone with your Vercel URL can currently see your data. To gate it:

1. Pick a password you'll remember (e.g. `avori-sayed-2026`)
2. Go to **vercel.com** → your project → **Settings** → **Environment Variables**
3. Add a new variable:
   - **Key:** `AVORI_PASSWORD`  _(legacy `APEX_PASSWORD` also works)_
   - **Value:** your chosen password
   - **Environments:** Production AND Preview (default)
4. Click **Save**
5. Go to the **Deployments** tab → click **⋯** on the latest deploy → **Redeploy**

After that redeploy finishes (~90s), anyone visiting your URL will see a
login screen. Type the password once and you're in for 30 days (cookie
remembers you per device). If anyone else has the URL but not the
password, they're blocked.

To kick yourself out and force re-login, delete the `AVORI_PASSWORD` env
var, redeploy, then re-add it. Or change the value to a new password.

---

## TL;DR — what I already did vs. what only you can do

| Step                                  | Who does it | Cost                |
|---------------------------------------|-------------|---------------------|
| Wire Anthropic AI chat                | ✅ Done     | Pay-per-use (cheap) |
| Wire Gemini meal vision               | ✅ Done     | Free tier generous  |
| Put your keys in `.env.local`         | ✅ Done     | Free                |
| Verify both keys work                 | ✅ Done     | Free                |
| Deploy to web (Vercel)                | You         | Free                |
| Set up live database (Supabase)       | You, later  | Free                |
| Publish to iOS App Store              | You         | **$99/year**        |
| Publish to Google Play Store          | You         | **$25 one-time**    |
| Build .dmg / .msi (Mac/Windows)       | You         | Free                |
| Sign Mac/Windows desktop binaries     | You         | $99/yr + $200-400/yr|

---

## ① The database question (you said you're confused — here's the answer)

**Short answer: you don't need a database right now.** The app works
perfectly on mock data. Skip this section and come back when you want
your data to persist across devices and refreshes.

When you're ready, the cheapest path is **Supabase**:

1. Go to [supabase.com](https://supabase.com) → "Start your project"
2. Sign in with GitHub
3. Click "New project"
4. Project name: `avori-os` · Region: closest to you · Password: pick a strong one (save it)
5. Wait ~2 minutes for provisioning
6. Once ready, go to **Project Settings → Database → Connection string → URI**
7. Copy the **Session pooler** URL — it looks like:
   `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
8. Paste into `.env.local` as `DATABASE_URL=...` (also paste `DIRECT_URL=...` with the direct connection string)
9. Run:
   ```bash
   npx prisma db push      # creates all 24 tables
   npx prisma db seed      # seeds your demo data (optional)
   ```

**Cost:** Free forever for projects under 500 MB and 2 GB egress/month —
which you won't hit for a long time. Their paid tier starts at $25/mo
when you outgrow that.

**Why Supabase over other options:**
- Postgres + auth + storage + realtime in one product
- Row-level security maps cleanly to our multi-user data model
- pgvector is included for AI memory embeddings (you'd otherwise need
  Pinecone at ~$70/mo)

---

## ② Deploy to the web (Vercel) — 5 minutes, free

This makes your app accessible at a real URL like `avori-os.vercel.app`
or `os.yourdomain.com`. Anyone you give the link to can use it.

### Step 1 — Push your code to GitHub
You've already done this. The repo is at
`github.com/sayedbusiness/The-Tracker`.

### Step 2 — Sign up for Vercel
1. Go to [vercel.com](https://vercel.com) → "Sign up"
2. Choose "Continue with GitHub"
3. Authorize Vercel to read your repos

### Step 3 — Import the repo
1. Dashboard → "Add New… → Project"
2. Find `The-Tracker` in the list → click "Import"
3. Vercel auto-detects Next.js — leave all defaults
4. Click "Environment Variables" and add:

   | Key | Value (paste from your `.env.local`) |
   |---|---|
   | `ANTHROPIC_API_KEY` | your new (rotated) Anthropic key |
   | `ANTHROPIC_MODEL` | `claude-opus-4-7` |
   | `GEMINI_API_KEY` | your new (rotated) Gemini key |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |

   *(Skip `DATABASE_URL` until you've set up Supabase — Vercel will use
   the mock data layer if it's missing.)*

5. Click **Deploy**

In ~90 seconds you'll have a live URL. Every future `git push` to the
`claude/productivity-system-design-GUnfJ` branch auto-deploys a preview;
merging to `main` deploys to production.

**Cost:** Free forever for personal projects (Hobby tier). You'd only
hit limits if your app gets thousands of users per day.

### Step 4 — (Optional) Custom domain
1. Buy a domain anywhere ([Cloudflare Registrar](https://cloudflare.com)
   is cheapest, ~$10/yr for `.com`)
2. In Vercel project → Settings → Domains → add your domain
3. Vercel shows you DNS records to add at your registrar — paste them
4. SSL cert provisioned automatically in ~5 minutes

---

## ③ Apple Developer — the truth about cost

Yes, the Apple Developer Program **costs $99/year**. There's no way around
it if you want to publish to the App Store or distribute beta builds via
TestFlight. Here's the breakdown:

### What $99/year gets you
- TestFlight (beta-test on real iPhones — up to 10,000 testers)
- Submit to the App Store
- Code-signing certificates (so apps install on real devices, not just simulator)
- Push notifications
- All the entitlements (HealthKit, in-app purchase, etc.)

### What if you don't pay?
You can still:
- Run the app on iOS Simulator on your Mac (free, but only on Mac)
- Run on your own physical iPhone for 7 days at a time using a free Apple ID
  (the app expires and must be re-signed weekly)
- Use the PWA install path — works on every iPhone today, no Apple
  Developer account required, runs full-screen, no App Store

**My honest recommendation:** Don't pay the $99 until you have actual
users asking for App Store distribution. The PWA experience on iPhone
in 2026 is genuinely good — full-screen, home-screen icon, push
notifications via Web Push, even works offline. You can run for months
without paying Apple a dollar.

### When you're ready to pay
1. Go to [developer.apple.com](https://developer.apple.com/programs/)
2. Click "Enroll"
3. Sign in with your Apple ID (or create one)
4. Choose **Individual** ($99/yr) unless you have a registered LLC/business
   (then choose **Organization** — same price but needs a D-U-N-S number)
5. Pay with credit card → wait 24–48 hours for approval
6. You'll get an email when you're in

### Publishing the actual app (after enrollment)
```bash
# One-time: install Capacitor
npm i -D @capacitor/cli @capacitor/core @capacitor/ios

# Switch Next.js to static export mode for native builds
# (Edit next.config.ts — add `output: "export"`)

npm run build
npx cap add ios          # creates ios/ folder
npx cap open ios         # opens Xcode

# In Xcode:
# 1. Select "Avori OS" → "Signing & Capabilities" → check "Automatically manage signing"
# 2. Team: pick your Apple Developer account
# 3. Bundle ID: co.avorigrowth.os (matches capacitor.config.ts)
# 4. Product → Archive → "Distribute App" → "App Store Connect"
```

This walks you through TestFlight (for beta testers) or App Store
submission (review takes 24–72 hours).

---

## ④ Google Play Store — much cheaper

Google charges a **one-time $25 fee** to publish to Play Store, ever.

1. Go to [play.google.com/console](https://play.google.com/console)
2. Sign in with Google → "Get started"
3. Choose "Personal" or "Organization"
4. Pay $25 → instant access (sometimes 1–2 day verification)

Publishing flow:
```bash
npm i -D @capacitor/android
npm run build
npx cap add android
npx cap open android      # opens Android Studio
# Build → Generate Signed Bundle → upload .aab to Play Console
```

---

## ⑤ Native Mac/Windows desktop — free unless you sign

You can build the desktop apps for free right now:

```bash
# One-time setup (requires Rust):
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
npm i -D @tauri-apps/cli @tauri-apps/api

# Build for your current platform:
npx tauri build
```

Output lands in `src-tauri/target/release/bundle/`:
- macOS: `.dmg` installer + `.app` bundle
- Windows: `.msi` and `.exe` installers
- Linux: `.deb` and `.AppImage`

**The catch:** unsigned builds trigger scary warnings ("Avori OS can't be
opened because it is from an unidentified developer"). For personal use,
right-click → Open works fine.

**To remove the warnings (production distribution):**
- Mac: $99/yr Apple Developer (same one as iOS) → notarize via `xcrun notarytool`
- Windows: $200–400/yr from DigiCert or Sectigo for an EV code-signing cert

For personal use on your own machines: skip both. Just enable
right-click-open the first time you launch.

---

## ⑥ The honest order I'd do this in

If I were you, here's the sequence with no wasted spend:

1. **Today, $0** — Push your branch, deploy to Vercel, install as a PWA
   on your iPhone and Mac. You now have the full app on every device
   you own, accessible from a URL or your home screen.

2. **When the AI usage gets meaningful** — top up the Anthropic key
   (~$5/mo to start, you'll know when). Same for Gemini.

3. **When you want data to persist across devices** — spin up Supabase,
   paste the URL into Vercel env, run `npx prisma db push`. Still $0.

4. **When you want to share TestFlight links with friends or list on
   the App Store** — pay Apple $99. Not before.

5. **When you want a native Mac/Windows binary on someone else's
   machine without scary warnings** — Apple Developer for Mac
   notarization. Skip Windows EV cert unless you're going commercial.

6. **When you want a custom domain** — buy `avori.yourname.com` for
   ~$10/yr at Cloudflare and point it at Vercel.

The whole thing runs at **$0/month** for personal use indefinitely.
API usage will be a few dollars a month at most.

---

## Security: rotate those keys

Now that everything is working, **rotate both API keys** at:

1. [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
   → delete the current one → create a new one → paste into `.env.local`
   AND into Vercel env vars

2. [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   → same process

Restart your dev server (`npm run dev`) after updating `.env.local`.
Vercel auto-redeploys when you update env vars in their dashboard.

The keys you shared in chat earlier should be considered compromised
even if no one else has seen them — chat transcripts get logged,
screenshots happen, devices get stolen. Rotating is a 60-second hygiene
habit that saves you from a 6-figure bill if a key leaks.

---

## Push notifications (works when the app is CLOSED)

This sends real notifications to your phone even when Avori isn't open —
via the service worker (`public/sw.js`) + Web Push. Subscriptions are
stored in the existing `apex_state` table (no new table needed).

> **iPhone requirement (Apple's rule, not ours):** Web Push only works
> from an **installed** PWA. On your phone, open the site in Safari → tap
> **Share** → **Add to Home Screen**, then open Avori from that icon.
> Notifications enabled from a normal Safari tab will *not* fire.

### 1. Add these env vars in Vercel (Settings → Environment Variables)

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | your VAPID **public** key |
| `VAPID_PRIVATE_KEY` | your VAPID **private** key |
| `VAPID_SUBJECT` | *(optional)* `mailto:you@email.com` |
| `CRON_SECRET` | *(recommended)* any long random string |

`SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` are already set
and are reused to store subscriptions.

Generate a fresh VAPID pair anytime with:

```bash
npx web-push generate-vapid-keys
```

### 2. Redeploy, then test

1. Open the **installed** PWA → **Settings → Phone notifications →
   Turn on notifications** (grant permission).
2. Tap **Send test** — your phone should buzz within a second or two,
   even with the app backgrounded.

### 3. Scheduled "come back" nudges

`vercel.json` registers one daily cron (`/api/cron/reminders`, ~8 PM PT)
that pushes an end-of-day "close strong / don't break your streak" nudge
to every subscribed device. The message auto-adapts to morning / midday /
evening, so on a **Vercel Pro** plan you can add more schedules:

```json
"crons": [
  { "path": "/api/cron/reminders", "schedule": "0 14 * * *" },
  { "path": "/api/cron/reminders", "schedule": "0 20 * * *" },
  { "path": "/api/cron/reminders", "schedule": "0 3  * * *" }
]
```

(Hobby plan allows ~2 crons, once/day — that's why the default ships
with just one.) Vercel sends `Authorization: Bearer $CRON_SECRET`
automatically. You can fire one manually to test:
`curl "https://<your-app>/api/cron/reminders?secret=<CRON_SECRET>"`.

---

## Native background step tracking (HealthKit — needs a native build)

**Reality check:** a website *cannot* count steps while it's closed —
iOS only exposes background step data to a **native app** through
HealthKit. The web build uses the in-app accelerometer pedometer (it
counts while Avori is open). To get true always-on, background steps you
have to ship the native shell. The code is already wired
(`src/lib/health/native-steps.ts`) — it auto-activates inside the native
app and stays dormant on the web.

### What you need (one-time)

- A **Mac** with **Xcode**
- An **Apple Developer** account ($99/yr) to install on a real device / ship

### Steps

```bash
# 1. Install Capacitor + a Health plugin
npm i @capacitor/core @capacitor/cli @capacitor/ios
npm i capacitor-health        # or @capacitor-community/health

# 2. Static-export the web app for the native shell
#    (set output: "export" in next.config.ts for the native build)
npm run build

# 3. Create the iOS project and sync
npx cap add ios
npx cap sync ios

# 4. In Xcode: enable the HealthKit capability
#    Signing & Capabilities → + Capability → HealthKit
#    Bundle ID: co.avorigrowth.os (matches capacitor.config.ts)

# 5. Add the usage strings to ios/App/App/Info.plist:
#    NSHealthShareUsageDescription = "Avori reads your step count to track movement."
#    NSHealthUpdateUsageDescription = "Avori logs activity to your health data."

# 6. Run on your iPhone
npx cap run ios
```

Once installed, `native-steps.ts` calls the Health plugin's
`requestAuthorization` + `queryAggregated({ dataType: "steps" })` each
minute and mirrors the real daily total (which iOS counts in the
background via the motion coprocessor) into Avori. If your chosen plugin
names the data type differently, adjust the `dataType` string in
`native-steps.ts` — everything else is generic.

> Shipping to the App Store / TestFlight is the Apple flow: Product →
> Archive → Distribute. There's no way to "promote a native app to
> production" from the web dashboard — it's a separate binary.
