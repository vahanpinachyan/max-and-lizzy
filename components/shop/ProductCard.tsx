"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatAmd, ageRangeLabel } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/use-wishlist";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";

export function ProductCard({
  product,
  onQuickView,
  size = "default",
}: {
  product: Product;
  onQuickView?: (product: Product) => void;
  size?: "default" | "large";
}) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { locale } = useI18n();
  const t = useTranslations();
  const wishlisted = isWishlisted(product.slug);
  const rating = product.rating ?? null;
  const reviewCount = product.reviewCount ?? 0;
  const discountPct =
    product.compareAtPriceAmd && product.compareAtPriceAmd > product.priceAmd
      ? Math.round(100 - (product.priceAmd / product.compareAtPriceAmd) * 100)
      : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-tan/50 bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/product/${product.slug}`}
        className={`relative block overflow-hidden bg-beige ${
          size === "large" ? "aspect-[4/5]" : "aspect-square"
        }`}
      >
        <Image
          src={product.images[0]?.src}
          alt={product.images[0]?.alt ?? product.name}
          fill
          quality={90}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes={
            size === "large"
              ? "(min-width: 1024px) 42vw, 100vw"
              : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          }
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {discountPct !== null && (
            <Badge variant="rose" onImage className="justify-center leading-none">
              -{discountPct}%
            </Badge>
          )}
          {product.pickBy && (
            <Badge
              variant={product.pickBy === "max" ? "wood" : "rose"}
              onImage
              className="justify-center leading-none"
            >
              {product.pickBy === "max" ? t.badges.maxPick : t.badges.lizzyPick}
            </Badge>
          )}
          {product.bestseller && (
            <Badge variant="terracotta" onImage className="justify-center leading-none">
              {t.badges.bestseller}
            </Badge>
          )}
          {product.newArrival && (
            <Badge variant="sage" onImage className="justify-center leading-none">
              {t.badges.new}
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="neutral" onImage className="justify-center leading-none">
              {t.badges.outOfStock}
            </Badge>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.slug);
          }}
          aria-pressed={wishlisted}
          aria-label={interpolate(wishlisted ? t.wishlist.removeAriaLabel : t.wishlist.addAriaLabel, { name: product.name })}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-espresso shadow transition-transform duration-200 hover:scale-110"
        >
          <HeartIcon filled={wishlisted} size={18} />
        </button>
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            aria-label={`${t.product.quickView}: ${product.name}`}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-espresso opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path
                d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" strokeWidth="1.75" />
            </svg>
          </button>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-dark">
          {ageRangeLabel(product.ageRange, locale)}
        </p>
        <Link href={`/product/${product.slug}`} className="mt-1">
          <h3
            className={`break-words font-semibold text-espresso line-clamp-2 transition-colors hover:text-terracotta-dark ${
              size === "large" ? "text-lg sm:text-xl" : ""
            }`}
          >
            {product.name}
          </h3>
        </Link>
        {rating && (
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating rating={rating} size={14} ariaLabel={interpolate(t.product.ratedAria, { rating })} />
            <span className="text-xs text-espresso/60">({reviewCount})</span>
          </div>
        )}
        <p className={`break-words mt-1 text-sm text-espresso/70 ${size === "large" ? "line-clamp-3" : "line-clamp-2"}`}>
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="flex min-h-11 min-w-0 flex-col justify-end">
            {product.compareAtPriceAmd && (
              <span className="text-xs text-espresso/70 line-through">{formatAmd(product.compareAtPriceAmd, locale)}</span>
            )}
            <span className="text-sm font-bold text-espresso sm:text-base">{formatAmd(product.priceAmd, locale)}</span>
          </div>
          {size === "large" ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={!product.inStock}
              onClick={() => addItem(product)}
              aria-label={interpolate(t.product.addToCartAria, { name: product.name })}
              className="shrink-0 whitespace-nowrap"
            >
              {product.inStock ? t.product.addToCart : t.product.soldOut}
            </Button>
          ) : (
            <button
              disabled={!product.inStock}
              onClick={() => addItem(product)}
              aria-label={interpolate(product.inStock ? t.product.addToCartAria : t.product.soldOutAria, { name: product.name })}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wood text-white transition-colors hover:bg-wood-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="20" r="1.3" fill="currentColor" />
                <circle cx="17" cy="20" r="1.3" fill="currentColor" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
