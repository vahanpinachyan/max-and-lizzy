import "server-only";
import { site } from "@/data/site";
import { formatAmd, formatShippingAddress } from "@/lib/format";
import { getFulfillmentOption } from "@/data/fulfillment";
import type { Order, OrderItem } from "@prisma/client";

// Shared by both payment providers (Stripe's webhook and Idram's callback)
// so these two templates only live in one place. Distinct from
// lib/order-emails.ts, which sends the admin's manual order-status-change
// emails, not the checkout-completion emails below.

export async function sendOrderConfirmationEmail(toEmail: string | null | undefined, orderRef: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !toEmail) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} <info@${new URL(site.url).hostname}>`,
      to: toEmail,
      replyTo: site.email,
      subject: `Your ${site.name} order is confirmed`,
      html: `<p>Thank you for your order! We'll have it ready for pickup or delivery soon.</p>
             <p>Order reference: ${orderRef.slice(-12)}</p>
             <p>Questions? Reply to this email or visit us at ${site.address.street}.</p>`,
    });
  } catch (error) {
    console.error("[checkout-emails] Failed to send confirmation email:", error);
  }
}

// Lets staff know a new order needs fulfilling without having to keep
// /admin/orders open — sent to the store's own inbox (site.email), not the
// customer.
export async function sendNewOrderNotificationEmail(
  order: Order & { items: OrderItem[] },
  customerEmail: string | null | undefined
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const customerName = order.customerName || "A customer";
  const paymentLabel = order.paymentProvider === "idram" ? "Idram" : "card (Stripe)";
  const fulfillment = getFulfillmentOption(order.fulfillmentMethod);
  const orderRef = order.id.slice(-10);
  const placedAt = order.createdAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Yerevan",
  });

  const itemRows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:4px 12px 4px 0">${item.quantity} × ${item.productName}</td>
        <td style="padding:4px 0;text-align:right;white-space:nowrap">${formatAmd(item.priceAmd * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const contactLines = [
    customerEmail ? `Email: <a href="mailto:${customerEmail}">${customerEmail}</a>` : null,
    order.customerPhone ? `Phone: <a href="tel:${order.customerPhone}">${order.customerPhone}</a>` : null,
  ]
    .filter(Boolean)
    .join("<br/>");

  const address = formatShippingAddress(order.shippingAddress);
  const fulfillmentLine = fulfillment
    ? `${fulfillment.label}${address ? ` — deliver to: ${address}` : ""}`
    : "Not specified";

  const extras = [
    order.giftWrap
      ? `🎁 Gift wrapped${order.giftMessage ? ` — message: "${order.giftMessage}"` : ""}`
      : null,
    order.promoCode ? `Promo code used: ${order.promoCode}` : null,
  ]
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} Website <info@${new URL(site.url).hostname}>`,
      to: site.email,
      replyTo: customerEmail ?? undefined,
      subject: `New order from ${customerName} — ${formatAmd(order.totalAmd)} (${orderRef})`,
      html: `<p><strong>${customerName}</strong> just placed an order — paid via ${paymentLabel}.</p>
             ${contactLines ? `<p>${contactLines}</p>` : ""}
             <p><strong>Fulfillment:</strong> ${fulfillmentLine}</p>
             <table style="border-collapse:collapse;width:100%;max-width:400px">${itemRows}</table>
             <p style="margin-top:8px"><strong>Total: ${formatAmd(order.totalAmd)}</strong></p>
             ${extras}
             <p style="color:#666">Order reference: ${orderRef} · Placed ${placedAt}</p>
             <p><a href="${site.url}/admin/orders/${order.id}">View this order in the admin panel →</a></p>`,
    });
  } catch (error) {
    console.error("[checkout-emails] Failed to send new-order notification email:", error);
  }
}
