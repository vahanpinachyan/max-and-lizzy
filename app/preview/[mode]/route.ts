import { NextResponse } from "next/server";
import { CHRISTMAS_MODE, SEASON_COOKIE } from "@/lib/season";

/**
 * The staff preview switch, as two links anyone can open.
 *
 *   /preview/christmas — dress this browser for Christmas
 *   /preview/off       — undress it again
 *
 * lib/season-server.ts has always honoured a `ml-season` cookie; until now
 * nothing set one, so previewing out of season meant editing a cookie by
 * hand in developer tools. That is fine on a laptop and impossible on a
 * phone, which is exactly where the seasonal layout most needs looking at.
 *
 * It only ever changes which decorations render. There is nothing behind it
 * to reach: no data, no prices, no orders, no admin. The worst a stranger
 * who guesses the URL can do is give themselves tinsel.
 *
 * CHRISTMAS_MODE still wins. With the master switch off this route refuses,
 * so a cookie sitting in someone's browser can never put the decorations
 * back after the season has been ended deliberately.
 */

const MODES = {
  christmas: "christmas",
  off: "off",
} as const;

// A year: long enough that staff set it once and forget it, and harmless
// because the value is read only as an override of today's date.
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mode: string }> },
) {
  const { mode } = await params;
  const value = MODES[mode as keyof typeof MODES];

  if (!value) {
    return new NextResponse(
      "Unknown preview mode. Use /preview/christmas or /preview/off.",
      { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  if (!CHRISTMAS_MODE) {
    return new NextResponse(
      "The Christmas layer is switched off in the code, so there is nothing to preview.",
      { status: 409, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  // A relative Location would be resolved against the deployment's own
  // hostname, which is what we want on a preview URL as much as on the live
  // site, so the redirect is built from the incoming request's origin.
  const response = NextResponse.redirect(new URL("/", _request.url), 303);

  response.cookies.set(SEASON_COOKIE, value, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
