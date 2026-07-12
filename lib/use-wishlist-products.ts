"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { useWishlist } from "@/lib/use-wishlist";
import { useI18n } from "@/lib/i18n/context";

// The wishlist itself is just a list of slugs in localStorage — resolving
// those into full product objects has to go through an API route (Prisma
// only runs server-side), unlike Server Component pages which query the
// database directly.
export function useWishlistProducts() {
  const { slugs, pruneMissing } = useWishlist();
  const { locale } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(slugs.length > 0);

  useEffect(() => {
    // Nothing to fetch — the empty case is handled by the early return
    // below, derived at render time rather than via an extra setState here.
    if (slugs.length === 0) return;

    let cancelled = false;
    fetch(`/api/products?slugs=${slugs.map(encodeURIComponent).join(",")}&locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const fetched: Product[] = data.products ?? [];
        setProducts(fetched);
        // Slugs saved from a since-removed/renamed product never come back
        // from the API — drop them so the header badge count matches what's
        // actually shown here instead of counting phantom items forever.
        pruneMissing(fetched.map((p) => p.slug));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pruneMissing omitted: it's a stable-per-slugs callback, and including it would just re-run this effect for the same slugs after pruning (a no-op once converged) rather than changing behavior
  }, [slugs, locale]);

  if (slugs.length === 0) return { products: [], loading: false };
  return { products, loading };
}
