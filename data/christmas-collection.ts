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
 * Sixteen of the numbers the shop sent are not in the catalogue and so are
 * not here: 12236, 14135, 14136, 14151, 14167, 14168, 14175, 15555, 15570,
 * 51491, 58718, 59961, 59964, 61883, 80314 and 80601.
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
  "goki-activity-cube", // 58735
  "goki-music-box-ballerina-with-drawer", // 15566
  "goki-humming-top-forest-friends", // 53780
  "goki-humming-top-lifestyle-mallow", // 53797
  "goki-dolls-house-living-room-set", // 51904
  "goki-portable-dollhouse-eco", // 51458
  "goki-kaleidoscope-with-melody", // 14156
  "goki-kaleidoscope-large-with-rotating-chamber", // 14057
  "goki-telescope-pirates", // 60714
  "goki-kaleidoscope-pirates", // 60861
  "goki-doctors-case", // 51009
  "goki-dolls-house-furniture-childrens-room", // 51905
  "goki-dolls-furniture-childrens-room", // 51953
  "ride-on-vehicle-blue", // 14166
  "goki-ride-on-car-black", // 14164
  "goki-pedal-car-red-1938", // 14062
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
