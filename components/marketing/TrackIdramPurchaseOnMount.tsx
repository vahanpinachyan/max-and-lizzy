"use client";

import { useEffect, useRef } from "react";
import { captureStashedIdramPurchase } from "@/lib/posthog-client";

// Fires the PostHog "purchase" event for an Idram checkout, reading the
// order snapshot stashed in sessionStorage right before the customer was
// redirected to Idram's hosted payment page (see stashPendingIdramPurchase
// in lib/posthog-client.ts — Idram's success redirect carries no order
// data of its own to read here).
export function TrackIdramPurchaseOnMount() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    captureStashedIdramPurchase();
  }, []);

  return null;
}
