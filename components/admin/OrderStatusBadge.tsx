import type { OrderStatus } from "@/lib/order-status";

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-terracotta/15 text-terracotta-dark" },
  ready_for_pickup: { label: "Ready for pickup", className: "bg-sage/15 text-sage-dark" },
  shipped: { label: "Shipped", className: "bg-wood/15 text-wood-dark" },
  completed: { label: "Completed", className: "bg-espresso/10 text-espresso" },
  cancelled: { label: "Cancelled", className: "bg-espresso/10 text-espresso/50" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = ORDER_STATUS_META[status as OrderStatus] ?? { label: status, className: "bg-beige text-espresso" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
