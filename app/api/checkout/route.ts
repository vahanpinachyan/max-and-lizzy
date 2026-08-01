import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { site } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";
import { GIFT_WRAP_FEE_AMD } from "@/data/fulfillment";
import { validateCheckoutRequest, type CheckoutRequestItem, type DeliveryAddressInput } from "@/lib/checkout-validation";

export async function POST(request: Request) {
  let body: {
    items?: CheckoutRequestItem[];
    promoCode?: string | null;
    fulfillmentMethod?: string;
    giftWrap?: boolean;
    giftMessage?: string;
    notes?: string;
    deliveryAddress?: DeliveryAddressInput;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validated = await validateCheckoutRequest(body);
  if (validated.error !== null) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { lineItems, fulfillment, deliveryAddress, giftWrap, giftMessage, notes, promoCode } = validated.data;

  const stripeLineItems = lineItems.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: site.currency.toLowerCase(),
      unit_amount: item.unitPriceAmd * 100,
      product_data: {
        name: promoCode ? `${item.name} (${promoCode} applied)` : item.name,
        images: [absoluteUrl(item.imageSrc)],
        metadata: { slug: item.slug, sku: item.sku },
      },
    },
  }));

  if (fulfillment.feeAmd > 0) {
    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: site.currency.toLowerCase(),
        unit_amount: fulfillment.feeAmd * 100,
        product_data: { name: fulfillment.label, images: [], metadata: { slug: "", sku: "" } },
      },
    });
  }
  if (giftWrap) {
    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: site.currency.toLowerCase(),
        unit_amount: GIFT_WRAP_FEE_AMD * 100,
        product_data: { name: "Gift wrapping", images: [], metadata: { slug: "", sku: "" } },
      },
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      success_url: absoluteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: absoluteUrl("/checkout/cancel"),
      phone_number_collection: { enabled: true },
      metadata: {
        fulfillment_method: fulfillment.id,
        gift_wrap: giftWrap ? "true" : "false",
        gift_message: giftMessage,
        notes: notes ?? "",
        delivery_address: deliveryAddress ? JSON.stringify(deliveryAddress) : "",
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
