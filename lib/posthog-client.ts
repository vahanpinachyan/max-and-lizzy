"use client";

import posthog from "posthog-js";
import type { CartItem, Product } from "@/types";

// Named funnel events for PostHog, alongside the existing Omnisend
// marketing-automation tracking (lib/omnisend-client.ts) — same trigger
// points, different purpose: this is what powers the "add to cart -> start
// checkout -> purchase" funnel insight in PostHog, not an automation.
// posthog.init() runs in components/marketing/PostHogInit.tsx; calling
// capture() before that (or with no NEXT_PUBLIC_POSTHOG_KEY set) is a safe
// no-op, same as the Omnisend equivalents.

export function trackAddToCart(product: Product, quantity: number, cartItems: CartItem[]) {
  const cartValueAmd = cartItems.reduce((sum, i) => sum + i.priceAmd * i.quantity, 0);
  posthog.capture("add_to_cart", {
    product_slug: product.slug,
    product_name: product.name,
    price_amd: product.priceAmd,
    quantity,
    cart_value_amd: cartValueAmd,
    currency: "AMD",
  });
}

export function trackCheckoutStarted(cartItems: CartItem[], totalAmd: number) {
  posthog.capture("checkout_started", {
    value: totalAmd,
    currency: "AMD",
    item_count: cartItems.reduce((sum, i) => sum + i.quantity, 0),
  });
}

export function trackPurchase(orderId: string, totalAmd: number, itemCount: number, paymentMethod: "idram" | "arca") {
  posthog.capture("purchase", {
    order_id: orderId,
    value: totalAmd,
    currency: "AMD",
    item_count: itemCount,
    payment_method: paymentMethod,
  });
}

// Idram redirects the customer's browser to a fixed SUCCESS_URL with no
// query params (see app/(site)/checkout/idram/success/page.tsx) — unlike
// ArCa's return page, there's nothing there to look an order up by. Stash
// the order snapshot right before handing off to Idram's hosted payment
// page, so the success page can read it back and fire trackPurchase once,
// the same way it would if Idram had given it real data to work with.
const IDRAM_PENDING_PURCHASE_KEY = "ml-pending-idram-purchase";

export function stashPendingIdramPurchase(orderId: string, totalAmd: number, itemCount: number) {
  try {
    sessionStorage.setItem(IDRAM_PENDING_PURCHASE_KEY, JSON.stringify({ orderId, totalAmd, itemCount }));
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing this
    // one purchase event isn't worth failing checkout over.
  }
}

export function captureStashedIdramPurchase() {
  try {
    const raw = sessionStorage.getItem(IDRAM_PENDING_PURCHASE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(IDRAM_PENDING_PURCHASE_KEY);
    const { orderId, totalAmd, itemCount } = JSON.parse(raw) as { orderId: string; totalAmd: number; itemCount: number };
    trackPurchase(orderId, totalAmd, itemCount, "idram");
  } catch {
    // Malformed/missing data — nothing to recover, just skip the event.
  }
}
