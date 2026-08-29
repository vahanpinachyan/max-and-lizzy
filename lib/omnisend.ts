import "server-only";
import { randomUUID } from "crypto";
import { getFulfillmentOption } from "@/data/fulfillment";

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

export type OmnisendOrderStatus = "ready_for_pickup" | "shipped" | "completed" | "cancelled";

// A tag on Omnisend's built-in "order fulfilled" event (not a genuinely
// custom event name) — the automation trigger picker only offers Omnisend's
// fixed catalog of recognized e-commerce events (Placed order, Order
// fulfilled, Order canceled, ...), confirmed by inspecting it directly;
// arbitrary custom event names never showed up there even after being sent.
// ready_for_pickup/shipped/completed all fire "order fulfilled" (they're all
// "your order left our hands" from the customer's perspective) and are told
// apart by this tag, via a Split step on the "Order Tags" trigger filter —
// same Split-on-a-tag pattern the "Order Confirmation" automation already
// uses for language. cancelled has its own dedicated built-in event instead
// ("order canceled" — note the US spelling Omnisend's API expects), so no
// tag is needed there. "pending" isn't here: it's the order's initial state
// (set at creation, not via a status change) and still gets its confirmation
// email through the existing checkout flow.
const ORDER_STATUS_TAGS: Record<Exclude<OmnisendOrderStatus, "cancelled">, string> = {
  ready_for_pickup: "ready-for-pickup",
  shipped: "shipped",
  completed: "completed",
};

/**
 * Sends a status-change event for orders now handled by Omnisend automations
 * instead of the plain Resend email in lib/order-emails.ts (see that file's
 * SUBJECT_AND_BODY — the entries for these 4 statuses are unused as of this
 * change). Returns a sent/reason pair, not void like the other functions
 * here, because the admin order-detail page shows staff whether the
 * notification actually went out.
 */
export async function sendOrderStatusEvent({
  email,
  orderId,
  status,
  totalAmd,
  fulfillmentMethod,
}: {
  email: string;
  orderId: string;
  status: OmnisendOrderStatus;
  totalAmd: number;
  fulfillmentMethod: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const headers = authHeaders();
  if (!headers) {
    return { sent: false, reason: "OMNISEND_API_KEY is not configured — see README 'Environment variables'." };
  }

  const shippingMethodLabel = fulfillmentMethod ? getFulfillmentOption(fulfillmentMethod)?.label : undefined;

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        eventName: status === "cancelled" ? "order canceled" : "order fulfilled",
        eventID: randomUUID(),
        origin: "api",
        eventVersion: "v2",
        contact: { email },
        properties: {
          orderID: orderId,
          totalPrice: totalAmd,
          currency: "AMD",
          ...(status === "cancelled"
            ? {}
            : {
                fulfillmentStatus: "fulfilled",
                tags: [ORDER_STATUS_TAGS[status]],
                shippingMethod: shippingMethodLabel,
              }),
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[omnisend] Order-status event failed (${res.status}):`, body);
      return { sent: false, reason: "Send failed — check server logs." };
    }
    return { sent: true };
  } catch (error) {
    console.error("[omnisend] Failed to send order-status event:", error);
    return { sent: false, reason: "Send failed — check server logs." };
  }
}
