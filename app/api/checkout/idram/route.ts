import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { idramRecAccount, isIdramConfigured, IDRAM_PAYMENT_URL } from "@/lib/idram";
import { validateCheckoutRequest, type CheckoutRequestItem, type DeliveryAddressInput } from "@/lib/checkout-validation";

export async function POST(request: Request) {
  if (!isIdramConfigured()) {
    return NextResponse.json({ error: "Idram payments aren't set up yet. Please choose card payment instead." }, { status: 500 });
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
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Unlike Stripe's hosted checkout, Idram never gives us the customer's
  // email — it has to be collected on our own page before redirecting.
  const email = String(body.email ?? "").trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const validated = await validateCheckoutRequest(body);
  if (validated.error !== null) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { lineItems, fulfillment, deliveryAddress, giftWrap, giftMessage, promoCode, totalAmd } = validated.data;

  const pending = await prisma.pendingIdramOrder.create({
    data: {
      amountAmd: totalAmd,
      itemsJson: JSON.stringify(
        lineItems.map((item) => ({
          slug: item.slug,
          name: item.name,
          unitPriceAmd: item.unitPriceAmd,
          quantity: item.quantity,
        }))
      ),
      fulfillmentMethod: fulfillment.id,
      deliveryAddressJson: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
      giftWrap,
      giftMessage: giftMessage || null,
      promoCode,
      customerEmail: email,
      customerName: String(body.name ?? "").trim() || null,
      customerPhone: String(body.phone ?? "").trim() || null,
    },
  });

  return NextResponse.json({
    actionUrl: IDRAM_PAYMENT_URL,
    fields: {
      EDP_LANGUAGE: "EN",
      EDP_REC_ACCOUNT: idramRecAccount(),
      EDP_DESCRIPTION: "Max & Lizzy order",
      EDP_AMOUNT: totalAmd.toFixed(2),
      EDP_BILL_NO: pending.id,
    },
  });
}
