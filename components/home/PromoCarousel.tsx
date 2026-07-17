"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";
import { localizePromotions } from "@/lib/i18n/localize-data";

const AUTOPLAY_MS = 6000;
const GESTURE_LOCK_MS = 700;

export function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { dict: t, locale } = useI18n();
  const promotions = localizePromotions(locale);
  const count = promotions.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gestureLocked = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count]);

  function lockGesture() {
    gestureLocked.current = true;
    setTimeout(() => {
      gestureLocked.current = false;
    }, GESTURE_LOCK_MS);
  }

  function handleWheel(e: React.WheelEvent) {
    // Trackpad horizontal swipe shows up as a wheel event with deltaX.
    // Ignore mostly-vertical scrolling and tiny jitters.
    if (Math.abs(e.deltaX) < 15 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (gestureLocked.current) return;
    lockGesture();
    if (e.deltaX > 0) next();
    else prev();
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) next();
    else prev();
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.home.promoRegionAria}
      className="relative overflow-hidden overscroll-x-none bg-beige"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {promotions.map((promo, i) => (
          <div
            key={promo.slug}
            className="group relative flex aspect-[16/6] min-h-[260px] w-full shrink-0 items-center overflow-hidden sm:aspect-[16/5]"
            aria-hidden={i !== index}
            role="group"
            aria-roledescription="slide"
            aria-label={interpolate(t.home.promoOfAria, { n: i + 1, count })}
          >
            <Image
              src={promo.image}
              alt=""
              fill
              priority={i === 0}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-espresso/60 via-espresso/20 to-transparent" />
            <div className="relative z-10 px-6 sm:px-20 lg:px-24">
              <p className="max-w-md text-2xl font-bold text-cream sm:text-3xl">{promo.title}</p>
              <p className="mt-2 max-w-sm text-sm text-cream/90 sm:text-base">{promo.subtitle}</p>
              <Link
                href={promo.href}
                tabIndex={i === index ? 0 : -1}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-2 text-sm font-semibold text-espresso transition-colors hover:bg-terracotta hover:text-white"
              >
                {promo.ctaLabel}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-espresso shadow hover:bg-cream sm:flex"
        aria-label={t.home.promoPrevAria}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-espresso shadow hover:bg-cream sm:flex"
        aria-label={t.home.promoNextAria}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label={t.home.promoSelectAria}>
        {promotions.map((promo, i) => (
          <button
            key={promo.slug}
            role="tab"
            aria-selected={i === index}
            aria-label={interpolate(t.home.promoShowAria, { n: i + 1, title: promo.title })}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-cream" : "w-2 bg-cream/50 hover:bg-cream/80"}`}
          />
        ))}
      </div>
    </section>
  );
}
