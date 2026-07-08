"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/lib/use-wishlist";
import { useWishlistProducts } from "@/lib/use-wishlist-products";
import { formatAmd } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { useTranslations, useI18n } from "@/lib/i18n/context";

export function WishlistDrawer() {
  const { isDrawerOpen, closeDrawer, toggle } = useWishlist();
  const { products, loading } = useWishlistProducts();
  const t = useTranslations();
  const { locale } = useI18n();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDrawerOpen) closeButtonRef.current?.focus();
  }, [isDrawerOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    if (isDrawerOpen) {
      document.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-espresso/40"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={t.wishlist.title}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-tan/60 px-6 py-4">
              <h2 className="text-xl font-bold text-espresso">{t.wishlist.title}</h2>
              <button
                ref={closeButtonRef}
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-beige transition-colors"
                aria-label={t.welcomeModal.close}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? null : products.length === 0 ? (
                <div className="mt-6 flex flex-col items-center text-center">
                  <Mascot className="h-28 w-28" />
                  <p className="mt-3 text-espresso/70">{t.wishlist.empty}</p>
                  <LinkButton href="/shop" size="sm" className="mt-4" onClick={closeDrawer}>
                    {t.wishlist.browseToys}
                  </LinkButton>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {products.map((product) => (
                      <motion.li
                        key={product.slug}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 overflow-hidden border-b border-tan/40 pb-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-beige">
                          <Image src={product.images[0]?.src} alt={product.images[0]?.alt ?? product.name} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-semibold text-espresso hover:text-terracotta-dark"
                            onClick={closeDrawer}
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-espresso/70">{formatAmd(product.priceAmd, locale)}</p>
                          <button
                            onClick={() => toggle(product.slug)}
                            className="mt-2 inline-flex items-center gap-1.5 text-sm text-espresso/70 hover:text-terracotta-dark"
                          >
                            <HeartIcon filled size={14} />
                            {t.cart.remove}
                          </button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {products.length > 0 && (
              <div className="border-t border-tan/60 px-6 py-4">
                <LinkButton href="/wishlist" variant="primary" className="w-full" size="lg" onClick={closeDrawer}>
                  {t.wishlist.viewWishlist}
                </LinkButton>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
