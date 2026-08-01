import "server-only";
import { site } from "@/data/site";
import { formatAmd, formatDate, formatShippingAddress } from "@/lib/format";
import { GIFT_WRAP_FEE_AMD } from "@/data/fulfillment";
import { localizeFulfillmentOptions } from "@/lib/i18n/localize-data";
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
// /admin/orders open. Sent to the store's own inbox (site.email), not the
// customer, so it's written entirely in Armenian for the staff who read it.
// Anything the customer wrote themselves (order.notes, order.giftMessage)
// is shown verbatim, never translated.
export async function sendNewOrderNotificationEmail(
  order: Order & { items: OrderItem[] },
  customerEmail: string | null | undefined
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const customerName = order.customerName || "Հաճախորդ";
  const paymentLabel = order.paymentProvider === "idram" ? "Idram" : "բանկային քարտ (Stripe)";
  const fulfillment = localizeFulfillmentOptions("hy").find((o) => o.id === order.fulfillmentMethod);
  const orderRef = order.id.slice(-10);
  const placedDate = formatDate(order.createdAt.toISOString(), "hy");
  const placedTime = order.createdAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Yerevan",
  });

  const itemsSubtotalAmd = order.items.reduce((sum, item) => sum + item.priceAmd * item.quantity, 0);
  const deliveryFeeAmd = fulfillment?.feeAmd ?? 0;
  const giftFeeAmd = order.giftWrap ? GIFT_WRAP_FEE_AMD : 0;

  const rowStyle = "padding:8px 12px 8px 0;border-bottom:1px solid #f0f0f0;vertical-align:top";
  const itemRows = order.items
    .map(
      (item) => `<tr>
        <td style="${rowStyle};width:52px">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" width="44" height="44" alt="" style="display:block;border-radius:8px;object-fit:cover;border:1px solid #eee" />`
              : `<div style="width:44px;height:44px;border-radius:8px;background:#f2f2f2"></div>`
          }
        </td>
        <td style="${rowStyle}">
          <div>${item.quantity} × ${item.productName}</div>
          ${item.sku ? `<div style="margin-top:2px;font-size:12px;color:#999">Կոդ՝ ${item.sku}</div>` : ""}
        </td>
        <td style="${rowStyle};text-align:right;white-space:nowrap">${formatAmd(item.priceAmd * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const contactRows = [
    customerEmail ? `<tr><td style="color:#888;padding:2px 12px 2px 0;white-space:nowrap">Էլ. փոստ</td><td><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>` : null,
    order.customerPhone ? `<tr><td style="color:#888;padding:2px 12px 2px 0;white-space:nowrap">Հեռախոսահամար</td><td><a href="tel:${order.customerPhone}">${order.customerPhone}</a></td></tr>` : null,
  ]
    .filter(Boolean)
    .join("");

  const address = formatShippingAddress(order.shippingAddress, "hy");
  const sectionDivider = 'style="margin-top:16px;padding-top:16px;border-top:1px solid #eee"';

  const totalsRows = [
    `<tr><td style="padding:2px 0">Ենթագումար</td><td style="padding:2px 0;text-align:right">${formatAmd(itemsSubtotalAmd)}</td></tr>`,
    deliveryFeeAmd > 0
      ? `<tr><td style="padding:2px 0">${fulfillment?.label}</td><td style="padding:2px 0;text-align:right">${formatAmd(deliveryFeeAmd)}</td></tr>`
      : null,
    giftFeeAmd > 0
      ? `<tr><td style="padding:2px 0">Նվեր փաթեթավորում</td><td style="padding:2px 0;text-align:right">${formatAmd(giftFeeAmd)}</td></tr>`
      : null,
    `<tr><td style="padding-top:6px;border-top:1px solid #ddd;font-weight:700">Ընդամենը</td><td style="padding-top:6px;border-top:1px solid #ddd;text-align:right;font-weight:700">${formatAmd(order.totalAmd)}</td></tr>`,
  ]
    .filter(Boolean)
    .join("");

  const extras = [
    order.giftWrap
      ? `Պատվիրված է նվեր փաթեթավորում${order.giftMessage ? `, հաղորդագրություն՝ "${order.giftMessage}"` : ""}`
      : null,
    order.promoCode ? `Կիրառված է պրոմոկոդ՝ ${order.promoCode}` : null,
  ]
    .filter(Boolean)
    .map((line) => `<p style="margin:6px 0 0">${line}</p>`)
    .join("");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `${site.name} Website <info@${new URL(site.url).hostname}>`,
      to: site.email,
      replyTo: customerEmail ?? undefined,
      subject: `Նոր պատվեր՝ ${customerName}, ${formatAmd(order.totalAmd)} (${orderRef})`,
      html: `<div style="font-family:sans-serif;font-size:14px;color:#222;max-width:480px">
        <p style="margin:0 0 12px;font-size:16px">Նոր պատվեր հաճախորդից՝ <strong>${customerName}</strong>: Վճարումը կատարվել է ${paymentLabel} միջոցով:</p>

        ${contactRows ? `<table role="presentation" style="width:100%">${contactRows}</table>` : ""}

        <div ${sectionDivider}>
          <p style="margin:0;font-weight:700">${fulfillment?.label ?? "Չի նշվել"}</p>
          ${address ? `<p style="margin:4px 0 0;color:#444">Առաքման հասցե՝ ${address}</p>` : ""}
        </div>

        ${
          order.notes
            ? `<div ${sectionDivider}>
                 <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:#888">Հաճախորդի նշում</p>
                 <p style="margin:4px 0 0">"${order.notes}"</p>
               </div>`
            : ""
        }

        <div ${sectionDivider}>
          <p style="margin:0 0 8px;font-weight:700">Պատվեր</p>
          <table role="presentation" style="width:100%;border-collapse:collapse">${itemRows}</table>
          <table role="presentation" style="width:100%;margin-top:10px">${totalsRows}</table>
          ${extras}
        </div>

        <p style="margin-top:20px;padding-top:12px;border-top:1px solid #eee;color:#999;font-size:12px">Պատվերի համարը՝ ${orderRef} · Ամսաթիվ՝ ${placedDate}, ${placedTime}</p>
        <p style="margin-top:4px"><a href="${site.url}/admin/orders/${order.id}">Դիտել այս պատվերը ադմին վահանակում →</a></p>
      </div>`,
    });
  } catch (error) {
    console.error("[checkout-emails] Failed to send new-order notification email:", error);
  }
}
