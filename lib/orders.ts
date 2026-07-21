import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { site } from "@/data/site";
import { upsertContact, sendPlacedOrderEvent } from "@/lib/omnisend";

export { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

function extractProductMetadata(
  product: Stripe.Product | Stripe.DeletedProduct | string | null | undefined
): Record<string, string> | undefined {
  if (product && typeof product === "object" && !product.deleted) {
    return product.metadata;
  }
  return undefined;
}

/**
 * Turns a completed Stripe Checkout Session into a persisted Order +
 * Customer record. Idempotent — Stripe can redeliver the same webhook
 * event, so this is safe to call more than once for the same session.
 */
export async function createOrderFromSession(session: Stripe.Checkout.Session) {
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { items: true },
  });
  if (existing) return existing;

  const email = session.customer_details?.email;
  if (!email) {
    console.warn(`[orders] Session ${session.id} has no customer email — skipping order record.`);
    return null;
  }

  const stripe = getStripe();
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {
      name: session.customer_details?.name ?? undefined,
      phone: session.customer_details?.phone ?? undefined,
    },
    create: {
      email,
      name: session.customer_details?.name ?? undefined,
      phone: session.customer_details?.phone ?? undefined,
    },
  });

  const fulfillmentMethod = session.metadata?.fulfillment_method ?? null;
  const giftWrap = session.metadata?.gift_wrap === "true";
  const giftMessage = session.metadata?.gift_message || null;

  // The checkout route suffixes the line item name with "(CODE applied)"
  // when a promo code was used — recovered here best-effort for display.
  // The actual discount was already computed and validated server-side at
  // checkout time; this isn't re-deriving anything security-sensitive.
  let promoCode: string | null = null;
  const items = lineItems.data.map((li) => {
    const meta = extractProductMetadata(li.price?.product);
    const rawName = li.description ?? "Item";
    const match = rawName.match(/^(.*) \(([A-Z0-9]+) applied\)$/);
    if (match && !promoCode) promoCode = match[2];
    return {
      productSlug: meta?.slug ?? null,
      productName: match ? match[1] : rawName,
      priceAmd: li.price ? Math.round((li.price.unit_amount ?? 0) / 100) : 0,
      quantity: li.quantity ?? 1,
    };
  });

  const totalAmd = Math.round((session.amount_total ?? 0) / 100);
  const order = await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      customerId: customer.id,
      status: "pending",
      fulfillmentMethod,
      totalAmd,
      promoCode,
      shippingAddress: session.metadata?.delivery_address || null,
      customerName: session.customer_details?.name ?? null,
      customerPhone: session.customer_details?.phone ?? null,
      giftWrap,
      giftMessage,
      items: { create: items },
    },
    include: { items: true },
  });

  // Best-effort marketing sync — never blocks order creation. Keeps the
  // Omnisend contact record and segmentation/automation data (post-purchase
  // flows, revenue reporting) up to date with real orders.
  const [firstName, ...rest] = (session.customer_details?.name ?? "").trim().split(/\s+/);
  await upsertContact({
    email,
    firstName: firstName || undefined,
    lastName: rest.join(" ") || undefined,
  });
  await sendPlacedOrderEvent({
    email,
    orderId: order.id,
    totalAmd,
    items: items.map((item) => ({
      productSlug: item.productSlug,
      productName: item.productName,
      priceAmd: item.priceAmd,
      productUrl: item.productSlug ? `${site.url}/product/${item.productSlug}` : undefined,
    })),
  });

  return order;
}
