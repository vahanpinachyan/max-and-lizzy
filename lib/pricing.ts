// Pure pricing rules, kept out of the server action so they can be unit-tested
// without pulling in Prisma or "use server" — same reason lib/admin/product-search.ts
// exists apart from the table that uses it.

export interface SalePricingInput {
  priceAmd: number;
  compareAtPriceAmd: number | null;
}

/**
 * The price a product should show when a `percentOff` sale is applied to it.
 *
 * The discount comes off the *regular* price — compareAtPriceAmd when the
 * product is already on sale, otherwise priceAmd — never off an already
 * discounted figure. Applying 10% across the catalogue therefore lands
 * everything at 10% off its real price instead of compounding: a product
 * already at 20% off would otherwise end at 28% while its neighbours sat at
 * 10%, and re-running the same sale would keep cutting deeper.
 *
 * It also never raises a price. A product discounted below the new sale price
 * keeps the lower one, so a shallower catalogue-wide sale cannot undo a deeper
 * deliberate discount, and no shopper watches a price go up mid-sale.
 */
export function salePriceFor(product: SalePricingInput, percentOff: number): number {
  const regular = product.compareAtPriceAmd ?? product.priceAmd;
  const discounted = Math.max(1, Math.round(regular * (1 - percentOff / 100)));
  return Math.min(discounted, product.priceAmd);
}

export interface SaleWindow {
  salePercent: number | null;
  // Date | string, because these rows reach here two ways. Straight from
  // Prisma they are Date objects; through the Next data cache in
  // data/products.ts they have been serialized and come back as ISO strings.
  // Comparing a Date against such a string silently coerces the string to NaN,
  // so `now >= saleEndsAt` is false forever and the sale never ends. Normalise
  // first rather than trusting the caller's type.
  saleStartsAt: Date | string | null;
  saleEndsAt: Date | string | null;
}

function toInstant(value: Date | string | null): number | null {
  if (value === null) return null;
  const ms = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * The percentage off that is live for this product right now, or null.
 *
 * Evaluated on every read rather than written into priceAmd by a scheduled
 * job. That means a sale begins and ends exactly on its boundaries, needs no
 * cron, and can never get stuck "on" because a job did not run — the worst a
 * failure can do is show the regular price.
 *
 * The window is half-open: a sale running "1 Dec to 25 Dec" includes the
 * instant it starts and stops at the instant saleEndsAt names, so setting the
 * end to midnight on the 26th runs the sale through all of the 25th.
 */
export function activeSalePercent(product: SaleWindow, now: Date = new Date()): number | null {
  const { salePercent } = product;
  if (salePercent === null || salePercent <= 0 || salePercent >= 100) return null;
  const startsAt = toInstant(product.saleStartsAt);
  const endsAt = toInstant(product.saleEndsAt);
  const at = now.getTime();
  if (startsAt !== null && at < startsAt) return null;
  if (endsAt !== null && at >= endsAt) return null;
  // A percentage with no window at all is treated as not scheduled, so a
  // half-filled form cannot silently discount the whole catalogue forever.
  if (startsAt === null && endsAt === null) return null;
  return salePercent;
}

// The shop is in Yerevan, which sits at UTC+4 all year — Armenia has not
// observed daylight saving since 2012, so a fixed offset is correct rather
// than a simplification. Staff pick plain dates, and a sale starting "1
// December" must begin at midnight in the shop's own day, not at 04:00
// because the server parsed a bare date as UTC.
export const SHOP_UTC_OFFSET_HOURS = 4;

/** Start of the given YYYY-MM-DD in shop time, as a UTC instant. */
export function shopDayStart(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const [, y, m, d] = match;
  const utcMidnight = Date.UTC(Number(y), Number(m) - 1, Number(d));
  return new Date(utcMidnight - SHOP_UTC_OFFSET_HOURS * 3600_000);
}

/**
 * End of the given YYYY-MM-DD in shop time, as a UTC instant — midnight at the
 * *end* of that day. Staff expect "to 25 December" to include the 25th, so the
 * boundary is the start of the 26th and activeSalePercent treats it exclusively.
 */
export function shopDayEnd(date: string): Date | null {
  const start = shopDayStart(date);
  return start === null ? null : new Date(start.getTime() + 24 * 3600_000);
}
