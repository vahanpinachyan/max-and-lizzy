// Deliberately has zero server-only dependencies (no Stripe, no Prisma) so
// both client components (status dropdown) and server code (lib/orders.ts,
// Server Actions) can import it without dragging server-only code into the
// browser bundle.
export const ORDER_STATUSES = ["pending", "ready_for_pickup", "shipped", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
