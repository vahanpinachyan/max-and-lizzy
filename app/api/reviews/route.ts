import { NextResponse } from "next/server";
import { submitReview, ReviewSubmissionError } from "@/lib/reviews";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { orderId, productSlug, rating, title, body, authorName } = payload as Record<string, unknown>;

  if (
    typeof orderId !== "string" ||
    typeof productSlug !== "string" ||
    typeof rating !== "number" ||
    typeof title !== "string" ||
    typeof body !== "string" ||
    typeof authorName !== "string"
  ) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  try {
    await submitReview({ orderId, productSlug, rating, title, body, authorName });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ReviewSubmissionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[api/reviews] Unexpected error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
