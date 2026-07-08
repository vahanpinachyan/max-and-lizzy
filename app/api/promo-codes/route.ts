import { NextResponse } from "next/server";
import { findPromoCode } from "@/data/promo-codes";

// Client-side promo validation for instant cart-page feedback. The actual
// charge always re-validates the code server-side again in /api/checkout —
// this route only powers the UI, it's never trusted for pricing.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const promo = await findPromoCode(code);
  return NextResponse.json({ promo });
}
