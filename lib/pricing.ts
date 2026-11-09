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
