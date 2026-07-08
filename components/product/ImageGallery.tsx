"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/types";
import { useTranslations } from "@/lib/i18n/context";
import { interpolate } from "@/lib/i18n/interpolate";

export function ImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  const t = useTranslations();

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-beige">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3" role="tablist" aria-label={interpolate(t.product.imagesAria, { name: productName })}>
          {images.map((img, i) => (
            <button
              key={img.src}
              role="tab"
              aria-selected={i === active}
              aria-label={interpolate(t.product.showImageAria, { n: i + 1, count: images.length })}
              onClick={() => setActive(i)}
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
