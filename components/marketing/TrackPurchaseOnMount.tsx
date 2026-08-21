"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/posthog-client";

// Fires the PostHog "purchase" event once, using order data the server
// component already resolved (see app/(site)/checkout/arca/return/page.tsx)
// — unlike Idram's success page, ArCa's return page IS the authoritative
// source for a confirmed payment, so there's no sessionStorage relay needed.
export function TrackPurchaseOnMount({
  orderId,
  totalAmd,
  itemCount,
  paymentMethod,
}: {
  orderId: string;
  totalAmd: number;
  itemCount: number;
  paymentMethod: "idram" | "arca";
}) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackPurchase(orderId, totalAmd, itemCount, paymentMethod);
  }, [orderId, totalAmd, itemCount, paymentMethod]);

  return null;
}
