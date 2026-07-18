import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/data/products";
import { findPromoCode } from "@/data/promo-codes";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";
import { getFulfillmentOption, GIFT_WRAP_FEE_AMD } from "@/data/fulfillment";

interface CheckoutRequestItem {
  slug: string;
  quantity: number;
}

export async function POST(request: Request) {
  let body: {
    items?: CheckoutRequestItem[];
    promoCode?: string | null;
    fulfillmentMethod?: string;
    giftWrap?: boolean;
    giftMessage?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const requestedItems = Array.isArray(body.items) ? body.items : [];
  if (requestedItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Never trust a fee amount from the client — only the fulfillment method
  // id is client-chosen; the price it maps to always comes from our own data.
  const fulfillment = getFulfillmentOption(body.fulfillmentMethod);
  if (!fulfillment) {
    return NextResponse.json({ error: "Please choose a pickup or delivery option" }, { status: 400 });
  }
  const giftWrap = body.giftWrap === true;
  const giftMessage = giftWrap ? (body.giftMessage ?? "").slice(0, 500) : "";

  // Re-validate the promo code server-side — never trust a discount amount
  // computed on the client.
  const promo = body.promoCode ? await findPromoCode(body.promoCode) : null;
  const discountMultiplier = promo ? 1 - promo.percentOff / 100 : 1;

  // Always resolve price and product details server-side from our own data —
  // never trust price/name sent by the client.
  const lineItems = [];
  for (const item of requestedItems) {
    const product = await getProduct(item.slug);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (!product || !product.inStock) {
      return NextResponse.json(
        { error: `Product "${item.slug}" is unavailable` },
        { status: 400 }
      );
    }
    const discountedPriceAmd = Math.round(product.priceAmd * discountMultiplier);
    lineItems.push({
      quantity,
      price_data: {
        currency: site.currency.toLowerCase(),
        unit_amount: discountedPriceAmd * 100,
        product_data: {
          name: promo ? `${product.name} (${promo.code} applied)` : product.name,
          images: [absoluteUrl(product.images[0]?.src ?? "/images/logo.png")],
          metadata: { slug: product.slug, sku: product.sku },
        },
      },
    });
  }

  if (fulfillment.feeAmd > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: site.currency.toLowerCase(),
        unit_amount: fulfillment.feeAmd * 100,
        product_data: { name: fulfillment.label },
      },
    });
  }
  if (giftWrap) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: site.currency.toLowerCase(),
        unit_amount: GIFT_WRAP_FEE_AMD * 100,
        product_data: { name: "Gift wrapping" },
      },
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: absoluteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: absoluteUrl("/checkout/cancel"),
      shipping_address_collection: { allowed_countries: ["AM"] },
      phone_number_collection: { enabled: true },
      metadata: {
        fulfillment_method: fulfillment.id,
        gift_wrap: giftWrap ? "true" : "false",
        gift_message: giftMessage,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] Stripe error:", error);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
