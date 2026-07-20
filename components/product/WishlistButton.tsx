"use client";

import { useWishlist } from "@/lib/use-wishlist";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { useTranslations } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";

export function WishlistButton({ slug, productName }: { slug: string; productName: string }) {
  const { isWishlisted, toggle } = useWishlist();
  const t = useTranslations();
  const wishlisted = isWishlisted(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={wishlisted}
      aria-label={interpolate(wishlisted ? t.wishlist.removeAriaLabel : t.wishlist.addAriaLabel, { name: productName })}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tan bg-white text-espresso shadow-sm transition-transform duration-200 hover:scale-110"
    >
      <HeartIcon filled={wishlisted} size={20} />
    </button>
  );
}
