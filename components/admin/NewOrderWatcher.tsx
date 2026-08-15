"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// How often to check for a newer order than the one the page was rendered
// with. Not real-time — just frequent enough that staff notice a new order
// within a reasonable window without hammering the DB.
const POLL_INTERVAL_MS = 20000;

/**
 * Bottom-center toast that appears when an order has been placed since this
 * page was last rendered. `latestOrderCreatedAt` comes from the server
 * layout, so `hasNewOrder` is derived by comparing it against whatever the
 * poll last saw — once router.refresh() re-renders the layout with the new
 * order included, the comparison naturally goes false on its own, no reset
 * effect required.
 */
export function NewOrderWatcher({ latestOrderCreatedAt }: { latestOrderCreatedAt: string | null }) {
  const router = useRouter();
  const [polledLatest, setPolledLatest] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/orders/latest", { cache: "no-store" });
        if (!res.ok) return;
        const { latestCreatedAt } = (await res.json()) as { latestCreatedAt: string | null };
        if (latestCreatedAt) setPolledLatest(latestCreatedAt);
      } catch {
        // Ignore — just retried on the next interval.
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const hasNewOrder =
    polledLatest !== null && (!latestOrderCreatedAt || new Date(polledLatest) > new Date(latestOrderCreatedAt));

  if (!hasNewOrder) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <button
        type="button"
        onClick={() => router.refresh()}
        className="flex items-center gap-2 rounded-full bg-espresso px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-espresso/90"
      >
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-sage" aria-hidden="true" />
        New order received — Refresh
      </button>
    </div>
  );
}
