import { describe, it, expect } from "vitest";
import { isLowStock, LOW_STOCK_THRESHOLD } from "./inventory";

describe("isLowStock", () => {
  it("is false when the product isn't in stock at all", () => {
    expect(isLowStock({ inStock: false, stockQuantity: 1 })).toBe(false);
  });

  it("is false when stock quantity isn't tracked (null)", () => {
    expect(isLowStock({ inStock: true, stockQuantity: null })).toBe(false);
  });

  it(`is true right at the threshold (${LOW_STOCK_THRESHOLD})`, () => {
    expect(isLowStock({ inStock: true, stockQuantity: LOW_STOCK_THRESHOLD })).toBe(true);
  });

  it("is false one above the threshold", () => {
    expect(isLowStock({ inStock: true, stockQuantity: LOW_STOCK_THRESHOLD + 1 })).toBe(false);
  });

  it("is true (not a crash) at zero stock", () => {
    expect(isLowStock({ inStock: true, stockQuantity: 0 })).toBe(true);
  });
});
