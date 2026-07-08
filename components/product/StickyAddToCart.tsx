"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { formatAmd } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useTranslations, useI18n } from "@/lib/i18n/context";

export function StickyAddToCart({ product, targetId }: { product: Product; targetId: string }) {
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const t = useTranslations();
  const { locale } = useI18n();

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-tan/60 bg-white/95 backdrop-blur shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <Container className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-espresso">{product.name}</p>
          <p className="text-sm text-espresso/70">{formatAmd(product.priceAmd, locale)}</p>
        </div>
        <Button disabled={!product.inStock} onClick={() => addItem(product)} className="shrink-0">
          {product.inStock ? t.product.addToCart : t.product.soldOut}
        </Button>
      </Container>
    </div>
  );
}
