import "server-only";
import { prisma } from "@/lib/db";
import type { Product, ProductImage, AgeRange, Category } from "@/types";
import type { Locale } from "@/lib/i18n/locales";
import type { Product as DbProduct } from "@prisma/client";
import { getRatingsMap } from "@/lib/reviews";

// Product data now lives in the database (see prisma/schema.prisma) so it
// can be managed from /admin instead of requiring a code change + deploy
// for every stock update or new toy. This file keeps the same function
// names the rest of the app already calls, so only two things changed at
// each call site: add `await`, and pass the current `locale`.
function pick(locale: Locale, en: string, hy: string | null, ru: string | null): string {
  if (locale === "hy") return hy || en;
  if (locale === "ru") return ru || en;
  return en;
}

function mapProduct(row: DbProduct, locale: Locale): Product {
  return {
    slug: row.slug,
    name: pick(locale, row.name, row.nameHy, row.nameRu),
    shortDescription: pick(locale, row.shortDescription, row.shortDescriptionHy, row.shortDescriptionRu),
    description: pick(locale, row.description, row.descriptionHy, row.descriptionRu),
    priceAmd: row.priceAmd,
    compareAtPriceAmd: row.compareAtPriceAmd ?? undefined,
    category: row.category as Category,
    subcategory: row.subcategory,
    ageRange: row.ageRange as AgeRange,
    materials: JSON.parse(row.materials),
    safetyInfo: JSON.parse(row.safetyInfo),
    brand: row.brand,
    images: JSON.parse(row.images) as ProductImage[],
    inStock: row.inStock,
    sku: row.sku,
    featured: row.featured,
    bestseller: row.bestseller,
    newArrival: row.newArrival,
    relatedSlugs: row.relatedSlugs ? JSON.parse(row.relatedSlugs) : undefined,
    dimensions: row.dimensions ?? undefined,
    weightGrams: row.weightGrams ?? undefined,
    careInstructions: row.careInstructions ?? undefined,
    countryOfOrigin: row.countryOfOrigin ?? undefined,
    packageContents: row.packageContents ?? undefined,
    assemblyRequired: row.assemblyRequired ?? undefined,
    assemblyNote: row.assemblyNote ?? undefined,
    supervisionNote: row.supervisionNote ?? undefined,
    warranty: row.warranty ?? undefined,
    pickBy: (row.pickBy as "max" | "lizzy" | null) ?? undefined,
    pickNote: pick(locale, row.pickNote ?? "", row.pickNoteHy, row.pickNoteRu) || undefined,
  };
}

// Merges rating/reviewCount (computed from the Review table) onto already-
// mapped products with a single grouped query, instead of one query per card.
async function attachRatings(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;
  const ratings = await getRatingsMap(products.map((p) => p.slug));
  return products.map((p) => {
    const r = ratings.get(p.slug);
    return { ...p, rating: r?.average ?? null, reviewCount: r?.count ?? 0 };
  });
}

export async function getAllProducts(locale: Locale = "en"): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return attachRatings(rows.map((r) => mapProduct(r, locale)));
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getProduct(slug: string, locale: Locale = "en"): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { slug } });
  if (!row) return undefined;
  const [withRating] = await attachRatings([mapProduct(row, locale)]);
  return withRating;
}

export async function getProductsBySlugs(slugs: string[], locale: Locale = "en"): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { slug: { in: slugs } } });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  // Preserve the caller's slug order (matters for related-products and
  // wishlist display order) rather than whatever order the DB returns.
  const products = slugs
    .map((s) => bySlug.get(s))
    .filter((r): r is DbProduct => Boolean(r))
    .map((r) => mapProduct(r, locale));
  return attachRatings(products);
}

export async function getProductsByCategory(category: string, locale: Locale = "en"): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { category }, orderBy: { createdAt: "asc" } });
  return attachRatings(rows.map((r) => mapProduct(r, locale)));
}

export async function getFeaturedProducts(locale: Locale = "en"): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { featured: true }, orderBy: { createdAt: "asc" } });
  return attachRatings(rows.map((r) => mapProduct(r, locale)));
}

export async function getBestsellers(locale: Locale = "en"): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { bestseller: true }, orderBy: { createdAt: "asc" } });
  return attachRatings(rows.map((r) => mapProduct(r, locale)));
}

// "You might also like". Only the original hand-curated products carry
// relatedSlugs; everything imported via /admin CSV has none, so without a
// fallback the section disappears on almost the whole catalogue. Curated
// slugs still win and keep their order — we only top the list up to RELATED_COUNT.
const RELATED_COUNT = 4;
const AGE_ORDER: readonly string[] = ["0-3", "3-6", "6-12"];
// At most this many suggestions from one product family, so a lift-out puzzle
// doesn't recommend three more lift-out puzzles.
const MAX_PER_FAMILY = 2;

type RelatedCandidate = {
  slug: string;
  name: string;
  priceAmd: number;
  category: string;
  subcategory: string;
  ageRange: string;
  brand: string;
  inStock: boolean;
  bestseller: boolean;
  featured: boolean;
};

// Groups near-identical products ("Goki Inlay Puzzle, Africa" / ", Space") by
// the first few words of the untranslated name, which is the part that repeats.
function familyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}

function relatedScore(base: RelatedCandidate, other: RelatedCandidate): number {
  let score = 0;
  if (other.subcategory === base.subcategory) score += 100;
  else if (other.category === base.category) score += 40;

  const baseAge = AGE_ORDER.indexOf(base.ageRange);
  const otherAge = AGE_ORDER.indexOf(other.ageRange);
  if (baseAge !== -1 && otherAge !== -1) {
    const gap = Math.abs(baseAge - otherAge);
    score += gap === 0 ? 30 : gap === 1 ? 12 : 0;
  }

  if (other.brand === base.brand) score += 10;

  // Log ratio so the penalty is scale-free: a 4x difference in either
  // direction scores 0, which keeps a 140,000 AMD pedal car out of the
  // suggestions under a 400 AMD sliding puzzle.
  if (base.priceAmd > 0 && other.priceAmd > 0) {
    const ratio = Math.abs(Math.log(other.priceAmd / base.priceAmd));
    score += Math.max(0, 40 * (1 - ratio / Math.log(4)));
  }

  if (other.inStock) score += 15;
  if (other.bestseller) score += 6;
  if (other.featured) score += 4;
  return score;
}

const RELATED_SELECT = {
  slug: true,
  name: true,
  priceAmd: true,
  category: true,
  subcategory: true,
  ageRange: true,
  brand: true,
  inStock: true,
  bestseller: true,
  featured: true,
} as const;

async function computeRelatedSlugs(product: Product, exclude: string[], take: number): Promise<string[]> {
  if (take <= 0) return [];
  const skip = new Set([product.slug, ...exclude]);

  // Same category first (at most a few hundred narrow rows); widen to the
  // whole catalogue only if that isn't enough to fill the row.
  let rows: RelatedCandidate[] = await prisma.product.findMany({
    where: { category: product.category, slug: { notIn: Array.from(skip) } },
    select: RELATED_SELECT,
  });
  if (rows.length < take) {
    rows = await prisma.product.findMany({
      where: { slug: { notIn: Array.from(skip) } },
      select: RELATED_SELECT,
    });
  }

  const base: RelatedCandidate = {
    slug: product.slug,
    name: product.name,
    priceAmd: product.priceAmd,
    category: product.category,
    subcategory: product.subcategory,
    ageRange: product.ageRange,
    brand: product.brand,
    inStock: product.inStock,
    bestseller: product.bestseller ?? false,
    featured: product.featured ?? false,
  };

  const ranked = rows
    .map((row) => ({ row, score: relatedScore(base, row) }))
    // Slug breaks ties so the row is stable between requests and deploys.
    .sort((a, b) => b.score - a.score || a.row.slug.localeCompare(b.row.slug));

  const picked: string[] = [];
  const familyCount = new Map<string, number>();
  for (const pass of [MAX_PER_FAMILY, Infinity]) {
    for (const { row } of ranked) {
      if (picked.length >= take) break;
      if (picked.includes(row.slug)) continue;
      const key = familyKey(row.name);
      const used = familyCount.get(key) ?? 0;
      if (used >= pass) continue;
      familyCount.set(key, used + 1);
      picked.push(row.slug);
    }
    if (picked.length >= take) break;
  }
  return picked;
}

export async function getRelatedProducts(product: Product, locale: Locale = "en"): Promise<Product[]> {
  const curated = (product.relatedSlugs ?? []).filter((s) => s !== product.slug);
  const computed = await computeRelatedSlugs(product, curated, RELATED_COUNT - curated.length);
  const slugs = [...curated, ...computed].slice(0, RELATED_COUNT);
  if (slugs.length === 0) return [];
  return getProductsBySlugs(slugs, locale);
}

export async function getAllMaterials(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { materials: true } });
  const set = new Set<string>();
  rows.forEach((r) => (JSON.parse(r.materials) as string[]).forEach((m) => set.add(m)));
  return Array.from(set).sort();
}

export async function getAllBrands(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { brand: true }, distinct: ["brand"] });
  return rows.map((r) => r.brand).sort();
}
