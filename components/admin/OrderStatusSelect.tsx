"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/(protected)/orders/actions";
import { ORDER_STATUS_META } from "@/components/admin/OrderStatusBadge";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(() => {
          updateOrderStatus(orderId, next);
        });
      }}
      className="rounded-full border border-tan bg-white px-4 py-2 text-sm font-semibold text-espresso focus:outline-none disabled:opacity-60"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}
