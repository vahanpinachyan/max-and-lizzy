"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/data/site";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/use-wishlist";
import { useHeaderVisibility } from "@/lib/use-scroll-direction";
import { Container } from "@/components/ui/Container";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { useTranslations, useI18n } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { localizeCategories } from "@/lib/i18n/localize-data";

export function Header() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();
  const { slugs: wishlistSlugs, openDrawer: openWishlistDrawer } = useWishlist();
  const pathname = usePathname();
  const { locale } = useI18n();
  const t = useTranslations();
  const categories = localizeCategories(locale);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuOpen = categoriesOpen || mobileOpen || languageOpen;
  const hiddenByScroll = useHeaderVisibility();
  const hidden = hiddenByScroll && !menuOpen;

  // Close any open menu on route change. Syncing to an external signal
  // (the URL) rather than a value derivable during render, so an effect
  // is the right tool here — there's no render-time equivalent.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategoriesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close the category menu on Escape (outside-click is handled by hover
  // leaving the nav wrapper instead, since the menu now opens on hover).
  useEffect(() => {
    if (!categoriesOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setCategoriesOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [categoriesOpen]);

  function openMenuNow() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setCategoriesOpen(true);
  }

  function closeMenuSoon() {
    // Small delay so moving the mouse diagonally from the "Shop" label down
    // into the panel below doesn't clip the gap and close the menu early.
    closeTimerRef.current = setTimeout(() => setCategoriesOpen(false), 150);
  }

  // CartDrawer is intentionally NOT rendered here (it lives as a sibling in
  // the root layout). A non-identity CSS transform — which this element
  // gets whenever `hidden` is true — becomes the containing block for any
  // `position: fixed` descendant, which would break the drawer's viewport
  // positioning as soon as the header hides itself on scroll.
  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 overscroll-x-none border-b border-tan/60 bg-cream/95 backdrop-blur"
    >
      <a href="#main-content" className="skip-link">
        {t.nav.skipToContent}
      </a>
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0" aria-label={`${site.name} home`}>
          <Image src="/images/logo.png" alt={`${site.name} logo`} width={813} height={560} priority className="h-12 w-auto sm:h-14" />
        </Link>

        <nav aria-label={t.nav.mainNavigation} className="hidden lg:flex items-center gap-1">
          <div
            className="relative"
            ref={navRef}
            onMouseEnter={openMenuNow}
            onMouseLeave={closeMenuSoon}
          >
            <Link
              href="/shop"
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige transition-colors"
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
              onFocus={openMenuNow}
            >
              {t.nav.shop}
              <motion.svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
                animate={{ rotate: categoriesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </Link>
            <AnimatePresence>
              {categoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 top-[calc(100%+0.75rem)] grid w-[560px] grid-cols-2 gap-4 rounded-2xl border border-tan/60 bg-white p-6 shadow-2xl"
                >
                  {categories.map((cat) => (
                    <div key={cat.slug}>
                      <Link
                        href={`/shop/${cat.slug}`}
                        className="font-semibold text-espresso hover:text-terracotta-dark"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      <ul className="mt-2 space-y-1">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/shop/${cat.slug}?sub=${sub.slug}`}
                              className="text-sm text-espresso/70 hover:text-terracotta-dark"
                              onClick={() => setCategoriesOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="col-span-2 border-t border-tan/60 pt-3">
                    <Link
                      href="/shop"
                      className="text-sm font-semibold text-terracotta-dark hover:underline"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      {t.nav.shopAllProducts}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/blog" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige transition-colors">
            {t.nav.blog}
          </Link>
          <Link href="/about" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige transition-colors">
            {t.nav.about}
          </Link>
          <Link href="/visit-us" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige transition-colors">
            {t.nav.visitUs}
          </Link>
          <Link href="/contact" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-espresso hover:bg-beige transition-colors">
            {t.nav.contact}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="flex h-10 w-10 items-center justify-center rounded-full text-espresso hover:bg-beige transition-colors"
            aria-label={t.nav.search}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            onClick={openWishlistDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full text-espresso hover:bg-beige transition-colors"
            aria-label={`${t.nav.wishlist}, ${wishlistSlugs.length} item${wishlistSlugs.length === 1 ? "" : "s"}`}
          >
            <span className="relative inline-flex">
              <HeartIcon filled={wishlistSlugs.length > 0} size={20} />
              {wishlistSlugs.length > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-terracotta px-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-cream">
                  {wishlistSlugs.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={openDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-full text-espresso hover:bg-beige transition-colors"
            aria-label={`${t.nav.cart}, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <span className="relative inline-flex">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path
                  d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="17" cy="20" r="1.5" fill="currentColor" />
              </svg>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-terracotta px-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-cream"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
          <LanguageSwitcher onOpenChange={setLanguageOpen} />
          <button
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full text-espresso hover:bg-beige transition-colors"
            aria-label={t.nav.openMenu}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            aria-label={t.nav.mobileNavigation}
            className="lg:hidden overflow-hidden border-t border-tan/60 bg-cream"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Container className="flex flex-col gap-1 py-4">
              <p className="px-2 pt-2 pb-1 text-xs font-bold uppercase text-espresso/70">{t.nav.shop}</p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/${cat.slug}`}
                  className="rounded-lg px-2 py-2 font-semibold text-espresso hover:bg-beige"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <div className="my-2 border-t border-tan/60" />
              <Link href="/blog" className="rounded-lg px-2 py-2 font-semibold text-espresso hover:bg-beige" onClick={() => setMobileOpen(false)}>
                {t.nav.blog}
              </Link>
              <Link href="/about" className="rounded-lg px-2 py-2 font-semibold text-espresso hover:bg-beige" onClick={() => setMobileOpen(false)}>
                {t.nav.about}
              </Link>
              <Link href="/visit-us" className="rounded-lg px-2 py-2 font-semibold text-espresso hover:bg-beige" onClick={() => setMobileOpen(false)}>
                {t.nav.visitUs}
              </Link>
              <Link href="/contact" className="rounded-lg px-2 py-2 font-semibold text-espresso hover:bg-beige" onClick={() => setMobileOpen(false)}>
                {t.nav.contact}
              </Link>
              <Link href="/wishlist" className="rounded-lg px-2 py-2 font-semibold text-espresso hover:bg-beige" onClick={() => setMobileOpen(false)}>
                {t.nav.wishlist}{wishlistSlugs.length > 0 ? ` (${wishlistSlugs.length})` : ""}
              </Link>
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {categoriesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 top-20 z-30 bg-espresso/20"
            onClick={() => setCategoriesOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}
