import { describe, expect, it } from "vitest";
import { activeSalePercent, salePriceFor, shopDayEnd, shopDayStart } from "@/lib/pricing";

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

describe("activeSalePercent", () => {
  const d = (iso: string) => new Date(iso);

  it("is null with no window, even when a percentage is set", () => {
    expect(activeSalePercent({ salePercent: 20, saleStartsAt: null, saleEndsAt: null })).toBeNull();
  });

  it("is null before the sale starts", () => {
    expect(
      activeSalePercent(
        { salePercent: 20, saleStartsAt: d("2026-12-01T00:00:00Z"), saleEndsAt: d("2026-12-26T00:00:00Z") },
        d("2026-11-30T23:59:59Z"),
      ),
    ).toBeNull();
  });

  it("is live inside the window", () => {
    expect(
      activeSalePercent(
        { salePercent: 20, saleStartsAt: d("2026-12-01T00:00:00Z"), saleEndsAt: d("2026-12-26T00:00:00Z") },
        d("2026-12-25T12:00:00Z"),
      ),
    ).toBe(20);
  });

  it("stops exactly at the end instant", () => {
    const window = { salePercent: 20, saleStartsAt: d("2026-12-01T00:00:00Z"), saleEndsAt: d("2026-12-26T00:00:00Z") };
    expect(activeSalePercent(window, d("2026-12-25T23:59:59Z"))).toBe(20);
    expect(activeSalePercent(window, d("2026-12-26T00:00:00Z"))).toBeNull();
  });

  it("rejects nonsense percentages rather than discounting to nothing", () => {
    const w = { saleStartsAt: d("2026-12-01T00:00:00Z"), saleEndsAt: d("2026-12-26T00:00:00Z") };
    expect(activeSalePercent({ ...w, salePercent: 0 })).toBeNull();
    expect(activeSalePercent({ ...w, salePercent: 100 })).toBeNull();
    expect(activeSalePercent({ ...w, salePercent: -5 })).toBeNull();
  });
});

describe("shop timezone dates", () => {
  it("starts a sale at midnight in Yerevan, not UTC", () => {
    // 1 Dec 00:00 UTC+4 is 30 Nov 20:00 UTC.
    expect(shopDayStart("2026-12-01")?.toISOString()).toBe("2026-11-30T20:00:00.000Z");
  });

  it("includes the whole end day", () => {
    // "to 25 Dec" runs until midnight starting the 26th, Yerevan time.
    expect(shopDayEnd("2026-12-25")?.toISOString()).toBe("2026-12-25T20:00:00.000Z");
  });

  it("rejects malformed dates", () => {
    expect(shopDayStart("not-a-date")).toBeNull();
    expect(shopDayEnd("2026-13-45x")).toBeNull();
  });
});

describe("activeSalePercent with cache-serialized dates", () => {
  // Rows that pass through the Next data cache come back with ISO strings
  // where Prisma handed over Date objects. Comparing a Date to such a string
  // coerces it to NaN, every comparison is false, and the sale never ends --
  // which is exactly how this broke the first time.
  const startsIso = "2026-12-01T00:00:00.000Z";
  const endsIso = "2026-12-26T00:00:00.000Z";

  it("expires on time when the window arrived as strings", () => {
    expect(
      activeSalePercent(
        { salePercent: 10, saleStartsAt: startsIso, saleEndsAt: endsIso },
        new Date("2026-12-26T00:00:01Z"),
      ),
    ).toBeNull();
  });

  it("is live inside the window when it arrived as strings", () => {
    expect(
      activeSalePercent(
        { salePercent: 10, saleStartsAt: startsIso, saleEndsAt: endsIso },
        new Date("2026-12-10T00:00:00Z"),
      ),
    ).toBe(10);
  });

  it("has not started yet when it arrived as strings", () => {
    expect(
      activeSalePercent(
        { salePercent: 10, saleStartsAt: startsIso, saleEndsAt: endsIso },
        new Date("2026-11-30T12:00:00Z"),
      ),
    ).toBeNull();
  });

  it("gives the same answer for Date and string forms", () => {
    const at = new Date("2026-12-10T00:00:00Z");
    const asDates = activeSalePercent(
      { salePercent: 10, saleStartsAt: new Date(startsIso), saleEndsAt: new Date(endsIso) },
      at,
    );
    const asStrings = activeSalePercent({ salePercent: 10, saleStartsAt: startsIso, saleEndsAt: endsIso }, at);
    expect(asStrings).toBe(asDates);
  });

  it("treats an unparseable date as no window rather than an always-on sale", () => {
    expect(
      activeSalePercent({ salePercent: 10, saleStartsAt: "garbage", saleEndsAt: "garbage" }, new Date()),
    ).toBeNull();
  });
});
