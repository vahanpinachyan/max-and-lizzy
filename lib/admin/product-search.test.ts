import { describe, expect, test } from "vitest";
import { filterProducts, matchesProductQuery } from "./product-search";

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
