import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";
import { upsertContact, sendPlacedOrderEvent } from "@/lib/omnisend";

export { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

// sku/imageUrl are snapshotted onto OrderItem the same as name/price, so
// staff can identify and pull the right item even if the product is later
// edited or deleted (see prisma/schema.prisma OrderItem).
function extractProductInfo(
  product: Stripe.Product | Stripe.DeletedProduct | string | null | undefined
): { metadata?: Record<string, string>; imageUrl?: string } {
  if (product && typeof product === "object" && !product.deleted) {
    return { metadata: product.metadata, imageUrl: product.images?.[0] };
  }
  return {};
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
  const notes = session.metadata?.notes || null;

  // The checkout route suffixes the line item name with "(CODE applied)"
  // when a promo code was used — recovered here best-effort for display.
  // The actual discount was already computed and validated server-side at
  // checkout time; this isn't re-deriving anything security-sensitive.
  let promoCode: string | null = null;
  const items = lineItems.data.map((li) => {
    const { metadata: meta, imageUrl } = extractProductInfo(li.price?.product);
    const rawName = li.description ?? "Item";
    const match = rawName.match(/^(.*) \(([A-Z0-9]+) applied\)$/);
    if (match && !promoCode) promoCode = match[2];
    return {
      productSlug: meta?.slug ?? null,
      productName: match ? match[1] : rawName,
      sku: meta?.sku || null,
      imageUrl: imageUrl ?? null,
      priceAmd: li.price ? Math.round((li.price.unit_amount ?? 0) / 100) : 0,
      quantity: li.quantity ?? 1,
    };
  });

  const totalAmd = Math.round((session.amount_total ?? 0) / 100);
  const order = await prisma.order.create({
    data: {
      stripeSessionId: session.id,
      paymentProvider: "stripe",
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
      notes,
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

interface PendingIdramOrderRow {
  id: string;
  amountAmd: number;
  itemsJson: string;
  fulfillmentMethod: string | null;
  deliveryAddressJson: string | null;
  giftWrap: boolean;
  giftMessage: string | null;
  notes: string | null;
  promoCode: string | null;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
}

/**
 * Turns a confirmed Idram payment into a persisted Order + Customer record.
 * Idempotent, same as createOrderFromSession above — Idram's RESULT_URL
 * callback can in principle be retried, so this is safe to call more than
 * once for the same bill number.
 *
 * Unlike Stripe, Idram has no server-side session to read cart contents
 * back from, so the cart/customer details were captured into a
 * PendingIdramOrder row before the customer was redirected to Idram (see
 * app/api/checkout/idram/route.ts) — this reads that row back.
 */
export async function createOrderFromIdramPayment(pending: PendingIdramOrderRow) {
  const existing = await prisma.order.findUnique({
    where: { idramBillNo: pending.id },
    include: { items: true },
  });
  if (existing) return existing;

  const items = JSON.parse(pending.itemsJson) as {
    slug: string;
    sku?: string;
    imageSrc?: string;
    name: string;
    unitPriceAmd: number;
    quantity: number;
  }[];

  const customer = await prisma.customer.upsert({
    where: { email: pending.customerEmail },
    update: {
      name: pending.customerName ?? undefined,
      phone: pending.customerPhone ?? undefined,
    },
    create: {
      email: pending.customerEmail,
      name: pending.customerName ?? undefined,
      phone: pending.customerPhone ?? undefined,
    },
  });

  const order = await prisma.order.create({
    data: {
      idramBillNo: pending.id,
      paymentProvider: "idram",
      customerId: customer.id,
      status: "pending",
      fulfillmentMethod: pending.fulfillmentMethod,
      totalAmd: pending.amountAmd,
      promoCode: pending.promoCode,
      shippingAddress: pending.deliveryAddressJson,
      customerName: pending.customerName,
      customerPhone: pending.customerPhone,
      giftWrap: pending.giftWrap,
      giftMessage: pending.giftMessage,
      notes: pending.notes,
      items: {
        create: items.map((item) => ({
          productSlug: item.slug,
          productName: item.name,
          sku: item.sku || null,
          imageUrl: item.imageSrc ? absoluteUrl(item.imageSrc) : null,
          priceAmd: item.unitPriceAmd,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  const [firstName, ...rest] = (pending.customerName ?? "").trim().split(/\s+/);
  await upsertContact({
    email: pending.customerEmail,
    firstName: firstName || undefined,
    lastName: rest.join(" ") || undefined,
  });
  await sendPlacedOrderEvent({
    email: pending.customerEmail,
    orderId: order.id,
    totalAmd: pending.amountAmd,
    items: items.map((item) => ({
      productSlug: item.slug,
      productName: item.name,
      priceAmd: item.unitPriceAmd,
      productUrl: `${site.url}/product/${item.slug}`,
    })),
  });

  return order;
}
