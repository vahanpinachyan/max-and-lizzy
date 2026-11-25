import { describe, expect, it } from "vitest";
import { localizePromotions } from "@/lib/i18n/localize-data";

// Inside the 11.11 window: midday on the 11th in Yerevan (UTC+4).
const duringSale = new Date("2026-11-11T08:00:00Z");

function saleSlide(locale: "en" | "hy" | "ru", now = duringSale) {
  return localizePromotions(locale, now).find((p) => p.slug === "sale-11-11");
}

describe("localizePromotions — artwork per language", () => {
  it("gives English visitors the English artwork", () => {
    expect(saleSlide("en")?.image).toBe("/images/promotions/sale-11-11-en-v1.jpg");
  });

  it("gives Armenian visitors the Armenian artwork", () => {
    expect(saleSlide("hy")?.image).toBe("/images/promotions/sale-11-11-hy-v1.jpg");
  });

  it("falls back to the English artwork for Russian, which has none of its own", () => {
    expect(saleSlide("ru")?.image).toBe("/images/promotions/sale-11-11-en-v1.jpg");
  });

  it("still translates the copy over that artwork", () => {
    expect(saleSlide("hy")?.ctaLabel).toBe("Այցելել խանութ");
    expect(saleSlide("ru")?.title).toContain("скидка 10%");
  });

  it("leaves slides whose artwork has no words on a single image", () => {
    for (const locale of ["en", "hy", "ru"] as const) {
      const musical = localizePromotions(locale, duringSale).find((p) => p.slug === "musical-toys");
      expect(musical?.image).toBe("/images/promotions/musical-toys-v1.jpg");
    }
  });
});

describe("localizePromotions — run dates", () => {
  it("hides the sale slide before it starts, in every language", () => {
    // 23:00 on the 10th in Yerevan — an hour before the sale opens.
    const beforeStart = new Date("2026-11-10T19:00:00Z");
    for (const locale of ["en", "hy", "ru"] as const) {
      expect(localizePromotions(locale, beforeStart).some((p) => p.slug === "sale-11-11")).toBe(false);
    }
  });

  it("shows it the moment the 11th begins in Yerevan", () => {
    const atStart = new Date("2026-11-10T20:00:00Z");
    expect(localizePromotions("en", atStart).some((p) => p.slug === "sale-11-11")).toBe(true);
  });

  it("keeps it up through the whole of the 13th", () => {
    const lateOnLastDay = new Date("2026-11-13T19:59:00Z"); // 23:59 in Yerevan
    expect(localizePromotions("en", lateOnLastDay).some((p) => p.slug === "sale-11-11")).toBe(true);
  });

  it("takes it down when the 14th begins — nobody has to remember to", () => {
    const after = new Date("2026-11-13T20:00:00Z");
    expect(localizePromotions("en", after).some((p) => p.slug === "sale-11-11")).toBe(false);
  });

  it("gives every language the same wordless mobile artwork", () => {
    // The wide artwork has the offer written into it, so each language needs
    // its own. The phone cut is just Max and Lizzy, so one file serves all
    // three — and the Armenian override must not drop it.
    const during = new Date("2026-11-11T12:00:00Z");
    for (const locale of ["en", "hy", "ru"] as const) {
      const sale = localizePromotions(locale, during).find((p) => p.slug === "sale-11-11");
      expect(sale?.imageMobile).toBe("/images/promotions/sale-11-11-mobile-v1.jpg");
    }
  });

  it("leaves the undated slides alone whatever the date", () => {
    const longAfter = new Date("2027-06-01T12:00:00Z");
    const slugs = localizePromotions("en", longAfter).map((p) => p.slug);
    expect(slugs).toContain("musical-toys");
    expect(slugs).not.toContain("sale-11-11");
  });
});

describe("localizePromotions — the seasonal slide", () => {
  const inDecember = new Date("2026-12-10T12:00:00Z");
  const inJuly = new Date("2027-07-10T12:00:00Z");

  it("shows the Christmas slide while the dressing is up", () => {
    const slugs = localizePromotions("en", inDecember, "christmas").map((p) => p.slug);
    expect(slugs).toContain("christmas-collection");
    // It leads: it is the first thing a visitor sees in season.
    expect(slugs[0]).toBe("christmas-collection");
  });

  it("hides it the moment the season is off, whatever the date", () => {
    // This is the case that matters. The slide points at /shop/christmas, a
    // route that does not exist out of season, so a slide left behind by the
    // master switch would be a link straight to a 404.
    const slugs = localizePromotions("en", inDecember, "none").map((p) => p.slug);
    expect(slugs).not.toContain("christmas-collection");
  });

  it("hides it in July without anyone editing a date", () => {
    expect(
      localizePromotions("en", inJuly).some((p) => p.slug === "christmas-collection"),
    ).toBe(false);
  });

  it("translates the copy but keeps one set of wordless artwork", () => {
    for (const locale of ["en", "hy", "ru"] as const) {
      const slide = localizePromotions(locale, inDecember, "christmas").find(
        (p) => p.slug === "christmas-collection",
      );
      expect(slide?.image).toBe("/images/promotions/christmas-collection-v1.jpg");
      expect(slide?.imageMobile).toBe("/images/promotions/christmas-collection-mobile-v1.jpg");
      expect(slide?.href).toBe("/shop/christmas");
    }
    expect(
      localizePromotions("ru", inDecember, "christmas").find(
        (p) => p.slug === "christmas-collection",
      )?.title,
    ).toBe("Рождественская коллекция");
  });
});
