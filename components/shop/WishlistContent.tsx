"use client";

import { useWishlistProducts } from "@/lib/use-wishlist-products";
import { ProductCard } from "@/components/shop/ProductCard";
import { LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { useTranslations } from "@/lib/i18n/context";

export function WishlistContent() {
  const { products, loading } = useWishlistProducts();
  const t = useTranslations();

  if (loading) return null;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Mascot className="h-36 w-36" ariaLabel={t.mascot.ariaLabel} />
        <p className="mt-4 text-lg text-espresso/70">
          {t.wishlist.empty}
        </p>
        <LinkButton href="/shop" className="mt-6">
          {t.wishlist.browseToys}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
