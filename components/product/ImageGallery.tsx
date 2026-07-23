"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
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

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-beige">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current.src}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-espresso shadow transition-colors hover:bg-cream"
              aria-label={t.product.prevImageAria}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream/90 text-espresso shadow transition-colors hover:bg-cream"
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
        <div className="mt-4 flex gap-3" role="tablist" aria-label={interpolate(t.product.imagesAria, { name: productName })}>
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
