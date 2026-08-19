import "server-only";
import { prisma } from "@/lib/db";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";
import { upsertContact, sendPlacedOrderEvent } from "@/lib/omnisend";

export { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

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
 * Idempotent — Idram's RESULT_URL callback can in principle be retried, so
 * this is safe to call more than once for the same bill number.
 *
 * Idram has no server-side session to read cart contents back from, so the
 * cart/customer details were captured into a PendingIdramOrder row before
 * the customer was redirected to Idram (see
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
      imageUrl: item.imageSrc ? absoluteUrl(item.imageSrc) : undefined,
    })),
  });

  return order;
}

interface PendingArcaOrderRow {
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
 * Turns a confirmed ArCa (ACBA vPOS) payment into a persisted Order +
 * Customer record. Idempotent, same as createOrderFromIdramPayment above —
 * see app/(site)/checkout/arca/return, which is the only caller and can in
 * principle render more than once for the same pending order (back button,
 * page refresh).
 */
export async function createOrderFromArcaPayment(pending: PendingArcaOrderRow) {
  const existing = await prisma.order.findUnique({
    where: { arcaOrderId: pending.id },
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
      arcaOrderId: pending.id,
      paymentProvider: "arca",
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
      imageUrl: item.imageSrc ? absoluteUrl(item.imageSrc) : undefined,
    })),
  });

  return order;
}
