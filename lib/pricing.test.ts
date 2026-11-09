import { describe, expect, it } from "vitest";
import { salePriceFor } from "@/lib/pricing";

describe("salePriceFor", () => {
  it("discounts a normal product off its price", () => {
    expect(salePriceFor({ priceAmd: 2000, compareAtPriceAmd: null }, 10)).toBe(1800);
  });

  it("discounts an already-on-sale product off its REGULAR price, not the sale price", () => {
    // 1800 regular, currently 1440 (20% off). A 10% catalogue sale must land
    // at 1620 — 10% off 1800 — not 1296, which is 10% off the sale price.
    expect(salePriceFor({ priceAmd: 1440, compareAtPriceAmd: 1800 }, 10)).toBe(1440);
  });

  it("never raises a price: a deeper existing discount survives a shallower sale", () => {
    // 10% off 1800 is 1620, but the product already shows 1440. Keep 1440.
    const result = salePriceFor({ priceAmd: 1440, compareAtPriceAmd: 1800 }, 10);
    expect(result).toBeLessThanOrEqual(1440);
    expect(result).toBe(1440);
  });

  it("deepens the discount when the new sale is bigger", () => {
    // 30% off 1800 is 1260, below the current 1440, so it applies.
    expect(salePriceFor({ priceAmd: 1440, compareAtPriceAmd: 1800 }, 30)).toBe(1260);
  });

  it("is idempotent — running the same sale twice does not compound", () => {
    const once = salePriceFor({ priceAmd: 2000, compareAtPriceAmd: null }, 10);
    const twice = salePriceFor({ priceAmd: once, compareAtPriceAmd: 2000 }, 10);
    expect(once).toBe(1800);
    expect(twice).toBe(1800);
  });

  it("never returns less than 1 AMD", () => {
    expect(salePriceFor({ priceAmd: 10, compareAtPriceAmd: null }, 99)).toBeGreaterThanOrEqual(1);
  });

  it("rounds to whole AMD", () => {
    expect(Number.isInteger(salePriceFor({ priceAmd: 1333, compareAtPriceAmd: null }, 17))).toBe(true);
  });
});
