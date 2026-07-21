"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/(protected)/orders/actions";
import { ORDER_STATUS_META } from "@/components/admin/OrderStatusBadge";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

// Changing the status now automatically emails the customer (see
// updateOrderStatus), so a stray click here sends a real email to a real
// person. Staff confirm the change first instead of it firing immediately.
export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [result, setResult] = useState<{ sent: boolean; reason?: string } | null>(null);

  function confirmChange() {
    if (!pendingStatus) return;
    const next = pendingStatus;
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next);
      setResult(res);
      setPendingStatus(null);
    });
  }

  return (
    <div>
      <select
        value={pendingStatus ?? status}
        disabled={pending}
        onChange={(e) => {
          setResult(null);
          setPendingStatus(e.target.value as OrderStatus);
        }}
        className="rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso focus:outline-none disabled:opacity-60"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_META[s].label}
          </option>
        ))}
      </select>

      {pendingStatus && (
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-sm">
          <span className="text-espresso">
            Change status to <strong>{ORDER_STATUS_META[pendingStatus].label}</strong>? This will
            automatically email the customer.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={confirmChange}
              className="rounded-full bg-terracotta px-3 py-1 text-xs font-semibold text-white hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Updating…" : "Confirm"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setPendingStatus(null)}
              className="rounded-full border border-tan px-3 py-1 text-xs font-semibold text-espresso hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <p className={`mt-2 text-sm ${result.sent ? "text-sage-dark" : "text-terracotta-dark"}`} role="status">
          {result.sent ? "Status updated and customer notified." : `Status updated, but the email wasn't sent: ${result.reason ?? "unknown error."}`}
        </p>
      )}
    </div>
  );
}
