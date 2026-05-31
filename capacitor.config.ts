/**
 * Capacitor 6 — wraps the Next.js PWA into iOS + Android native shells.
 *
 * This file is read by `npx cap` once you install @capacitor/cli. The type
 * import is intentionally inlined so this file ships in the repo without
 * forcing the Capacitor toolchain to be installed.
 *
 *  Setup (one time):
 *    npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
 *    npm run build && npx next export -o ./out
 *    npx cap add ios
 *    npx cap add android
 *
 *  Iterate:
 *    npm run build && npx cap sync && npx cap open ios   # → Xcode
 *    npm run build && npx cap sync && npx cap open android # → Android Studio
 *
 *  The webDir below points at the static export Next produces when you
 *  switch `output: "export"` in next.config.ts for native builds.
 */
const config = {
  appId: "co.apexgrowth.os",
  appName: "Avori OS",
  webDir: "out",
  bundledWebRuntime: false,
  backgroundColor: "#050507",
  ios: {
    contentInset: "always",
    backgroundColor: "#050507",
  },
  android: {
    backgroundColor: "#050507",
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#050507",
      androidSplashResourceName: "splash",
      iosSpinnerStyle: "small",
      spinnerColor: "#7c3aed",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#050507",
    },
  },
};

export default config;
