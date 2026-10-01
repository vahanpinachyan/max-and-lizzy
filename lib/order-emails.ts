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

// Minimal inline-styled building blocks. Email clients strip <style> blocks
// and ignore most modern CSS, so anything visual has to be inline and
// table-free enough to survive Gmail, Outlook and Apple Mail.
const BUTTON = (href: string, label: string) =>
  `<p style="margin:24px 0;"><a href="${href}" style="background:#6B4A32;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;display:inline-block;">${label}</a></p>`;

const REF = (orderId: string) =>
  `<p style="color:#6b6b6b;font-size:14px;">Order reference: <strong>${orderId.slice(-10)}</strong></p>`;

const STORE_BLOCK = `<p style="margin:16px 0;line-height:1.6;">
  <strong>${site.name}</strong><br/>
  ${site.address.street}, ${site.address.city}<br/>
  Open every day, 10:00–21:00<br/>
  <a href="${site.phoneHref}">${site.phone}</a>
</p>`;

// The direct review form if it has been configured, otherwise the Maps
// listing — which still puts a review button one tap away, so the ask is
// never a dead end.
const reviewHref = () => site.googleReviewUrl ?? site.googleMapsUrl;

const SUBJECT_AND_BODY: Record<OrderStatus, (ctx: OrderEmailContext) => { subject: string; html: string }> = {
  pending: (ctx) => ({
    subject: `Your ${site.name} order is confirmed`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Thanks for your order! We're getting it ready.</p>
           <p>Order reference: ${ctx.orderId.slice(-10)}</p>`,
  }),
  ready_for_pickup: (ctx) => ({
    subject: `Your ${site.name} order is ready to collect`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Good news — your order is packed and waiting for you at the store.</p>
           ${STORE_BLOCK}
           <p>Just show this email, or give us the order reference below, and we'll hand it over.</p>
           ${REF(ctx.orderId)}
           ${BUTTON(site.googleMapsUrl, "Get directions")}
           <p style="color:#6b6b6b;font-size:14px;">We'll keep it aside for you. If you need longer, or someone else is collecting on your behalf, just reply to this email and let us know.</p>`,
  }),
  shipped: (ctx) => ({
    subject: `Your ${site.name} order has shipped`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>Your order is on its way for local delivery in Yerevan.</p>
           <p>Order reference: ${ctx.orderId.slice(-10)}</p>`,
  }),
  // Staff set this once the order is physically in the customer's hands —
  // collected at the counter, or delivered. It is the one moment the customer
  // is most likely to leave a review, so this is where the Google ask goes.
  completed: (ctx) => ({
    subject: `Thank you for your purchase — ${site.name}`,
    html: `<p>Hi ${ctx.customerName ?? "there"},</p>
           <p>${
             ctx.fulfillmentMethod === "pickup"
               ? "Thank you for collecting your order, and for coming to see us."
               : "Thank you for your order — we hope it arrived safely."
           } We hope your little one loves it.</p>
           ${REF(ctx.orderId)}
           <p style="margin-top:28px;">If you have a moment, a short Google review genuinely helps a small shop like ours — it is how most families in Yerevan find us.</p>
           ${BUTTON(reviewHref(), "Leave a Google review")}
           <p style="color:#6b6b6b;font-size:14px;">You can also <a href="${site.url}/orders/${ctx.orderId}/review">review the toys themselves</a> on our site, which helps other parents choose.</p>
           <p style="color:#6b6b6b;font-size:14px;">If anything is not right, reply to this email and we will sort it out.</p>`,
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
      from: `${site.emailFromName} <info@${new URL(site.url).hostname}>`,
      to: ctx.customerEmail,
      replyTo: site.email,
      subject,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[order-email] Failed to send:", error);
    return { sent: false, reason: "Send failed — check server logs." };
  }
}
