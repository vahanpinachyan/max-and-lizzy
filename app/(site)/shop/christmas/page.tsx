import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChristmasProducts } from "@/data/christmas-collection";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { CandyStripe } from "@/components/christmas/CandyStripe";
import { ScriptLettering } from "@/components/christmas/ScriptLettering";
import { getServerDictionary } from "@/lib/i18n/server";
import { getSeason } from "@/lib/season-server";

/**
 * The Christmas Collection.
 *
 * A static route, so it takes precedence over `shop/[category]` and does not
 * need a category record behind it. Out of season it is a 404 rather than an
 * empty page, and it leaves the sitemap at the same moment — see app/sitemap.ts.
 *
 * Which products appear is a placeholder: data/christmas-collection.ts.
 */

/**
 * The headline is drawn lettering rather than a script font. The site stopped
 * fetching fonts from Google at build time, and its own CSP blocks them at
 * runtime, so a script face would have to be vendored and downloaded for one
 * line on one page. These are outlines: nothing extra is fetched, and the
 * lettering cannot quietly fall back to a serif.
 *
 * Armenian has no calligraphic face under an open licence — Noto Sans and
 * Noto Serif Armenian are the whole field — so Armenian is set in the site's
 * own Armenian serif at display size instead of imitating a script badly.
 */
const TITLE_LETTERING: Record<string, { src: string; ratio: number } | null> = {
  en: { src: "/christmas/collection-en.svg", ratio: 6.92 },
  ru: { src: "/christmas/collection-ru.svg", ratio: 9.59 },
  hy: null,
};

export async function generateMetadata(): Promise<Metadata> {
  const { dict: t } = await getServerDictionary();
  return buildMetadata({
    title: t.christmas.metaTitle,
    description: t.christmas.metaDescription,
    pathname: "/shop/christmas",
    keywords: [
      "Christmas toys Yerevan",
      "Christmas gifts for kids Armenia",
      "wooden toys Christmas presents",
      "eco-friendly Christmas gifts Yerevan",
    ],
  });
}

export default async function ChristmasCollectionPage() {
  const season = await getSeason();
  if (season !== "christmas") notFound();

  const { dict: t, locale } = await getServerDictionary();
  const products = await getChristmasProducts(locale);
  const lettering = TITLE_LETTERING[locale] ?? null;

  return (
    <Container className="py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.shop, path: "/shop" },
          { name: t.christmas.collectionTitle, path: "/shop/christmas" },
        ])}
      />

      <nav aria-label={t.breadcrumb.ariaLabel} className="mb-8 text-sm text-espresso/70">
        <ol className="flex gap-2">
          <li>
            <Link href="/shop" className="hover:text-terracotta-dark">
              {t.nav.shop}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-espresso">
            {t.christmas.collectionTitle}
          </li>
        </ol>
      </nav>

      <header className="christmas-collection-head text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-deep">
          {t.christmas.collectionEyebrow}
        </p>

        {lettering ? (
          // The lettering is a picture of words, so the page still needs a
          // real <h1> for the document outline a screen reader walks.
          <h1 className="mt-4">
            <ScriptLettering
              src={lettering.src}
              ratio={lettering.ratio}
              label={t.christmas.collectionTitle}
              className="mx-auto w-full max-w-[420px] text-holly sm:max-w-[520px]"
            />
          </h1>
        ) : (
          <h1 className="mt-4 font-heading text-4xl font-bold text-holly sm:text-5xl">
            {t.christmas.collectionTitle}
          </h1>
        )}

        <p className="mx-auto mt-5 max-w-xl text-espresso/75">{t.christmas.collectionIntro}</p>

        <CandyStripe className="mx-auto mt-8 w-full max-w-sm" />
      </header>

      <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <p className="mt-14 text-center">
        <Link
          href="/shop"
          className="inline-block rounded-full border border-holly/40 px-6 py-3 text-sm font-semibold text-holly transition-colors hover:bg-holly hover:text-snow"
        >
          {t.nav.shopAllProducts}
        </Link>
      </p>
    </Container>
  );
}
