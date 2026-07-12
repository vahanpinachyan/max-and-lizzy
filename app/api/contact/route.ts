import { NextResponse } from "next/server";
import { site } from "@/data/site";

// Minimal contact form handler. Currently logs submissions and, if
// RESEND_API_KEY is configured, emails the store. TODO: connect to a real
// inbox/CRM before launch — see README "Before you launch" checklist.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please fill out all fields with a valid email." }, { status: 400 });
  }

  console.log(`[contact] ${name} <${email}> — ${subject}\n${message}`);

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: `${site.name} Website <contact@${new URL(site.url).hostname}>`,
        to: site.email,
        replyTo: email,
        subject: `Contact form: ${subject || "New message"}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
      });
    } catch (error) {
      console.error("[contact] Failed to send email:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
