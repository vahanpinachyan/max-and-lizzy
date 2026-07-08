import { NextResponse } from "next/server";

// Minimal newsletter signup endpoint. Currently logs the submission.
// TODO: wire up to a real list provider (Resend Audiences, Mailchimp, etc.)
// before launch — see README "Before you launch" checklist.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const source = typeof body?.source === "string" ? body.source : "footer";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  console.log(`[newsletter] signup: ${email} (source: ${source})`);

  return NextResponse.json({ ok: true });
}
