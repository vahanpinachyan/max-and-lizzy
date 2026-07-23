"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductImage } from "@/types";
import { useTranslations } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";

export function ImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = images[active] ?? images[0];
  const t = useTranslations();
  const hasMultiple = images.length > 1;
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + images.length) % images.length;
      setDirection(next > active || (active === images.length - 1 && next === 0) ? 1 : -1);
      setActive(next);
    },
    [active, images.length]
  );
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);
  const next = useCallback(() => goTo(active + 1), [goTo, active]);

  useEffect(() => {
    if (!hasMultiple) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, prev, next]);

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
    <div>
      <div
        className="group relative aspect-square touch-pan-y overflow-hidden rounded-3xl bg-beige"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current.src}
            custom={direction}
            initial={{ x: `${direction * 100}%` }}
            animate={{ x: "0%" }}
            exit={{ x: `${direction * -100}%` }}
            transition={{ type: "spring", stiffness: 380, damping: 42, mass: 0.9 }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              priority
              quality={95}
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </motion.div>
        </AnimatePresence>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-espresso opacity-100 shadow transition-opacity duration-200 hover:bg-cream sm:opacity-60 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              aria-label={t.product.prevImageAria}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-espresso opacity-100 shadow transition-opacity duration-200 hover:bg-cream sm:opacity-60 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              aria-label={t.product.nextImageAria}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
      {hasMultiple && (
        <div
          className="scrollbar-thin mt-4 flex gap-3 overflow-x-auto pb-2"
          role="tablist"
          aria-label={interpolate(t.product.imagesAria, { name: productName })}
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              role="tab"
              aria-selected={i === active}
              aria-label={interpolate(t.product.showImageAria, { n: i + 1, count: images.length })}
              onClick={() => goTo(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-beige ${
                i === active ? "border-terracotta" : "border-transparent"
              }`}
            >
              <Image src={img.src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
