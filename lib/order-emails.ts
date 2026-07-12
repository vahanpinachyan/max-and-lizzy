import "server-only";
import { site } from "@/data/site";
import type { OrderStatus } from "@/lib/order-status";

interface OrderEmailContext {
  orderId: string;
  customerName: string | null;
  customerEmail: string;
  totalAmd: number;
  fulfillmentMethod: string | null;
}

const SUBJECT_AND_BODY: Record<OrderStatus, (ctx: OrderEmailContext) => { subject: string; html: string }> = {
  pending: (ctx) => ({
    subject: `Your ${site.name} order is confirmed`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Thanks for your order! We're getting it ready.</p>
           <p>Order reference: ${ctx.orderId.slice(-10)}</p>`,
  }),
  ready_for_pickup: (ctx) => ({
    subject: `Your ${site.name} order is ready for pickup`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Good news — your order is ready for pickup at <strong>${site.address.street}, ${site.address.city}</strong>.</p>
           <p>Order reference: ${ctx.orderId.slice(-10)}</p>
           <p>Our hours: Mo–Su 10:00–21:00. See you soon!</p>`,
  }),
  shipped: (ctx) => ({
    subject: `Your ${site.name} order has shipped`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Your order is on its way for local delivery in Yerevan.</p>
           <p>Order reference: ${ctx.orderId.slice(-10)}</p>`,
  }),
  completed: (ctx) => ({
    subject: `Thanks for shopping with ${site.name}!`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Your order is complete — we hope your little one loves it! If anything's not right, just reply to this email.</p>
           <p>Order reference: ${ctx.orderId.slice(-10)}</p>
           <p><a href="${site.url}/orders/${ctx.orderId}/review">Leave a review →</a></p>`,
  }),
  cancelled: (ctx) => ({
    subject: `Your ${site.name} order was cancelled`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Your order (reference ${ctx.orderId.slice(-10)}) has been cancelled. No charge was completed for this cancellation on our end — if you were charged and have questions, please reply to this email or contact us.</p>`,
  }),
};

/**
 * Sends a status-update email for an order. Returns whether it actually
 * sent (false if RESEND_API_KEY isn't configured — logs instead, same
 * graceful-degradation pattern as the checkout webhook's confirmation email
 * and the contact form).
 */
export async function sendOrderStatusEmail(
  status: OrderStatus,
  ctx: OrderEmailContext
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const { subject, html } = SUBJECT_AND_BODY[status](ctx);

  if (!apiKey) {
    console.log(`[order-email] (RESEND_API_KEY not set) Would send "${subject}" to ${ctx.customerEmail}`);
    return { sent: false, reason: "RESEND_API_KEY is not configured — see README 'Environment variables'." };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} <orders@${new URL(site.url).hostname}>`,
      to: ctx.customerEmail,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[order-email] Failed to send:", error);
    return { sent: false, reason: "Send failed — check server logs." };
  }
}
