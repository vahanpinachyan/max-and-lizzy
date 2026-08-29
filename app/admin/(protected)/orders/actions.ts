"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import { sendOrderStatusEvent, type OmnisendOrderStatus } from "@/lib/omnisend";
import { requireAdminSession } from "@/lib/admin/permissions";

// Both roles can view/update orders and send status emails — only
// products/promo-codes/staff are manager-only (see lib/admin/permissions.ts).

// ready_for_pickup/shipped/completed/cancelled are now handled by Omnisend
// automations (triggered by sendOrderStatusEvent's per-status events) instead
// of the plain Resend email — see lib/omnisend.ts. "pending" has no
// automation (it's the order's initial state, confirmed at checkout, not via
// a status change here), so it still goes through Resend.
type OrderRecipient = {
  id: string;
  customerName: string | null;
  totalAmd: number;
  fulfillmentMethod: string | null;
  customer: { name: string | null; email: string };
};

function isOmnisendStatus(status: OrderStatus): status is OmnisendOrderStatus {
  return status !== "pending";
}

async function notifyOrderStatus(status: OrderStatus, order: OrderRecipient): Promise<{ sent: boolean; reason?: string }> {
  if (isOmnisendStatus(status)) {
    return sendOrderStatusEvent({
      email: order.customer.email,
      orderId: order.id,
      status,
      totalAmd: order.totalAmd,
      fulfillmentMethod: order.fulfillmentMethod,
    });
  }
  return sendOrderStatusEmail(status, {
    orderId: order.id,
    customerName: order.customerName ?? order.customer.name,
    customerEmail: order.customer.email,
    totalAmd: order.totalAmd,
    fulfillmentMethod: order.fulfillmentMethod,
  });
}

// Changing the status automatically notifies the customer — the admin UI
// (OrderStatusSelect) makes staff confirm the change first, since this now
// has a real side effect and a wrong click sends the wrong notification.
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ sent: boolean; reason?: string }> {
  await requireAdminSession();
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { customer: true },
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return notifyOrderStatus(status, order);
}

// Kept for the "Resend email" fallback button — re-sends the notification for
// the order's current status without changing anything, e.g. if the
// automatic send above failed or a customer says they never got it.
export async function sendStatusEmailAction(orderId: string): Promise<{ sent: boolean; reason?: string }> {
  await requireAdminSession();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
  if (!order) return { sent: false, reason: "Order not found." };

  return notifyOrderStatus(order.status as OrderStatus, order);
}
