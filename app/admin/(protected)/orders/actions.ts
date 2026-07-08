"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { sendOrderStatusEmail } from "@/lib/order-emails";
import { requireAdminSession } from "@/lib/admin/permissions";

// Both roles can view/update orders and send status emails — only
// products/promo-codes/staff are manager-only (see lib/admin/permissions.ts).

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdminSession();
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function sendStatusEmailAction(orderId: string): Promise<{ sent: boolean; reason?: string }> {
  await requireAdminSession();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
  if (!order) return { sent: false, reason: "Order not found." };

  return sendOrderStatusEmail(order.status as OrderStatus, {
    orderId: order.id,
    customerName: order.customerName ?? order.customer.name,
    customerEmail: order.customer.email,
    totalAmd: order.totalAmd,
    fulfillmentMethod: order.fulfillmentMethod,
  });
}
