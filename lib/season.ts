/**
 * The Christmas season switch.
 *
 * Two independent controls, both of which must say yes:
 *
 *   1. CHRISTMAS_MODE — the master switch. Set it to `false` and the site
 *      returns to its ordinary self immediately, whatever the date. This is
 *      the "one step" removal: nothing else needs editing.
 *   2. CHRISTMAS_WINDOW — the dates it is allowed to run between. Set it to
 *      `null` to ignore dates entirely and let CHRISTMAS_MODE decide alone.
 *
 * Nothing in here imports `next/headers`, so it is safe in Client Components
 * and can be unit-tested without mocking the clock. The cookie-aware server
 * read lives in lib/season-server.ts — same split as lib/i18n/locales.ts and
 * lib/i18n/server.ts.
 */
import { SHOP_UTC_OFFSET_HOURS } from "@/lib/pricing";

export type Season = "christmas" | "none";

/** Master switch. `false` restores the ordinary site everywhere, at once. */
export const CHRISTMAS_MODE = true;

/**
 * Month/day rather than full dates, so the window repeats every year without
 * anyone having to remember to edit it. Both ends are inclusive: the dressing
 * is up all day on 1 December and all day on 7 January, and gone on the 8th.
 *
 * The far end is deliberately past 25 December. In Armenia the gift-giving
 * occasion is New Year — Dzmer Papik comes on the 31st — the Apostolic Church
 * marks the Nativity on 6 January, and Russian-speaking customers keep
 * Christmas on the 7th. A window that closed on Boxing Day would shut just as
 * the shop's own customers start buying.
 */
export const CHRISTMAS_WINDOW = {
  start: { month: 12, day: 1 },
  end: { month: 1, day: 7 },
} as const;

/**
 * Staff preview override, read from the `ml-season` cookie by
 * lib/season-server.ts. `christmas` forces the dressing on out of season so it
 * can be reviewed before 1 December; `off` forces it off during the season.
 * Neither changes what anyone else sees. Same mechanism as the locale cookie.
 */
export const SEASON_COOKIE = "ml-season";

/**
 * Whether a given instant falls inside the window, in the shop's own calendar
 * day. Armenia is UTC+4 year-round (no daylight saving since 2012), so
 * shifting the instant and reading its UTC parts gives Yerevan's date.
 *
 * Pure: no cookies, no `new Date()` of its own, so it is fully testable.
 */
export function seasonForDate(now: Date): Season {
  if (!CHRISTMAS_MODE) return "none";
  if (!CHRISTMAS_WINDOW) return "christmas";

  const shifted = new Date(now.getTime() + SHOP_UTC_OFFSET_HOURS * 3600_000);
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();

  const { start, end } = CHRISTMAS_WINDOW;
  // The window straddles New Year, so it is two ranges, not one.
  if (month === start.month && day >= start.day) return "christmas";
  if (month === end.month && day <= end.day) return "christmas";
  return "none";
}
