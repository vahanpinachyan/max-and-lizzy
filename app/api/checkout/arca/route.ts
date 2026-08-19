import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerArcaOrder, isArcaConfigured } from "@/lib/arca";
import { absoluteUrl } from "@/lib/seo";
import { isLocale, defaultLocale } from "@/lib/i18n/locales";
import { validateCheckoutRequest, type CheckoutRequestItem, type DeliveryAddressInput } from "@/lib/checkout-validation";

export async function POST(request: Request) {
  if (!isArcaConfigured()) {
    return NextResponse.json({ error: "Card payments aren't set up yet. Please choose another payment method." }, { status: 500 });
  }

  let body: {
    items?: CheckoutRequestItem[];
    promoCode?: string | null;
    fulfillmentMethod?: string;
    giftWrap?: boolean;
    giftMessage?: string;
    deliveryAddress?: DeliveryAddressInput;
    email?: string;
    name?: string;
    phone?: string;
    notes?: string;
    locale?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Like Idram, EPG's hosted payment page never gives us the customer's
  // email — it has to be collected on our own page before redirecting.
  const email = String(body.email ?? "").trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const validated = await validateCheckoutRequest(body);
  if (validated.error !== null) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { lineItems, fulfillment, deliveryAddress, giftWrap, giftMessage, notes, promoCode, totalAmd } = validated.data;
  const language = isLocale(body.locale) ? body.locale : defaultLocale;

  const pending = await prisma.pendingArcaOrder.create({
    data: {
      amountAmd: totalAmd,
      itemsJson: JSON.stringify(
        lineItems.map((item) => ({
          slug: item.slug,
          sku: item.sku,
          imageSrc: item.imageSrc,
          name: item.name,
          unitPriceAmd: item.unitPriceAmd,
          quantity: item.quantity,
        }))
      ),
      fulfillmentMethod: fulfillment.id,
      deliveryAddressJson: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
      giftWrap,
      giftMessage: giftMessage || null,
      notes,
      promoCode,
      customerEmail: email,
      customerName: String(body.name ?? "").trim() || null,
      customerPhone: String(body.phone ?? "").trim() || null,
      locale: language,
    },
  });

  const registered = await registerArcaOrder({
    orderNumber: pending.id,
    amountAmd: totalAmd,
    returnUrl: absoluteUrl(`/checkout/arca/return?ref=${pending.id}`),
    // No "&" here — ACBA's hosted payment page renders this value without
    // decoding its own HTML-escaping, so a literal "&" shows up on the
    // payment page as the text "&amp;" instead of "&".
    description: "Max and Lizzy order",
    language,
  });

  if (!registered.ok) {
    // registered.error is already logged with detail in lib/arca.ts — it's
    // a merchant-account/gateway problem, not something the customer did or
    // can fix, so don't show them the bank's raw internal error text.
    await prisma.pendingArcaOrder.update({ where: { id: pending.id }, data: { status: "failed" } });
    return NextResponse.json({ error: "Card payment isn't available right now. Please try another payment method." }, { status: 502 });
  }

  await prisma.pendingArcaOrder.update({ where: { id: pending.id }, data: { epgOrderId: registered.result.orderId } });

  return NextResponse.json({ redirectUrl: registered.result.formUrl });
}
