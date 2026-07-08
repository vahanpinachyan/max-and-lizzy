import { NextResponse } from "next/server";
import { getProductsBySlugs } from "@/data/products";
import { isLocale, defaultLocale } from "@/lib/i18n/locales";

// Client components can't query Prisma directly (it only runs server-side),
// so the wishlist drawer/page — which resolves slugs read from
// localStorage — fetches full product data through this route instead.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slugsParam = url.searchParams.get("slugs") ?? "";
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);

  const products = await getProductsBySlugs(slugs, locale);
  return NextResponse.json({ products });
}
