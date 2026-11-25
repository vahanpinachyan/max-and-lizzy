import "server-only";
import { cookies } from "next/headers";
import { CHRISTMAS_MODE, seasonForDate, SEASON_COOKIE, type Season } from "@/lib/season";

/**
 * The season to render, honouring the staff preview cookie.
 *
 * CHRISTMAS_MODE is checked first and cannot be overridden by the cookie.
 * That is the whole point of the master switch: with it off, there is no
 * request — and no stale cookie in anyone's browser — that can put the
 * decorations back.
 *
 * Reading a cookie opts a route into dynamic rendering, but the site's layout
 * already reads the locale cookie on every request (lib/i18n/server.ts), so
 * this costs nothing that was not already being paid.
 */
export async function getSeason(now: Date = new Date()): Promise<Season> {
  if (!CHRISTMAS_MODE) return "none";

  const override = (await cookies()).get(SEASON_COOKIE)?.value;
  if (override === "christmas") return "christmas";
  if (override === "off") return "none";
  return seasonForDate(now);
}
