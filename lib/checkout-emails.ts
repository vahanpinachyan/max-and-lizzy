import "server-only";
import { site } from "@/data/site";
import { formatAmd } from "@/lib/format";
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
  const itemsList = order.items
    .map((item) => `<li>${item.quantity} × ${item.productName} — ${formatAmd(item.priceAmd)}</li>`)
    .join("");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} Website <info@${new URL(site.url).hostname}>`,
      to: site.email,
      replyTo: customerEmail ?? undefined,
      subject: `New order from ${customerName} — ${formatAmd(order.totalAmd)}`,
      html: `<p><strong>${customerName}</strong> just placed an order (paid via ${order.paymentProvider}).</p>
             <ul>${itemsList}</ul>
             <p><strong>Total:</strong> ${formatAmd(order.totalAmd)}</p>
             <p><strong>Fulfillment:</strong> ${order.fulfillmentMethod ?? "not specified"}</p>
             <p><a href="${site.url}/admin/orders/${order.id}">View this order in the admin panel →</a></p>`,
    });
  } catch (error) {
    console.error("[checkout-emails] Failed to send new-order notification email:", error);
  }
}
