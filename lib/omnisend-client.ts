"use client";

import type { CartItem, Product } from "@/types";
import { site } from "@/data/site";

// The Omnisend launcher script (components/marketing/OmnisendSnippet.tsx)
// replaces window.omnisend with its real SDK once loaded, but keeps a
// .push() queue for backward compatibility — track calls go through push,
// while identifyContact is called directly. See:
// https://api-docs.omnisend.com/docs/how-to-track-cart-events-snippet
interface OmnisendGlobal {
  push: (entry: unknown[]) => void;
  identifyContact?: (contact: { email?: string; phone?: string }) => void;
}

declare global {
  interface Window {
    omnisend?: OmnisendGlobal;
  }
}

function getOmnisend(): OmnisendGlobal | null {
  if (typeof window === "undefined") return null;
  return window.omnisend ?? null;
}

// Ties this browser's anonymous activity (page views, cart events) to a
// known contact — call as soon as we learn someone's email (newsletter
// signup, welcome modal) so abandoned-cart/checkout flows can actually
// reach them, instead of only ever seeing an anonymous visitor.
export function identifyOmnisendContact(email: string) {
  getOmnisend()?.identifyContact?.({ email });
}

interface OmnisendLineItem {
  productID: string;
  productTitle: string;
  productPrice: number;
  productImageURL?: string;
  productURL?: string;
}

function toLineItem(item: { slug: string; name: string; priceAmd: number; image?: string }): OmnisendLineItem {
  return {
    productID: item.slug,
    productTitle: item.name,
    productPrice: item.priceAmd,
    productImageURL: item.image || undefined,
    productURL: `${site.url}/product/${item.slug}`,
  };
}

// Fires when an item is added to cart — starts the "cart abandonment"
// automation in Omnisend. Cancelled automatically once the "placed order"
// event fires (lib/omnisend.ts, sent server-side from the Stripe webhook).
export function trackAddedToCart(product: Product, quantity: number, cartItems: CartItem[], cartId: string) {
  const omnisend = getOmnisend();
  if (!omnisend) return;

  const cartValueAmd = cartItems.reduce((sum, i) => sum + i.priceAmd * i.quantity, 0);
  const addedItem = toLineItem({
    slug: product.slug,
    name: product.name,
    priceAmd: product.priceAmd,
    image: product.images[0]?.src,
  });

  omnisend.push([
    "track",
    "added product to cart",
    {
      origin: "api",
      eventID: crypto.randomUUID(),
      eventVersion: "",
      properties: {
        abandonedCheckoutURL: `${site.url}/cart`,
        cartID: cartId,
        value: cartValueAmd,
        currency: "AMD",
        addedItem,
        lineItems: cartItems.map((i) => toLineItem(i)),
      },
    },
  ]);
}

// Fires when checkout is initiated — starts the "checkout abandonment"
// automation. Also cancelled by "placed order".
export function trackStartedCheckout(cartItems: CartItem[], totalAmd: number, cartId: string) {
  const omnisend = getOmnisend();
  if (!omnisend) return;

  omnisend.push([
    "track",
    "started checkout",
    {
      origin: "api",
      eventID: crypto.randomUUID(),
      eventVersion: "",
      properties: {
        abandonedCheckoutURL: `${site.url}/cart`,
        cartID: cartId,
        value: totalAmd,
        currency: "AMD",
        lineItems: cartItems.map((i) => toLineItem(i)),
      },
    },
  ]);
}
