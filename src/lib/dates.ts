/**
 * Centralized date helpers — every "today" key in the app runs through
 * here so the timezone behavior is uniform.
 *
 * Sayed is in California, so all calendar/day-bucketing math happens
 * in America/Los_Angeles. Using `toISOString().slice(0,10)` (UTC) would
 * cause the "today" key to roll over to the next day at 4 PM Pacific
 * during DST, which silently throws away your logs.
 */

export const APP_TZ = "America/Los_Angeles";

/** ISO date (yyyy-mm-dd) for the current moment in the user's timezone. */
export function todayKey(now: Date = new Date()): string {
  return dateKey(now);
}

/** ISO date (yyyy-mm-dd) for any Date in the user's timezone. */
export function dateKey(d: Date): string {
  // en-CA gives "yyyy-mm-dd" reliably; pin the TZ to override the
  // server's UTC clock.
  return d.toLocaleDateString("en-CA", { timeZone: APP_TZ });
}

/** "Monday, May 25" style label in the user's timezone. */
export function dayLabel(d: Date = new Date()): string {
  return d.toLocaleDateString("en-US", {
    timeZone: APP_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Current hour 0-23 in the user's timezone. */
export function hourPT(d: Date = new Date()): number {
  const s = d.toLocaleTimeString("en-US", {
    timeZone: APP_TZ,
    hour12: false,
    hour: "2-digit",
  });
  // "00" through "23"
  return Number(s);
}

/** Current minute 0-59 in the user's timezone. */
export function minutePT(d: Date = new Date()): number {
  const parts = d
    .toLocaleTimeString("en-US", {
      timeZone: APP_TZ,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
    .split(":");
  return Number(parts[1]);
}

/** Minutes since midnight in the user's timezone (0-1439). */
export function minutesOfDayPT(d: Date = new Date()): number {
  return hourPT(d) * 60 + minutePT(d);
}

/** Greeting based on local time. */
export function getGreeting(d: Date = new Date()): string {
  const h = hourPT(d);
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Late night grind";
}

/** "Monday, May 25" — alias for top-bar use. */
export const getDayLabel = dayLabel;

/**
 * Monday-anchored ISO week key in the user's timezone (matches the
 * habit-grid week bucketing). Habits + weekly state roll over Monday
 * morning PT.
 */
export function weekKeyMonday(now: Date = new Date()): string {
  const today = dateKey(now);
  const d = new Date(today + "T12:00:00Z");
  const weekdayShort = d.toLocaleString("en-US", {
    timeZone: APP_TZ,
    weekday: "short",
  });
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const jsDay = map[weekdayShort] ?? 1;
  const offset = jsDay === 0 ? 6 : jsDay - 1;
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}
