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

      {/* Bubbles are anchored by their bottom edge (where the tail is), just
          above each character's hair — so they grow upward with longer text
          instead of drifting away from the head. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-[78%] left-[21%] w-[10.5rem] -translate-x-1/2 transition-all duration-200 ${
          active === "max" ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="relative rounded-3xl border-2 border-sage/50 bg-cream px-4 py-2.5 text-xs font-semibold leading-snug text-espresso shadow-[0_4px_14px_rgba(61,43,31,0.15)]">
          {maxIntro}
          <span className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[2px] border-b-2 border-r-2 border-sage/50 bg-cream" />
        </div>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-[90%] left-[75%] w-[10.5rem] -translate-x-1/2 transition-all duration-200 ${
          active === "lizzy" ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="relative rounded-3xl border-2 border-rose/50 bg-cream px-4 py-2.5 text-xs font-semibold leading-snug text-espresso shadow-[0_4px_14px_rgba(61,43,31,0.15)]">
          {lizzyIntro}
          <span className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[2px] border-b-2 border-r-2 border-rose/50 bg-cream" />
        </div>
      </div>
    </div>
  );
}
