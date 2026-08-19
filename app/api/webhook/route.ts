import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createOrderFromSession } from "@/lib/orders";
import { sendNewOrderNotificationEmail } from "@/lib/checkout-emails";

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
    if (order) await sendNewOrderNotificationEmail(order, session.customer_details?.email);
  }

  return NextResponse.json({ received: true });
}
