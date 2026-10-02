import { describe, expect, test } from "vitest";
import { filterProducts, matchesProductQuery, matchesShopQuery } from "./product-search";

const p = (name: string, sku: string) => ({ name, sku });

describe("matchesProductQuery", () => {
  test("an empty term matches everything, so clearing the box restores the list", () => {
    expect(matchesProductQuery(p("Goki Ukulele", "UC201"), "")).toBe(true);
    expect(matchesProductQuery(p("Goki Ukulele", "UC201"), "   ")).toBe(true);
  });

  test("matches on part of the name, case-insensitively", () => {
    expect(matchesProductQuery(p("Goki Clockwork Tin Mouse, Grey", "14181"), "clockwork")).toBe(true);
    expect(matchesProductQuery(p("Goki Clockwork Tin Mouse, Grey", "14181"), "MOUSE")).toBe(true);
  });

  test("matches on the SKU, which is what staff read off the box", () => {
    expect(matchesProductQuery(p("Goki Ukulele, 52 cm", "UC201"), "UC201")).toBe(true);
    expect(matchesProductQuery(p("Goki Ukulele, 52 cm", "UC201"), "uc201")).toBe(true);
    expect(matchesProductQuery(p("Goki Ukulele, 52 cm", "UC201"), "201")).toBe(true);
  });

  test("ignores surrounding whitespace from a pasted SKU", () => {
    expect(matchesProductQuery(p("Goki Sort Box", "WM254"), "  WM254  ")).toBe(true);
  });

  test("does not match an unrelated term", () => {
    expect(matchesProductQuery(p("Goki Ukulele, 52 cm", "UC201"), "rocking horse")).toBe(false);
  });
});

describe("filterProducts", () => {
  const products = [
    p("Goki Ukulele, 52 cm", "UC201"),
    p("Goki Clockwork Tin Mouse, Grey", "14181"),
    p("Goki Tambourine with 5 Bells", "UC085"),
    p("HOLZTIGER Cow, Standing, Black", "80003"),
  ];

  test("returns the original array when the term is empty", () => {
    expect(filterProducts(products, "")).toBe(products);
  });

  test("narrows by name", () => {
    expect(filterProducts(products, "goki").length).toBe(3);
  });

  test("narrows by SKU prefix shared across products", () => {
    expect(filterProducts(products, "UC").map((x) => x.sku)).toEqual(["UC201", "UC085"]);
  });

  test("returns nothing when there is no match", () => {
    expect(filterProducts(products, "zzzz")).toEqual([]);
  });
});

describe("matchesShopQuery", () => {
  const doudou = {
    name: "Nattou Doudou Susie & Bonnie, Dusty Rose",
    sku: "508483",
    shortDescription: "A bunny comforter in dusty rose from the Susie & Bonnie range.",
    materials: ["Soft plush"],
  };

  test("matches the SKU — the case this was added for", () => {
    expect(matchesShopQuery(doudou, "508483")).toBe(true);
    expect(matchesShopQuery(doudou, "5084")).toBe(true);
  });

  test("still matches name, blurb and material", () => {
    expect(matchesShopQuery(doudou, "susie")).toBe(true);
    expect(matchesShopQuery(doudou, "comforter")).toBe(true);
    expect(matchesShopQuery(doudou, "plush")).toBe(true);
  });

  test("an empty term matches everything", () => {
    expect(matchesShopQuery(doudou, "  ")).toBe(true);
  });

  test("does not match an unrelated term", () => {
    expect(matchesShopQuery(doudou, "tractor")).toBe(false);
  });
});
