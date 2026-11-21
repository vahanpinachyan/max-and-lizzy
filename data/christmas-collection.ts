import type { Locale } from "@/lib/i18n/locales";
import type { Product } from "@/types";
import { getProductsBySlugs, getBestsellers, getFeaturedProducts } from "@/data/products";

/**
 * What goes in the Christmas Collection.
 *
 * PLACEHOLDER. These eight were chosen from the existing catalogue as things
 * that read as presents — the rocking horse because it is the shop's own
 * emblem, then a spread of prices from 8,500 to 39,500 AMD and of ages from
 * first blocks to pretend play, so the page is useful whoever is shopping.
 * Nobody has signed off on this list. Replace it with the real one: edit the
 * slugs below and nothing else.
 *
 * A slug that no longer exists is skipped rather than breaking the page, and
 * if that leaves the collection short, bestsellers and featured products fill
 * the gap — so the page is never empty in front of a customer, whatever
 * happens to the catalogue.
 */
export const CHRISTMAS_PICKS = [
  "wooden-rocking-horse",
  "colorful-building-block-box",
  "wooden-shop-cash-register",
  "color-sorting-board",
  "wooden-bead-maze",
  "exploration-building-blocks",
  "wooden-cooking-set",
  "hammer-bench",
] as const;

/** How few products are too few to call it a collection. */
const MIN_PRODUCTS = 6;

export async function getChristmasProducts(locale: Locale = "en"): Promise<Product[]> {
  const picked = await getProductsBySlugs([...CHRISTMAS_PICKS], locale);
  if (picked.length >= MIN_PRODUCTS) return picked;

  const seen = new Set(picked.map((p) => p.slug));
  const [bestsellers, featured] = await Promise.all([
    getBestsellers(locale),
    getFeaturedProducts(locale),
  ]);

  const filler = [...bestsellers, ...featured].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  return [...picked, ...filler].slice(0, CHRISTMAS_PICKS.length);
}
