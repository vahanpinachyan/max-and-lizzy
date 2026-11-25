import type { Locale } from "@/lib/i18n/locales";
import type { Product } from "@/types";
import { getProductsBySlugs, getBestsellers, getFeaturedProducts } from "@/data/products";

/**
 * What goes in the Christmas Collection.
 *
 * The shop's own list, given by article number and looked up in the
 * catalogue. To change it, add or remove a slug below and nothing else; the
 * order here is the order they appear on the page.
 *
 * Five of the numbers the shop sent are not in the catalogue and so are not
 * here: 51491, 61883, 12236, 80601 and 80314.
 *
 * A slug that no longer exists is skipped rather than breaking the page, and
 * if that leaves the collection short, bestsellers and featured products fill
 * the gap — so the page is never empty in front of a customer, whatever
 * happens to the catalogue.
 */
export const CHRISTMAS_PICKS = [
  "goki-tiny-house-hygge", // 51477
  "goki-dolls-house-3-floors", // 51957
  "holztiger-father-christmas", // 80318
  "goki-crocodile-music-station", // 61854
  "rocking-motorcycle", // 53837
  "wooden-rocking-horse", // 53933
  "holztiger-king", // 80237
  "holztiger-queen", // 80238
  "holztiger-shepherd-with-staff", // 80316
  "holztiger-archangel", // 80299
  "holztiger-angel-with-star", // 80288
  "holztiger-baby-jesus-in-manger", // 80310
  "holztiger-noahs-wife", // 80345
  "holztiger-joseph", // 80297
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
