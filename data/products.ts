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

export async function getRelatedProducts(product: Product, locale: Locale = "en"): Promise<Product[]> {
  if (!product.relatedSlugs?.length) return [];
  return getProductsBySlugs(product.relatedSlugs, locale);
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
