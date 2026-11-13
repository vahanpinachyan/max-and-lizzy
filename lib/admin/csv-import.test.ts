import { describe, expect, it } from "vitest";
import {
  csvBool,
  csvCreateData,
  csvRowToRecord,
  csvUpdateData,
  isEmptyUpdate,
} from "@/lib/admin/csv-import";

// A stand-in for what buildProductData returns: every column, always.
const fullData = {
  slug: "goki-contour-puzzle",
  sku: "GK-57894",
  name: "Contour Puzzle",
  priceAmd: 0,
  category: "",
  subcategory: "",
  ageRange: "0-3",
  brand: "",
  materials: "[]",
  safetyInfo: "[]",
  images: "[]",
  relatedSlugs: null,
  inStock: false,
  featured: false,
  bestseller: false,
  stockQuantity: null,
};

describe("csvBool", () => {
  it("reads the accepted truthy spellings", () => {
    for (const raw of ["true", "1", "yes", "y", "in stock", "on", "  YES  "]) {
      expect(csvBool(raw)).toBe("true");
    }
  });

  it("reads anything unrecognised as false", () => {
    for (const raw of ["false", "0", "no", "out of stock", "maybe"]) {
      expect(csvBool(raw)).toBe("false");
    }
  });

  it("returns undefined for a blank cell so the stored value is left alone", () => {
    expect(csvBool("")).toBeUndefined();
    expect(csvBool("   ")).toBeUndefined();
    expect(csvBool(null)).toBeUndefined();
    expect(csvBool(undefined)).toBeUndefined();
  });
});

describe("csvRowToRecord", () => {
  it("reports only the headers that carried a value", () => {
    const { supplied } = csvRowToRecord(
      ["slug", "priceAmd", "category"],
      ["goki-contour-puzzle", "4500", "   "],
    );
    expect([...supplied].sort()).toEqual(["priceAmd", "slug"]);
  });

  it("normalizes supplied booleans to literal strings", () => {
    const { record, supplied } = csvRowToRecord(["slug", "inStock"], ["x", "no"]);
    expect(record.inStock).toBe("false");
    expect(supplied.has("inStock")).toBe(true);
  });

  it("drops a boolean whose cell is blank", () => {
    const { record, supplied } = csvRowToRecord(["slug", "inStock"], ["x", ""]);
    expect("inStock" in record).toBe(false);
    expect(supplied.has("inStock")).toBe(false);
  });

  it("tolerates a row with fewer cells than headers", () => {
    const { record, supplied } = csvRowToRecord(["slug", "sku", "brand"], ["x"]);
    expect(record.sku).toBe("");
    expect([...supplied]).toEqual(["slug"]);
  });
});

describe("csvUpdateData", () => {
  it("writes only the columns the spreadsheet supplied", () => {
    const { supplied } = csvRowToRecord(["slug", "priceAmd"], ["goki-contour-puzzle", "4500"]);
    expect(Object.keys(csvUpdateData(fullData, supplied)).sort()).toEqual(["priceAmd", "slug"]);
  });

  // The regression this module exists for: a price-list CSV with no inStock
  // column used to restock the entire catalogue.
  it("leaves inStock untouched when the CSV has no inStock column", () => {
    const { supplied } = csvRowToRecord(["slug", "priceAmd"], ["goki-contour-puzzle", "4500"]);
    expect("inStock" in csvUpdateData(fullData, supplied)).toBe(false);
  });

  it("does write inStock when the column is present and filled", () => {
    const { record, supplied } = csvRowToRecord(["slug", "inStock"], ["goki-contour-puzzle", "no"]);
    expect(record.inStock).toBe("false");
    expect(csvUpdateData({ ...fullData, inStock: false }, supplied)).toEqual({
      slug: "goki-contour-puzzle",
      inStock: false,
    });
  });

  it("never clears curated relatedSlugs, which has no CSV column", () => {
    const { supplied } = csvRowToRecord(
      ["slug", "sku", "name", "priceAmd", "category"],
      ["x", "y", "z", "100", "toys"],
    );
    expect("relatedSlugs" in csvUpdateData(fullData, supplied)).toBe(false);
  });

  it("treats the legacy imageSrcs/imageAlts headers as supplying images", () => {
    const { supplied } = csvRowToRecord(["slug", "imageSrcs"], ["x", "/a.jpg"]);
    expect("images" in csvUpdateData(fullData, supplied)).toBe(true);
  });
});

describe("csvCreateData", () => {
  it("carries the columns Prisma cannot default even when the CSV is silent", () => {
    const { supplied } = csvRowToRecord(["slug", "sku", "name"], ["x", "y", "z"]);
    const created = csvCreateData(fullData, supplied);
    for (const key of ["priceAmd", "category", "ageRange", "materials", "images"]) {
      expect(key in created).toBe(true);
    }
  });

  it("omits the flags so the schema defaults apply to a new product", () => {
    const { supplied } = csvRowToRecord(["slug", "sku", "name"], ["x", "y", "z"]);
    const created = csvCreateData(fullData, supplied);
    expect("inStock" in created).toBe(false);
    expect("featured" in created).toBe(false);
    expect("stockQuantity" in created).toBe(false);
  });

  it("still honours a flag the CSV did supply", () => {
    const { supplied } = csvRowToRecord(["slug", "sku", "name", "featured"], ["x", "y", "z", "yes"]);
    expect(csvCreateData({ ...fullData, featured: true }, supplied).featured).toBe(true);
  });
});

describe("isEmptyUpdate", () => {
  it("flags a row that supplied nothing but the slug it matched on", () => {
    expect(isEmptyUpdate({ slug: "x" })).toBe(true);
  });

  it("does not flag a row with a real column", () => {
    expect(isEmptyUpdate({ slug: "x", priceAmd: 4500 })).toBe(false);
  });
});
