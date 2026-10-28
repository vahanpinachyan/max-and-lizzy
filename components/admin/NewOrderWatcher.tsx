"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// How often to check for a newer order than the one the page was rendered
// with. Not real-time — just frequent enough that staff notice a new order
// within a reasonable window without hammering the DB.
//
// Each poll costs two queries (the session lookup in requireAdminSession plus
// the order check), and Neon only scales the compute to zero after five
// minutes idle. A tab polling on any interval shorter than that keeps the
// database awake around the clock, so an admin tab forgotten overnight used to
// burn more compute than the whole month's allowance. Hence the longer gap
// and, more importantly, the visibility gating below.
const POLL_INTERVAL_MS = 60000;

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
    let timer: ReturnType<typeof setInterval> | null = null;

    async function check() {
      try {
        const res = await fetch("/api/admin/orders/latest", { cache: "no-store" });
        if (!res.ok) return;
        const { latestCreatedAt } = (await res.json()) as { latestCreatedAt: string | null };
        if (latestCreatedAt) setPolledLatest(latestCreatedAt);
      } catch {
        // Ignore — just retried on the next interval.
      }
    }

    function start() {
      if (timer === null) timer = setInterval(check, POLL_INTERVAL_MS);
    }

    function stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }

    // A background tab is nobody watching, so there is no one to show a toast
    // to — polling on is pure cost. Coming back to the tab checks immediately
    // rather than waiting out the interval, so returning staff see a waiting
    // order straight away instead of a minute later.
    function onVisibilityChange() {
      if (document.hidden) {
        stop();
        return;
      }
      void check();
      start();
    }

    // On mount the layout has only just rendered with a fresh timestamp, so
    // there is nothing to catch up on — just arm the timer.
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
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
