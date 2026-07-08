"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import { formatAmd, ageRangeLabel } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslations, useI18n } from "@/lib/i18n/context";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { locale } = useI18n();
  const t = useTranslations();

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-espresso/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`${t.product.quickView}: ${product.name}`}
        className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 gap-6 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:grid-cols-2"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-beige transition-colors"
          aria-label={t.product.quickViewCloseAria}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-beige">
          <Image
            src={product.images[0]?.src}
            alt={product.images[0]?.alt ?? product.name}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 40vw, 90vw"
          />
        </div>
        <div>
          <div className="flex gap-2">
            <Badge variant="sage">{ageRangeLabel(product.ageRange, locale)}</Badge>
            {product.bestseller && <Badge variant="terracotta">{t.badges.bestseller}</Badge>}
          </div>
          <h2 className="mt-3 text-2xl font-bold text-espresso">{product.name}</h2>
          <p className="mt-2 text-espresso/70">{product.shortDescription}</p>
          <p className="mt-4 text-2xl font-bold text-espresso">{formatAmd(product.priceAmd, locale)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              disabled={!product.inStock}
              onClick={() => {
                addItem(product);
                onClose();
              }}
            >
              {product.inStock ? t.product.addToCart : t.product.soldOut}
            </Button>
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center font-semibold text-terracotta-dark hover:underline"
            >
              {t.product.viewFullDetails}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
