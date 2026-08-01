import "server-only";
import { getProduct } from "@/data/products";
import { findPromoCode } from "@/data/promo-codes";
import { getFulfillmentOption, GIFT_WRAP_FEE_AMD } from "@/data/fulfillment";
import { ARMENIA_REGIONS } from "@/data/armenia-regions";

export interface CheckoutRequestItem {
  slug: string;
  quantity: number;
}

export interface DeliveryAddressInput {
  region?: string;
  city?: string;
  street?: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
}

export interface ValidatedLineItem {
  slug: string;
  sku: string;
  name: string;
  imageSrc: string;
  quantity: number;
  unitPriceAmd: number;
}

export interface ValidatedCheckout {
  lineItems: ValidatedLineItem[];
  fulfillment: NonNullable<ReturnType<typeof getFulfillmentOption>>;
  deliveryAddress: Required<DeliveryAddressInput> | null;
  giftWrap: boolean;
  giftMessage: string;
  notes: string | null;
  promoCode: string | null;
  itemsSubtotalAmd: number;
  totalAmd: number;
}

// Shared by both payment providers (Stripe and Idram) so the
// security-critical rules — never trust a client-sent price, fee, or
// discount — only live in one place. See app/api/checkout/route.ts and
// app/api/checkout/idram/route.ts.
export async function validateCheckoutRequest(body: {
  items?: CheckoutRequestItem[];
  promoCode?: string | null;
  fulfillmentMethod?: string;
  giftWrap?: boolean;
  giftMessage?: string;
  notes?: string;
  deliveryAddress?: DeliveryAddressInput;
}): Promise<{ error: string } | { error: null; data: ValidatedCheckout }> {
  const requestedItems = Array.isArray(body.items) ? body.items : [];
  if (requestedItems.length === 0) {
    return { error: "Cart is empty" };
  }

  const fulfillment = getFulfillmentOption(body.fulfillmentMethod);
  if (!fulfillment) {
    return { error: "Please choose a pickup or delivery option" };
  }
  const giftWrap = body.giftWrap === true;
  const giftMessage = giftWrap ? (body.giftMessage ?? "").slice(0, 500) : "";
  const notes = String(body.notes ?? "").trim().slice(0, 1000) || null;

  const rawAddress = body.deliveryAddress ?? {};
  if (fulfillment.id === "delivery_yerevan" && !String(rawAddress.street ?? "").trim()) {
    return { error: "Please fill in your delivery address" };
  }
  if (fulfillment.id === "delivery_outside") {
    const validRegion = ARMENIA_REGIONS.some((r) => r.id === rawAddress.region);
    if (!validRegion || !String(rawAddress.city ?? "").trim() || !String(rawAddress.street ?? "").trim()) {
      return { error: "Please fill in your delivery address" };
    }
  }
  const deliveryAddress =
    fulfillment.id === "pickup"
      ? null
      : {
          region: rawAddress.region ?? "",
          city: String(rawAddress.city ?? "").slice(0, 100),
          street: String(rawAddress.street ?? "").slice(0, 200),
          apartment: String(rawAddress.apartment ?? "").slice(0, 50),
          entrance: String(rawAddress.entrance ?? "").slice(0, 50),
          floor: String(rawAddress.floor ?? "").slice(0, 50),
        };

  const promo = body.promoCode ? await findPromoCode(body.promoCode) : null;
  const discountMultiplier = promo ? 1 - promo.percentOff / 100 : 1;

  const lineItems: ValidatedLineItem[] = [];
  for (const item of requestedItems) {
    const product = await getProduct(item.slug);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (!product || !product.inStock) {
      return { error: `Product "${item.slug}" is unavailable` };
    }
    lineItems.push({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      imageSrc: product.images[0]?.src ?? "/images/logo.png",
      quantity,
      unitPriceAmd: Math.round(product.priceAmd * discountMultiplier),
    });
  }

  const itemsSubtotalAmd = lineItems.reduce((sum, item) => sum + item.unitPriceAmd * item.quantity, 0);
  const totalAmd = itemsSubtotalAmd + fulfillment.feeAmd + (giftWrap ? GIFT_WRAP_FEE_AMD : 0);

  return {
    error: null,
    data: {
      lineItems,
      fulfillment,
      deliveryAddress,
      giftWrap,
      giftMessage,
      notes,
      promoCode: promo?.code ?? null,
      itemsSubtotalAmd,
      totalAmd,
    },
  };
}
