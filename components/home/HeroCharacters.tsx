"use client";

import { useState } from "react";
import Image from "next/image";

export function HeroCharacters({ maxIntro, lizzyIntro }: { maxIntro: string; lizzyIntro: string }) {
  const [active, setActive] = useState<"max" | "lizzy" | null>(null);

  return (
    <div className="relative aspect-square w-full max-w-[28rem] sm:max-w-[34rem] lg:max-w-[40rem]">
      <Image
        src="/images/hero-maxlizzy-transparent-v1.png"
        alt="Illustrated portraits of Max and Lizzy, the two children the store is named for"
        fill
        priority
        quality={95}
        className="object-contain"
        sizes="(min-width: 1024px) 45vw, 90vw"
      />

      <button
        type="button"
        aria-label={maxIntro}
        onMouseEnter={() => setActive("max")}
        onMouseLeave={() => setActive((v) => (v === "max" ? null : v))}
        onFocus={() => setActive("max")}
        onBlur={() => setActive((v) => (v === "max" ? null : v))}
        className="absolute left-[2%] top-[8%] h-[75%] w-[42%] cursor-pointer rounded-full"
      />
      <button
        type="button"
        aria-label={lizzyIntro}
        onMouseEnter={() => setActive("lizzy")}
        onMouseLeave={() => setActive((v) => (v === "lizzy" ? null : v))}
        onFocus={() => setActive("lizzy")}
        onBlur={() => setActive((v) => (v === "lizzy" ? null : v))}
        className="absolute right-[2%] top-0 h-[80%] w-[45%] cursor-pointer rounded-full"
      />

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute left-[2%] top-[2%] max-w-[11rem] origin-bottom-left rounded-2xl rounded-bl-sm border border-wood/30 bg-white px-3 py-2 text-xs font-medium text-espresso shadow-lg transition-all duration-200 ${
          active === "max" ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {maxIntro}
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute right-[0%] top-0 max-w-[11rem] origin-bottom-right rounded-2xl rounded-br-sm border border-rose/30 bg-white px-3 py-2 text-xs font-medium text-espresso shadow-lg transition-all duration-200 ${
          active === "lizzy" ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {lizzyIntro}
      </div>
    </div>
  );
}
