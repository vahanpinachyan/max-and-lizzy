"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { formatAmd } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Mascot";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotalAmd, discountAmd, totalAmd, promoCode } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { locale } = useI18n();
  const t = useTranslations();

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
            aria-label={t.cart.ariaLabel}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-tan/60 px-6 py-4">
              <h2 className="text-xl font-bold text-espresso">{t.cart.title}</h2>
              <button
                ref={closeButtonRef}
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-beige transition-colors"
                aria-label={t.cart.closeAriaLabel}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="mt-6 flex flex-col items-center text-center">
                  <Mascot className="h-28 w-28" />
                  <p className="mt-3 text-espresso/70">{t.cart.empty}</p>
                  <LinkButton href="/shop" size="sm" className="mt-4" onClick={closeDrawer}>
                    {t.cart.startShopping}
                  </LinkButton>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.slug}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 overflow-hidden border-b border-tan/40 pb-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-beige">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-semibold text-espresso hover:text-terracotta-dark"
                            onClick={closeDrawer}
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-espresso/70">{formatAmd(item.priceAmd, locale)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <label className="sr-only" htmlFor={`qty-${item.slug}`}>
                              {interpolate(t.cart.quantityForAria, { name: item.name })}
                            </label>
                            <div className="flex items-center rounded-full border border-tan">
                              <button
                                className="h-8 w-8 text-espresso"
                                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                                aria-label={interpolate(t.cart.decreaseAriaLabel, { name: item.name })}
                              >
                                −
                              </button>
                              <span id={`qty-${item.slug}`} className="w-8 text-center text-sm" aria-live="polite">
                                {item.quantity}
                              </span>
                              <button
                                className="h-8 w-8 text-espresso"
                                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                                aria-label={interpolate(t.cart.increaseAriaLabel, { name: item.name })}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.slug)}
                              className="text-sm text-espresso/70 hover:text-terracotta-dark underline"
                            >
                              {t.cart.remove}
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-tan/60 px-6 py-4">
                {promoCode && discountAmd > 0 ? (
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center justify-between text-sm text-espresso/70">
                      <span>{t.cart.subtotal}</span>
                      <span>{formatAmd(subtotalAmd, locale)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-sage-dark">
                      <span>{promoCode} {t.cart.discount.toLowerCase()}</span>
                      <span>−{formatAmd(discountAmd, locale)}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold text-espresso">
                      <span>{t.cart.total}</span>
                      <span>{formatAmd(totalAmd, locale)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center justify-between text-lg font-bold text-espresso">
                    <span>{t.cart.subtotal}</span>
                    <span>{formatAmd(subtotalAmd, locale)}</span>
                  </div>
                )}
                <LinkButton href="/cart" variant="primary" className="w-full" size="lg" onClick={closeDrawer}>
                  {t.cart.viewCart}
                </LinkButton>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
