import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts, getAllProductSlugs } from "@/data/products";
import { getApprovedReviews } from "@/lib/reviews";
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getCategory } from "@/data/categories";
import { formatAmd, ageRangeLabel } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { ImageGallery } from "@/components/product/ImageGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { StickyAddToCart } from "@/components/product/StickyAddToCart";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductFacts } from "@/components/product/ProductFacts";
import { PickCallout } from "@/components/product/PickCallout";
import { Reviews } from "@/components/product/Reviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getServerDictionary } from "@/lib/i18n/server";
import { localizeCategory } from "@/lib/i18n/localize-data";
import { interpolate } from "@/lib/i18n/interpolate";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.name,
    description: product.shortDescription,
    pathname: `/product/${product.slug}`,
    image: product.images[0]?.src,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { dict: t, locale } = await getServerDictionary();
  const product = await getProduct(slug, locale);
  if (!product) notFound();

  const reviews = await getApprovedReviews(product.slug);
  const averageRating = product.rating ?? null;
  const related = await getRelatedProducts(product, locale);
  const rawCategory = getCategory(product.category);
  const category = rawCategory ? localizeCategory(rawCategory, locale) : undefined;
  const addToCartId = "product-add-to-cart";

  return (
    <Container className="py-10">
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.shop, path: "/shop" },
          ...(category ? [{ name: category.name, path: `/shop/${category.slug}` }] : []),
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      <nav aria-label={t.breadcrumb.ariaLabel} className="mb-6 text-sm text-espresso/70">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/shop" className="hover:text-terracotta-dark">{t.nav.shop}</Link></li>
          {category && (
            <>
              <li aria-hidden="true">/</li>
              <li><Link href={`/shop/${category.slug}`} className="hover:text-terracotta-dark">{category.name}</Link></li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-espresso">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ImageGallery images={product.images} productName={product.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="sage">{ageRangeLabel(product.ageRange, locale)}</Badge>
            {product.compareAtPriceAmd && product.compareAtPriceAmd > product.priceAmd && (
              <Badge variant="rose">
                -{Math.round(100 - (product.priceAmd / product.compareAtPriceAmd) * 100)}%
              </Badge>
            )}
            {product.pickBy && (
              <Badge variant={product.pickBy === "max" ? "wood" : "rose"}>
                {product.pickBy === "max" ? t.badges.maxPick : t.badges.lizzyPick}
              </Badge>
            )}
            {product.bestseller && <Badge variant="terracotta">{t.badges.bestseller}</Badge>}
            {product.newArrival && <Badge variant="wood">{t.badges.new}</Badge>}
            {!product.inStock && <Badge variant="neutral">{t.badges.outOfStock}</Badge>}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-espresso sm:text-4xl">{product.name}</h1>

          {averageRating && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={averageRating} showValue ariaLabel={interpolate(t.product.ratedAria, { rating: averageRating })} />
              <span className="text-sm text-espresso/70">({reviews.length} {t.product.reviewsWord})</span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-2xl font-bold text-espresso">{formatAmd(product.priceAmd, locale)}</p>
            {product.compareAtPriceAmd && (
              <p className="text-lg text-espresso/70 line-through">{formatAmd(product.compareAtPriceAmd, locale)}</p>
            )}
          </div>
          <p className="mt-4 text-espresso/80">{product.description}</p>

          {product.pickBy && product.pickNote && (
            <PickCallout
              pickBy={product.pickBy}
              note={product.pickNote}
              label={product.pickBy === "max" ? t.badges.maxPick : t.badges.lizzyPick}
            />
          )}

          <div className="mt-6 flex items-center gap-3">
            <AddToCart product={product} id={addToCartId} />
            <WishlistButton slug={product.slug} productName={product.name} />
          </div>

          <p className="mt-4 text-sm text-espresso/70">{t.product.sku}: {product.sku}</p>

          <div className="mt-8">
            <ProductFacts product={product} />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Reviews reviews={reviews} averageRating={averageRating} />
      </div>

      <RelatedProducts products={related} />

      <StickyAddToCart product={product} targetId={addToCartId} />
    </Container>
  );
}
