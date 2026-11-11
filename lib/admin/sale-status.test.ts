import { describe, expect, it } from "vitest";
import { formatShopDate, hasSaleSchedule, saleBadge, saleStatus } from "@/lib/admin/sale-status";

const base = { priceAmd: 2000, compareAtPriceAmd: null };
const nov11 = new Date("2026-11-10T20:00:00Z"); // midnight 11 Nov, Yerevan
const nov14 = new Date("2026-11-13T20:00:00Z"); // midnight 14 Nov, Yerevan

describe("saleStatus", () => {
  it("reports no sale when nothing is scheduled", () => {
    expect(saleStatus({ ...base, salePercent: null, saleStartsAt: null, saleEndsAt: null })).toEqual({
      kind: "none",
    });
  });

  it("reports a percentage with no dates as no sale", () => {
    // A half-filled schedule form must not read as a live campaign.
    expect(
      saleStatus({ ...base, salePercent: 10, saleStartsAt: null, saleEndsAt: null }).kind,
    ).toBe("none");
  });

  it("reports a sale running right now as active, with the price shoppers see", () => {
    const status = saleStatus(
      { ...base, salePercent: 10, saleStartsAt: nov11, saleEndsAt: nov14 },
      new Date("2026-11-11T09:00:00Z"),
    );
    expect(status).toMatchObject({ kind: "active", percent: 10, salePrice: 1800, regularPrice: 2000 });
  });

  it("reports a sale that has not started as scheduled, carrying its start date", () => {
    const status = saleStatus(
      { ...base, salePercent: 10, saleStartsAt: nov11, saleEndsAt: nov14 },
      new Date("2026-11-09T09:00:00Z"),
    );
    expect(status).toMatchObject({ kind: "scheduled", percent: 10, salePrice: 1800 });
    expect(status.kind === "scheduled" && status.startsAt.toISOString()).toBe(nov11.toISOString());
  });

  it("reports a window that has closed as no sale — the price has already reverted", () => {
    expect(
      saleStatus(
        { ...base, salePercent: 10, saleStartsAt: nov11, saleEndsAt: nov14 },
        new Date("2026-11-20T09:00:00Z"),
      ).kind,
    ).toBe("none");
  });

  it("handles ISO strings as well as Date objects", () => {
    // The admin page sends these over the server/client boundary as strings.
    const status = saleStatus(
      { ...base, salePercent: 10, saleStartsAt: nov11.toISOString(), saleEndsAt: nov14.toISOString() },
      new Date("2026-11-11T09:00:00Z"),
    );
    expect(status.kind).toBe("active");
  });

  it("shows the sale price off the REGULAR price for a product already discounted", () => {
    const status = saleStatus(
      { priceAmd: 1440, compareAtPriceAmd: 1800, salePercent: 30, saleStartsAt: nov11, saleEndsAt: nov14 },
      new Date("2026-11-11T09:00:00Z"),
    );
    expect(status).toMatchObject({ kind: "active", salePrice: 1260, regularPrice: 1800 });
  });

  it("reports an open-ended running sale as active with no end date", () => {
    const status = saleStatus(
      { ...base, salePercent: 10, saleStartsAt: nov11, saleEndsAt: null },
      new Date("2026-11-11T09:00:00Z"),
    );
    expect(status).toMatchObject({ kind: "active", endsAt: null });
  });

  it("ignores nonsense percentages", () => {
    for (const salePercent of [0, -5, 100, 140]) {
      expect(saleStatus({ ...base, salePercent, saleStartsAt: nov11, saleEndsAt: nov14 }).kind).toBe("none");
    }
  });
});

describe("hasSaleSchedule", () => {
  it("covers both active and scheduled rows, but not spent ones", () => {
    const row = { ...base, salePercent: 10, saleStartsAt: nov11, saleEndsAt: nov14 };
    expect(hasSaleSchedule(row, new Date("2026-11-09T09:00:00Z"))).toBe(true);
    expect(hasSaleSchedule(row, new Date("2026-11-11T09:00:00Z"))).toBe(true);
    expect(hasSaleSchedule(row, new Date("2026-11-20T09:00:00Z"))).toBe(false);
  });
});

describe("saleBadge", () => {
  const row = { ...base, salePercent: 10, saleStartsAt: nov11, saleEndsAt: nov14 };

  it("is null when there is nothing to show", () => {
    expect(saleBadge({ ...base, salePercent: null, saleStartsAt: null, saleEndsAt: null })).toBeNull();
  });

  it("sends only plain JSON across the server/client boundary", () => {
    const badge = saleBadge(row, new Date("2026-11-11T09:00:00Z"));
    expect(badge).toEqual({
      kind: "active",
      percent: 10,
      salePrice: 1800,
      regularPrice: 2000,
      startsAt: null,
      endsAt: nov14.toISOString(),
    });
    expect(JSON.parse(JSON.stringify(badge))).toEqual(badge);
  });

  it("carries the start date for a sale that has not begun", () => {
    expect(saleBadge(row, new Date("2026-11-09T09:00:00Z"))).toMatchObject({
      kind: "scheduled",
      startsAt: nov11.toISOString(),
      endsAt: null,
    });
  });
});

describe("formatShopDate", () => {
  it("reads the instant in the shop's day, not the server's", () => {
    // 19:00 UTC on the 13th is 23:00 on the 13th in Yerevan.
    expect(formatShopDate("2026-11-13T19:00:00Z", "en")).toBe("13 Nov");
    // 21:00 UTC on the 13th is already 01:00 on the 14th there.
    expect(formatShopDate("2026-11-13T21:00:00Z", "en")).toBe("14 Nov");
  });

  it("gives Armenian month names without depending on the runtime's locale data", () => {
    // Intl resolves hy-AM to en-GB in browsers built with a trimmed ICU, which
    // would make the server and the client disagree.
    expect(formatShopDate("2026-11-13T19:00:00Z", "hy")).toBe("13 նոյ");
    expect(formatShopDate("2026-12-24T09:00:00Z", "hy")).toBe("24 դեկ");
  });

  it("names every month in both languages", () => {
    const en = [];
    const hy = [];
    for (let m = 0; m < 12; m += 1) {
      const iso = new Date(Date.UTC(2026, m, 15)).toISOString();
      en.push(formatShopDate(iso, "en"));
      hy.push(formatShopDate(iso, "hy"));
    }
    expect(new Set(en).size).toBe(12);
    expect(new Set(hy).size).toBe(12);
    expect(hy.every((label) => /^\d+ [ա-և]+$/.test(label))).toBe(true);
  });
});
