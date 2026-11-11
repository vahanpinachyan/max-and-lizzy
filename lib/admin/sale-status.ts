// What a scheduled sale looks like from the admin table's point of view.
//
// Kept apart from lib/pricing.ts because that module answers the storefront's
// question ("what does this cost right now?"), while staff need the one thing
// the storefront never shows: that a sale exists at all. A scheduled sale is
// evaluated on every read and never written into priceAmd, so the admin table
// read the raw column and showed the regular price all through a live sale —
// the campaign was invisible on the only screen used to set it up.

import {
  SHOP_UTC_OFFSET_HOURS,
  activeSalePercent,
  salePriceFor,
  type SalePricingInput,
  type SaleWindow,
} from "@/lib/pricing";

export type SaleStatusInput = SalePricingInput & SaleWindow;

export type SaleStatus =
  | { kind: "none" }
  | { kind: "active"; percent: number; salePrice: number; regularPrice: number; endsAt: Date | null }
  | { kind: "scheduled"; percent: number; salePrice: number; regularPrice: number; startsAt: Date };

function toDate(value: Date | string | null): Date | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Whether a sale is running on this product, waiting to start, or neither.
 *
 * A window that has already closed reports "none": the price has reverted on
 * its own and there is nothing left for staff to act on. A percentage with no
 * dates at all is also "none", matching activeSalePercent — a half-filled
 * schedule form must not read as a live campaign.
 */
export function saleStatus(product: SaleStatusInput, now: Date = new Date()): SaleStatus {
  const { salePercent } = product;
  if (salePercent === null || salePercent <= 0 || salePercent >= 100) return { kind: "none" };

  const startsAt = toDate(product.saleStartsAt);
  const endsAt = toDate(product.saleEndsAt);
  if (startsAt === null && endsAt === null) return { kind: "none" };

  const regularPrice = product.compareAtPriceAmd ?? product.priceAmd;
  const salePrice = salePriceFor(product, salePercent);

  if (activeSalePercent(product, now) !== null) {
    return { kind: "active", percent: salePercent, salePrice, regularPrice, endsAt };
  }
  if (startsAt !== null && now.getTime() < startsAt.getTime()) {
    return { kind: "scheduled", percent: salePercent, salePrice, regularPrice, startsAt };
  }
  return { kind: "none" };
}

/** True when staff should see this row under the "sale scheduled" filter. */
export function hasSaleSchedule(product: SaleStatusInput, now: Date = new Date()): boolean {
  return saleStatus(product, now).kind !== "none";
}

/**
 * The same status, flattened to plain JSON for the admin table.
 *
 * The decision of active-vs-scheduled is made on the server and sent down
 * already made. Letting the client component call `new Date()` during render
 * would put the two sides of hydration on different clocks, and a row whose
 * sale starts between them would render differently on each — a mismatch for
 * no gain, since the page is server-rendered per request anyway.
 */
export type AdminSaleBadge = {
  kind: "active" | "scheduled";
  percent: number;
  salePrice: number;
  regularPrice: number;
  startsAt: string | null;
  endsAt: string | null;
};

export function saleBadge(product: SaleStatusInput, now: Date = new Date()): AdminSaleBadge | null {
  const status = saleStatus(product, now);
  if (status.kind === "none") return null;
  return {
    kind: status.kind,
    percent: status.percent,
    salePrice: status.salePrice,
    regularPrice: status.regularPrice,
    startsAt: status.kind === "scheduled" ? status.startsAt.toISOString() : null,
    endsAt: status.kind === "active" ? (status.endsAt?.toISOString() ?? null) : null,
  };
}

// Month names are carried here rather than left to Intl, because Intl's locale
// data is not a given: Node has Armenian, but a browser built with a trimmed
// ICU resolves "hy-AM" to en-GB and prints "13 Nov". The server would render
// "13 նոյ" and the client would hydrate over it in English — a mismatch that
// depends on whose browser you open the panel in. A fixed table renders the
// same on both sides, for every staff member.
const SHORT_MONTHS: Record<"en" | "hy", readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  hy: ["հնվ", "փտվ", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"],
};

/**
 * An instant as a short date in the shop's own day — "13 Nov" / "13 նոյ".
 *
 * Shifted by the shop's fixed UTC offset and read as UTC, the same way
 * shopDayStart and shopDayEnd build those instants, so a sale that was set to
 * end on the 13th reads as the 13th and not as the 14th to a server running
 * in UTC.
 */
export function formatShopDate(iso: string, locale: "en" | "hy"): string {
  const shifted = new Date(new Date(iso).getTime() + SHOP_UTC_OFFSET_HOURS * 3600_000);
  return `${shifted.getUTCDate()} ${SHORT_MONTHS[locale][shifted.getUTCMonth()]}`;
}
