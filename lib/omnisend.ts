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

// Omnisend's Segments feature (needed to Split an automation on a custom
// property) is a paid-plan feature. Tags are free on every plan and are
// selectable directly in the Split step's "Tag" filter, so we tag contacts
// with their storefront locale instead — see the "Order Confirmation"
// automation, which Splits on this tag to send Armenian customers a
// translated email.
const LANGUAGE_TAG_PREFIX = "lang-";

/**
 * Looks up a contact's current tags by email so upsertContact can replace
 * only the lang-* tag and leave any other tags (VIP, manual segments, etc.)
 * intact — POSTing to /contacts REPLACES the tags array wholesale rather
 * than merging, confirmed against the live API, so skipping this lookup
 * would silently wipe out unrelated tags on every order.
 */
async function fetchExistingTags(email: string, headers: Record<string, string>): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/contacts?${new URLSearchParams({ email })}`, { headers });
    if (!res.ok) return [];
    const data = (await res.json()) as { contacts?: { tags?: string[] }[] };
    return data.contacts?.[0]?.tags ?? [];
  } catch {
    return [];
  }
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
  language,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  // "en" | "hy" | "ru" — the storefront locale the contact last ordered/
  // signed up in. Sent as a "lang-<code>" tag (see LANGUAGE_TAG_PREFIX).
  language?: string;
}): Promise<void> {
  const headers = authHeaders();
  if (!headers) return;

  try {
    let tags: string[] | undefined;
    if (language) {
      const existing = await fetchExistingTags(email, headers);
      tags = [...existing.filter((t) => !t.startsWith(LANGUAGE_TAG_PREFIX)), `${LANGUAGE_TAG_PREFIX}${language}`];
    }

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
        ...(tags ? { tags } : {}),
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
  imageUrl?: string;
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
  fulfillmentMethod,
}: {
  email: string;
  orderId: string;
  totalAmd: number;
  items: PlacedOrderLineItem[];
  // "pickup" | "delivery_yerevan" | "delivery_outside" | null (see
  // data/fulfillment.ts) — sent as a trigger-event property so the "Order
  // Confirmation" automation's Split step can branch on it directly (no
  // Segments/tag workaround needed here, unlike language, since this is
  // read from the specific order event, not stored on the contact).
  fulfillmentMethod: string | null;
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
          fulfillmentMethod: fulfillmentMethod ?? undefined,
          lineItems: items.map((item) => ({
            productID: item.productSlug ?? undefined,
            productTitle: item.productName,
            productPrice: item.priceAmd,
            productURL: item.productUrl,
            productImageURL: item.imageUrl,
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
