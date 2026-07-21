import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { site } from "@/data/site";
import { formatAmd } from "@/lib/format";
import { createOrderFromSession } from "@/lib/orders";

// Stripe webhook endpoint. Configure this URL (https://yourdomain.com/api/webhook)
// in the Stripe Dashboard and set STRIPE_WEBHOOK_SECRET — see .env.example
// and the README "Stripe setup" section.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured" },
      { status: 500 }
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[webhook] Signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(`[webhook] Order completed: ${session.id}, total: ${session.amount_total}`);
    let order: Awaited<ReturnType<typeof createOrderFromSession>> = null;
    try {
      order = await createOrderFromSession(session);
    } catch (error) {
      console.error("[webhook] Failed to create order record:", error);
    }
    await sendOrderConfirmationEmail(session);
    if (order) await sendNewOrderNotificationEmail(order, session);
  }

  return NextResponse.json({ received: true });
}

async function sendOrderConfirmationEmail(session: Stripe.Checkout.Session) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = session.customer_details?.email;
  if (!apiKey || !toEmail) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} <info@${new URL(site.url).hostname}>`,
      to: toEmail,
      replyTo: site.email,
      subject: `Your ${site.name} order is confirmed`,
      html: `<p>Thank you for your order! We'll have it ready for pickup or delivery soon.</p>
             <p>Order reference: ${session.id.slice(-12)}</p>
             <p>Questions? Reply to this email or visit us at ${site.address.street}.</p>`,
    });
  } catch (error) {
    console.error("[webhook] Failed to send confirmation email:", error);
  }
}

// Lets staff know a new order needs fulfilling without having to keep
// /admin/orders open — sent to the store's own inbox (site.email), not the
// customer. Reply-to is set to the customer so a reply goes straight to them.
async function sendNewOrderNotificationEmail(
  order: NonNullable<Awaited<ReturnType<typeof createOrderFromSession>>>,
  session: Stripe.Checkout.Session
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const customerName = session.customer_details?.name || "A customer";
  const customerEmail = session.customer_details?.email ?? undefined;
  const itemsList = order.items
    .map((item) => `<li>${item.quantity} × ${item.productName} — ${formatAmd(item.priceAmd)}</li>`)
    .join("");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} Website <info@${new URL(site.url).hostname}>`,
      to: site.email,
      replyTo: customerEmail,
      subject: `New order from ${customerName} — ${formatAmd(order.totalAmd)}`,
      html: `<p><strong>${customerName}</strong> (${customerEmail ?? "no email"}) just placed an order.</p>
             <ul>${itemsList}</ul>
             <p><strong>Total:</strong> ${formatAmd(order.totalAmd)}</p>
             <p><strong>Fulfillment:</strong> ${order.fulfillmentMethod ?? "not specified"}</p>
             <p><a href="${site.url}/admin/orders/${order.id}">View this order in the admin panel →</a></p>`,
    });
  } catch (error) {
    console.error("[webhook] Failed to send new-order notification email:", error);
  }
}
