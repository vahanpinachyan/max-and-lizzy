import "server-only";
import { randomUUID } from "crypto";

const API_BASE = "https://api.omnisend.com/api";
const API_VERSION = "2026-03-15";

function authHeaders() {
  const apiKey = process.env.OMNISEND_API_KEY;
  if (!apiKey) return null;
  return {
    Authorization: `Omnisend-API-Key ${apiKey}`,
    "Omnisend-Version": API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Creates or updates an Omnisend contact, opted in to email marketing.
 * Silently no-ops when OMNISEND_API_KEY is unset so signups/checkout never
 * fail because marketing sync isn't configured — same pattern as the
 * Resend/Instagram integrations elsewhere in this codebase.
 */
export async function upsertContact({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  const headers = authHeaders();
  if (!headers) return;

  try {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        identifiers: [
          {
            type: "email",
            id: email,
            channels: {
              email: {
                status: "subscribed",
                statusDate: new Date().toISOString(),
              },
            },
          },
        ],
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[omnisend] Contact upsert failed (${res.status}):`, await res.text());
    }
  } catch (error) {
    console.error("[omnisend] Failed to upsert contact:", error);
  }
}

interface PlacedOrderLineItem {
  productSlug: string | null;
  productName: string;
  priceAmd: number;
  productUrl?: string;
}

/**
 * Sends a "placed order" event so Omnisend automations (post-purchase
 * flows, revenue reporting, customer segmentation) can trigger off real
 * orders. Best-effort — never throws, since a marketing-sync failure
 * should never block order creation.
 */
export async function sendPlacedOrderEvent({
  email,
  orderId,
  totalAmd,
  items,
}: {
  email: string;
  orderId: string;
  totalAmd: number;
  items: PlacedOrderLineItem[];
}): Promise<void> {
  const headers = authHeaders();
  if (!headers) return;

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        eventName: "placed order",
        eventID: randomUUID(),
        origin: "api",
        eventVersion: "v2",
        contact: { email },
        properties: {
          orderID: orderId,
          totalPrice: totalAmd,
          currency: "AMD",
          createdAt: new Date().toISOString(),
          lineItems: items.map((item) => ({
            productID: item.productSlug ?? undefined,
            productTitle: item.productName,
            productPrice: item.priceAmd,
            productURL: item.productUrl,
          })),
        },
      }),
    });
    if (!res.ok) {
      console.error(`[omnisend] Placed-order event failed (${res.status}):`, await res.text());
    }
  } catch (error) {
    console.error("[omnisend] Failed to send placed-order event:", error);
  }
}
