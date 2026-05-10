# Tauri 2 — desktop shells for APEX OS

This directory holds the Tauri 2 configuration for native macOS, Windows,
and Linux desktop builds. The Tauri runtime wraps the Next.js PWA in a
~10 MB native binary with system tray, global shortcuts, and OS-level
notifications.

## One-time setup

You need the Rust toolchain (`rustup`) and the platform SDKs:

- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Windows:** Microsoft C++ Build Tools + WebView2
- **Linux:** `libwebkit2gtk-4.1-dev libssl-dev` and friends

Then:

```bash
npm i -D @tauri-apps/cli @tauri-apps/api
cargo install create-tauri-app --locked    # one-time
```

## Dev

```bash
npx tauri dev
```

This launches a native window pointed at `http://localhost:3000` (the
`devUrl` in `tauri.conf.json`). Hot-reload from the Next dev server
flows through to the desktop shell.

## Production builds

```bash
# Switch next.config.ts to `output: "export"` first (for static export)
npm run build
npx tauri build
```

Output binaries land in `src-tauri/target/release/bundle/` — `.dmg`
for macOS, `.msi` + `.nsis` for Windows, `.deb` + `.AppImage` for Linux.

## What's configured

- App identifier: `co.apexgrowth.os`
- Window: 1440×900 default, 1024×720 min, overlay titlebar (looks native
  on macOS while letting our CSS chrome sit edge-to-edge)
- Tray icon: enabled, shows on left-click of the menubar item
- Global shortcuts: plugin enabled so we can register ⌘+space-style
  hotkeys to open the command palette from anywhere
- CSP: restricts outbound calls to Anthropic, Supabase, and OpenAI

## Next steps (out of scope for v0.1)

- [ ] Generate the icon set into `icons/` (use `npx tauri icon ../public/icon.svg`)
- [ ] Wire global shortcut → command palette via `tauri-plugin-global-shortcut`
- [ ] Add deep links so push notifications open specific routes
- [ ] Auto-updater config (`tauri-plugin-updater`)
- [ ] Code-signing certificates (Apple Developer ID + Windows Authenticode)
